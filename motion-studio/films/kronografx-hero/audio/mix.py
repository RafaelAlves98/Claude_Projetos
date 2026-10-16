"""Kronografx hero — mixagem final: trilha + efeitos, loudness −14 LUFS (BS.1770) e pico verdadeiro ≤ −1 dBTP.
Gera out/audio-<formato>.wav (24 bits, 48 kHz, em loop perfeito). Uso: python mix.py [16x9|9x16 ...]"""
import json, os, sys
import numpy as np
import soundfile as sf
from scipy import signal, ndimage
from synth import SR, samples, tt, db
import sfx

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "out")
DUR = 30.0
TARGET, CEIL = -14.0, -1.0


def k_weight(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)


def lufs(x):
    y = k_weight(x); blk, hop = samples(0.4), samples(0.1)
    ms = np.array([np.mean(y[i:i + blk] ** 2, axis=0).sum() for i in range(0, len(y) - blk + 1, hop)])
    lk = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[lk > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ms[(lk > -70) & (lk > rel)]
    return -0.691 + 10 * np.log10(g2.mean())


def true_peak(x):
    return 20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1, axis=0))) + 1e-12)


def limiter(x, ceil_db=CEIL - 0.3, look=0.002, rel=0.09):
    c = db(ceil_db)
    os4 = np.abs(signal.resample_poly(x, 4, 1, axis=0)).max(axis=1)
    n = len(x); pk = os4[: n * 4].reshape(n, 4).max(axis=1)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    g = ndimage.minimum_filter1d(g, size=2 * samples(look) + 1)
    a = np.exp(-1.0 / (rel * SR)); out = np.empty_like(g); prev = 1.0
    for i in range(n):                       # ataque instantâneo (já antecipado), soltura suave
        gi = g[i]; prev = gi if gi < prev else gi + (prev - gi) * a; out[i] = prev
    return x * out[:, None]


def wrap(x):                                 # o que passa dos 30 s volta somado ao começo (loop)
    n = samples(DUR); y = x[:n].copy(); y[: len(x) - n] += x[n:]; return y


def gap(x, a, z, fade=0.005):                # o mesmo silêncio seco da trilha (b19,75 → b20)
    t = tt(len(x) / SR); g = np.ones(len(t))
    g[(t >= a) & (t < z)] = 0
    m = np.abs(t - a) < fade; g[m] = np.clip(0.5 - (t[m] - a) / (2 * fade), 0, 1)
    m = np.abs(t - z) < fade; g[m] = np.clip(0.5 + (t[m] - z) / (2 * fade), 0, 1)
    return x * g[:, None]


music, sr = sf.read(os.path.join(HERE, "music.wav"), always_2d=True)
assert sr == SR and abs(len(music) / SR - DUR) < 1e-6
beats = json.load(open(os.path.join(HERE, "beats.json")))
off, per = beats["offset_s"], beats["periodo_s"]
Lm = lufs(music)
for fmt in (sys.argv[1:] or ["16x9", "9x16"]):
    cues = json.load(open(os.path.join(OUT, f"cues-{fmt}.json")))["cues"]
    fx = sfx.render(cues, off, per, DUR, 3.0)
    fx = wrap(gap(fx, off + 19.75 * per, off + 20 * per))
    Lf = lufs(fx)
    gfx = db((Lm - 5.0) - Lf)               # efeitos 5 LU abaixo da trilha: presentes, sem brigar com a música
    # ducking: a trilha abaixa 6 dB por 80 ms nos gestos de interface, para o clique aparecer
    duck = np.ones(len(music))
    for cu in cues:
        if cu["k"] in ("toggle", "click", "spin", "type"):
            t0 = off + cu["x"] * per; i0 = samples(t0); n0 = samples(0.08); r0 = samples(0.03)
            env = np.concatenate([np.full(n0, db(-6)), np.linspace(db(-6), 1, r0)])
            seg = duck[max(0, i0): i0 + len(env)]; duck[max(0, i0): i0 + len(env)] = np.minimum(seg, env[: len(seg)])
    mixd = music * duck[:, None] + fx * gfx
    g = db(TARGET - lufs(mixd)); y = mixd * g
    for _ in range(4):                      # ganho → limitador → mede de novo
        y = limiter(y)
        dl = TARGET - lufs(y)
        if abs(dl) < 0.05 and true_peak(y) <= CEIL: break
        y = y * db(dl)
    y = limiter(y)
    ramp = samples(0.003); y[:ramp] *= np.linspace(0, 1, ramp)[:, None]; y[-ramp:] *= np.linspace(1, 0, ramp)[:, None]   # emenda do loop sem estalo
    path = os.path.join(OUT, f"audio-{fmt}.wav")
    sf.write(path, y.astype(np.float32), SR, subtype="PCM_24")
    print(f"{fmt}: {len(cues)} efeitos · trilha {Lm:.1f} LUFS · efeitos {Lf:.1f}→{Lf + 20*np.log10(gfx):.1f} LUFS · "
          f"final {lufs(y):.2f} LUFS · pico verdadeiro {true_peak(y):.2f} dBTP → {os.path.relpath(path, HERE)}")
