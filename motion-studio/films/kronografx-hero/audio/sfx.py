"""Kronografx hero — efeitos sonoros sintetizados, um por evento visual.
Os eventos (out/cues-<formato>.json) saem do próprio film.js: mesma posição em batidas que a animação,
convertida para segundos pelo grid MEDIDO (beats.json). Nenhum sample: tudo é oscilador, ruído e filtro."""
import numpy as np
from synth import *

RNG2 = np.random.default_rng(777)


def mixl(*xs):
    """soma camadas mono de durações diferentes (completa com zeros)"""
    n = max(len(x) for x in xs); out = np.zeros(n)
    for x in xs: out[: len(x)] += x
    return out


def nz(d):
    return RNG2.standard_normal(samples(d))


def env_d(d, decay, attack=0.001):
    return env_exp(d, decay, attack)


def click(level=1.0, hp_f=2500, d=0.006):
    return hp(nz(d), hp_f) * env_d(d, d / 4, 0.0002) * level


def glide(f0, f1, d, curve=1.0):
    t = tt(d); u = (t / d) ** curve
    return f0 * (f1 / f0) ** u


def tone(freq, d, decay, level=1.0, attack=0.002):
    return sine(freq, d) * env_d(d, decay, attack) * level


# ---------------------------------------------------------------- vozes (cada uma devolve mono ou estéreo)
def v_pop(v, f=1.0, **_):
    return mixl(pop(v, 900 * f, 190 * f, 0.13), click(0.25 * v, 3000))


def v_ping(v, **_):
    return tone(1760, 0.9, 0.35, v) + tone(2637, 0.9, 0.2, v * 0.4)


def v_stretch(v, d=0.5, f=1.0, **_):
    dur = max(d * BEAT, 0.08); t = tt(dur)
    fr = glide(260 * f, 620 * f, dur, 1.6) * (1 + 0.012 * np.sin(2 * np.pi * 9 * t))
    return sine(fr, dur) * env_ar(dur, 0.02, 0.05) * v * 0.6


def v_zip(v, d=0.3, f=1.0, **_):
    dur = d * BEAT + 0.06
    n = sweep_bp(nz(dur), 700 * f, 7000 * f, width=0.7, curve=0.8) * 1.6
    t = tt(dur); shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2
    tonal = sine(glide(500 * f, 1400 * f, dur, 0.7), dur) * 0.25
    return (n + tonal) * shape * v


def v_tock(v, f=1.0, **_):
    return mixl(tone(820 * f, 0.12, 0.035, v), tone(1640 * f, 0.12, 0.015, 0.3 * v), bp(nz(0.01), 1500, 5000) * env_d(0.01, 0.002) * 0.4 * v)


def v_blip(v, f=1.0, **_):
    return lp(blip(1.0, 1800 * f, 0.05), 6000) * v * 2.2


def v_whoosh(v, d=0.5, f=1.0, **_):
    return whoosh(max(d * BEAT, 0.12), v * 0.9, 380 * f, 3800 * f, 800 * f)


def v_thup(v, **_):
    d = 0.12; t = tt(d)
    body = sine(glide(150, 70, d, 0.5), d) * env_d(d, 0.035, 0.001)
    return (body + lp(nz(d), 900) * env_d(d, 0.01) * 0.3) * v


def v_scribble(v, d=0.45, **_):
    dur = d * BEAT; t = tt(dur)
    am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 23 * t + 3 * np.sin(2 * np.pi * 5 * t)))
    x = bp(nz(dur), 1800, 6500) * lp(am, 120) * env_ar(dur, 0.01, 0.06)
    return x * v * 0.9


def v_bloop(v, **_):
    d = 0.16; return sine(glide(280, 980, d, 0.6), d) * env_d(d, 0.07, 0.003) * v


def v_ratchet(v, **_):
    d = 0.012; return mixl(hp(nz(d), 3000) * env_d(d, 0.0015) * 0.8, tone(4200, d, 0.002)) * v


def v_clack(v, **_):
    d = 0.35; t = tt(d)
    mod = np.sin(2 * np.pi * 1340 * 2.76 * t) * 3.0 * np.exp(-t / 0.05)
    metal = np.sin(2 * np.pi * 1340 * t + mod) * np.exp(-t / 0.08)
    return mixl(metal * 0.5, click(0.9, 1800, 0.01), lp(nz(d), 3000) * env_d(d, 0.012) * 0.5) * v


def v_flick(v, f=1.0, **_):
    d = 0.18
    return mixl(sweep_bp(nz(d), 1500 * f, 7000 * f, width=0.8) * np.sin(np.pi * tt(d) / d) ** 1.5 * 1.4, click(0.3, 3000)) * v


def v_glitch(v, d=0.5, **_):
    dur = d * BEAT; n = samples(dur); x = np.zeros(n)
    step = samples(BEAT / 16); r = np.random.default_rng(1450)
    for i in range(0, n, step):
        if r.random() < 0.35: continue
        seg = min(step, n - i); kind = r.integers(0, 3)
        if kind == 0: s = np.sign(np.sin(2 * np.pi * r.choice([110, 220, 880, 1760]) * tt(seg / SR)))
        elif kind == 1: s = r.standard_normal(seg)
        else: s = np.repeat(r.standard_normal(seg // 24 + 1), 24)[:seg]
        x[i:i + seg] = s * (0.4 + 0.6 * r.random())
    x = lp(x, 7000) * env_ar(dur, 0.002, 0.04)
    return np.round(x * 6) / 6 * v * 0.7


def v_fall(v, d=1.0, **_):
    dur = d * BEAT; t = tt(dur)
    tonal = sine(glide(900, 110, dur, 0.8), dur) * 0.35
    n = sweep_bp(nz(dur), 4000, 300, width=0.8, curve=0.7)
    return (tonal + n * 1.2) * env_ar(dur, 0.03, 0.12) * v


def v_bonk(v, **_):
    d = 0.08; return mixl(lp(np.sign(sine(220, d)), 2200) * env_d(d, 0.03) * 0.6, click(0.6, 1500)) * v


def v_flip(v, **_):
    a = tick(0.7, 3300); b = tick(0.55, 2500); out = np.zeros(samples(0.08))
    out[: len(a)] += a; s = samples(0.028); out[s:s + len(b)] += b[: len(out) - s]
    return out * v


def v_swish(v, d=0.5, **_):
    return whoosh(max(d * BEAT, 0.12), v * 0.6, 600, 2600, 900)


def v_thud(v, **_):
    return lp(kick(1.0, decay=0.09, punch=0.6), 900) * v * 0.8


def v_morph(v, d=0.55, **_):
    dur = d * BEAT + 0.05; t = tt(dur)
    fr = 180 + 260 * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8
    body = sine(fr, dur) * 0.5 + sine(fr * 2.01, dur) * 0.18
    air = sweep_bp(nz(dur), 600, 3000, width=0.9) * 0.9
    return (body + air) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.3 * v


def v_tic(v, f=1.0, **_):
    return tick(v, 3400 * f)


def v_boing(v, **_):
    d = 0.55; t = tt(d)
    fr = 170 * (1 + 0.35 * np.exp(-t / 0.12) * np.sin(2 * np.pi * 14 * t))
    return (sine(fr, d) + 0.25 * sine(fr * 2, d)) * env_d(d, 0.18, 0.002) * v


def v_swipe(v, **_):
    d = 0.035; return bp(nz(d), 2500, 9000) * env_d(d, 0.01, 0.001) * v * 1.5


def v_type(v, f=1.0, **_):
    d = 0.04; out = np.zeros(samples(d)); k = hp(nz(0.008), 2000 * f) * env_d(0.008, 0.0015) * 0.9
    out[: len(k)] += k
    return out * v + tone(130 * f, d, 0.01, 0.35 * v)


def v_toggle(v, **_):
    out = np.zeros(samples(0.12)); a = mixl(click(0.8, 2000, 0.005), tone(1900, 0.012, 0.002, 0.4)); b = mixl(click(0.6, 2500, 0.005), tone(2600, 0.012, 0.002, 0.4))
    out[: len(a)] += a; s = samples(0.05); out[s:s + len(b)] += b
    return out * v


def v_click(v, **_):
    d = 0.06
    return mixl(click(1.0, 1500, 0.004), tone(2200, d, 0.004, 0.5), tone(160, d, 0.012, 0.6)) * v


def v_spin(v, d=0.9, **_):
    dur = d * BEAT; t = tt(dur)
    return bp(nz(dur), 900, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * env_ar(dur, 0.05, 0.08) * v


def v_chime(v, **_):
    a = bell(88, 1.4, 0.8, ratio=2.0, index=1.2); b = bell(95, 1.4, 0.7, ratio=2.0, index=1.2)
    out = np.zeros(samples(1.6)); out[: len(a)] += a; s = samples(0.085); out[s:s + len(b)] += b[: len(out) - s]
    return out * v


def v_rotate(v, d=0.36, **_):
    w = whoosh(max(d * BEAT, 0.12), 0.7, 300, 2200, 600); th = v_thud(0.6)
    out = np.zeros(len(w) + len(th)); out[: len(w)] += w; s = int(len(w) * 0.55); out[s:s + len(th)] += th
    return out * v


def v_snap(v, **_):
    return mixl(click(1.0, 2200, 0.004), tone(120, 0.1, 0.03, 0.8), tone(3100, 0.08, 0.02, 0.25)) * v


def v_swirl(v, d=0.65, **_):
    dur = d * BEAT; x = whoosh(dur, 1.0, 300, 3000, 700); t = tt(len(x) / SR)
    p = np.sin(2 * np.pi * 1.5 * t / (len(x) / SR))
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1) * v


def v_tick(v, f=1.0, **_):
    return tick(v, 2400 * f)


def v_suck(v, d=0.3, **_):
    dur = max(d * BEAT, 0.1); t = tt(dur)
    n = sweep_bp(nz(dur), 300, 5000, width=0.8, curve=1.5)
    return n * (t / dur) ** 2.5 * v * 1.4


def v_lock(v, **_):
    d = 0.9; t = tt(d)
    mod = np.sin(2 * np.pi * 620 * 1.41 * t) * 2.2 * np.exp(-t / 0.12)
    metal = np.sin(2 * np.pi * 620 * t + mod) * np.exp(-t / 0.25) * 0.45
    return mixl(metal, click(1.0, 1200, 0.012), lp(nz(d), 2500) * env_d(d, 0.03) * 0.6, tone(55, d, 0.25, 0.8)) * v


def v_shimmer(v, d=0.42, **_):
    dur = d * BEAT + 0.3
    n = sweep_bp(nz(dur), 5000, 12000, width=0.5) * env_ar(dur, 0.05, 0.25) * 0.8
    return n * v + (bell(100, dur, 0.25) + bell(107, dur, 0.18))[: len(n)] * v


VOICES = {k[2:]: f for k, f in globals().items() if k.startswith("v_")}


def render(cues, offset, period, dur=30.0, tail=3.0):
    tr = Track(dur + tail)
    for c in cues:
        fn = VOICES[c["k"]]
        x = fn(c.get("v", 0.5), **{k: c[k] for k in ("d", "f") if k in c})
        tr.add(np.asarray(x, dtype=np.float64), offset + c["x"] * period, p=c.get("p", 0.0))
    return tr.buf
