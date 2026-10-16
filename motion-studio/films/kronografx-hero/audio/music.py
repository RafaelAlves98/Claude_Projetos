"""Kronografx hero — trilha (30 s, 120 BPM, Lá menor), sintetizada do zero.
Gera audio/music.wav (estéreo 48 kHz, em loop perfeito) e audio/beats.json (grid MEDIDO com librosa)."""
import json, os, sys
import numpy as np
import soundfile as sf
import librosa
from synth import *

HERE = os.path.dirname(os.path.abspath(__file__))
DUR, TAIL = 30.0, 3.0
L = DUR + TAIL
b = lambda i: i * BEAT                      # tempo de composição da batida i

# acordes por compasso (cada compasso = 4 batidas = 2 s)
AM9, FMAJ7 = [57, 60, 64, 67, 71], [53, 57, 60, 64]
AM, F, C, G = [57, 60, 64, 67], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]
CHORDS = [AM9, FMAJ7, AM, AM, AM, AM, F, C, G, AM, F, G, AM, F, G]
ROOTS = [33, 29, 33, 33, 33, 33, 29, 36, 31, 33, 29, 31, 33, 29, 31]

drums, bass, pad, keys, fx = (Track(L) for _ in range(5))
kick_times = []


def bar_of(i): return i // 4


# ---------------------------------------------------------------- 1) boas-vindas (compassos 1-2, batidas 0-7)
for i in range(0, 8):
    drums.add(kick(0.75, decay=0.26), b(i)); kick_times.append(b(i))
    drums.add(hat(0.35), b(i + 0.5), p=0.25)
    if i % 2 == 1: drums.add(clap(0.45), b(i), p=-0.05)
for k in range(2):
    pad.add(pad_chord(CHORDS[k], 2.0, 0.5, cutoff=1800, attack=0.4), b(4 * k))
    bass.add(bass_note(ROOTS[k], 1.9, 0.55, cutoff=500), b(4 * k))
    arp = sorted(CHORDS[k])
    seq = [arp[0] + 12, arp[2] + 12, arp[1] + 12, arp[3] + 12, arp[2] + 12, arp[-1] + 12, arp[3] + 12, arp[1] + 12]
    for s, m in enumerate(seq):
        keys.add(pluck(m, 0.5, 0.42), b(4 * k + s * 0.5), p=(-0.35 if s % 2 else 0.35))

# ---------------------------------------------------------------- 2) a dor (compassos 3-5, batidas 8-19): abafado, só o relógio
for i in range(8, 20):
    drums.add(tick(0.55, 3100 if i % 2 == 0 else 2300), b(i), p=(0.3 if i % 2 == 0 else -0.3))
    if i % 2 == 0 and i < 18:
        drums.add(lp(kick(0.7, decay=0.22), 160), b(i)); kick_times.append(b(i))
        drums.add(lp(kick(0.35, decay=0.18), 160), b(i + 0.3))      # "tum-tum": batimento
drone = pad_chord([45, 57, 60, 64], 6.0, 0.55, cutoff=520, detune=0.011, attack=0.6)
pad.add(drone * (1 + 0.15 * np.sin(2 * np.pi * 0.7 * tt(6.0))), b(8))
bass.add(lp(sine(midi(33), 6.0) * env_ar(6.0, 0.3, 0.4) * 0.5, 300), b(8))
# tensão: riser + caixa acelerando nas 2 últimas batidas, depois 1/4 de batida de silêncio
fx.add(riser(b(1.75), 0.75), b(18))
for s in range(14):
    tpos = 18 + s * (1.75 / 14) ** 1.0
    drums.add(lp(clap(0.12 + 0.05 * s), 5000), b(18) + (s / 14) ** 0.8 * b(1.75), p=0.0)

# ---------------------------------------------------------------- 3) a virada + showreel (compassos 6-11, batidas 20-43)
for i in range(20, 44):
    half = 36 <= i < 40                                  # meio tempo no anel 3D: bumbo só nos tempos pares
    if not half or i % 2 == 0: drums.add(kick(1.0), b(i)); kick_times.append(b(i))
    if i % 2 == 1 and i != 33: drums.add(clap(1.0 if half else 0.8), b(i), p=-0.05)   # b33: o toggle da UI fica sozinho
    if i == 31: continue                                 # break: meia batida sem chimbal antes da UI (b31,5–32)
    drums.add(hat(0.5, open_=True), b(i + 0.5), p=0.2)
    for s in (0.25, 0.75):
        drums.add(hat(0.22), b(i + s), p=-0.25)
for k in range(5, 11):
    pad.add(pad_chord(CHORDS[k], 2.0, 0.55, cutoff=3200, attack=0.05), b(4 * k))
    r = ROOTS[k]
    for s, off in enumerate([0, 0, 12, 0, 0, 12, 0, 12]):
        bass.add(bass_note(r + off, 0.23, 0.75, cutoff=1100), b(4 * k + s * 0.5))
    tones = sorted(CHORDS[k]); tones = [m + 12 for m in tones] + [tones[0] + 24]
    pattern = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 1, 3, 2, 4, 3, 1]
    for s, idx in enumerate(pattern):
        keys.add(pluck(tones[idx], 0.32, 0.30, bright=1.2), b(4 * k + s * 0.25), p=(0.45 if s % 2 else -0.45))
fx.add(subdrop(0.9), b(20)); fx.add(impact(0.65), b(20))

# ---------------------------------------------------------------- 4) cronômetro enchendo -> logo (compassos 12-13, batidas 44-51)
for i in range(44, 48):
    drums.add(kick(0.95), b(i)); kick_times.append(b(i))
    drums.add(hat(0.4, open_=True), b(i + 0.5), p=0.2)
for s in range(15):                                   # caixa em semicolcheias, crescendo, NO grid (b44 → b47,5)
    drums.add(clap((0.15 + 0.035 * s) * (0.5 if s < 8 else 1.0)), b(44 + s * 0.25), p=0.0)
pad.add(pad_chord(G, 2.0, 0.55, cutoff=2400, attack=0.3), b(44))
for s in range(8): bass.add(bass_note(31, 0.23, 0.7, cutoff=900 + 120 * s), b(44 + s * 0.5))
fx.add(riser(b(4.0), 0.9, f0=250, f1=11000), b(44))     # termina no impacto da trava (b48)
# trava do logo na batida 48
fx.add(impact(1.0), b(48)); fx.add(subdrop(1.0, 1.4), b(48))
drums.add(kick(1.0, decay=0.45), b(48)); kick_times.append(b(48))
drums.add(kick(0.8), b(50)); kick_times.append(b(50))
drums.add(clap(0.6), b(50)); drums.add(clap(0.5), b(51.5))
for i in range(48, 52): drums.add(hat(0.25), b(i + 0.5), p=0.25)
pad.add(pad_chord([45, 57, 60, 64, 69, 71], 2.0, 0.7, cutoff=4200, attack=0.02), b(48))
bass.add(bass_note(33, 1.9, 0.8, cutoff=700), b(48))
for m, beat in [(76, 48), (81, 48.5), (79, 49.5), (76, 50.5), (83, 51.0)]:
    keys.add(bell(m, 1.8, 0.55), b(beat), p=(0.25 if m % 2 else -0.25))

# ---------------------------------------------------------------- 5) convite e volta ao começo (compassos 14-15, batidas 52-59)
for i in range(52, 60):
    drums.add(kick(0.75 if i < 58 else 0.55, decay=0.26), b(i)); kick_times.append(b(i))
    if i < 58: drums.add(hat(0.32), b(i + 0.5), p=0.25)
    if i % 2 == 1 and i < 59: drums.add(clap(0.42), b(i), p=-0.05)
for k in (13, 14):
    pad.add(pad_chord(CHORDS[k], 2.0, 0.5, cutoff=1900 if k == 13 else 1300, attack=0.3), b(4 * k))
    bass.add(bass_note(ROOTS[k], 1.9, 0.55, cutoff=500), b(4 * k))
    arp = sorted(CHORDS[k])
    seq = [arp[0] + 12, arp[2] + 12, arp[1] + 12, arp[3] + 12, arp[2] + 12, arp[3] + 12, arp[1] + 12, arp[2] + 12]
    for s, m in enumerate(seq):
        keys.add(pluck(m, 0.5, 0.40 if k == 13 else 0.32), b(4 * k + s * 0.5), p=(-0.35 if s % 2 else 0.35))
rz = riser(b(1.0), 0.35, f0=600, f1=6000); rz[-samples(0.006):] *= np.linspace(1, 0, samples(0.006))   # sem corte seco na emenda
fx.add(rz, b(59))   # puxa de volta para o começo (loop)

# ---------------------------------------------------------------- mix da trilha
sc = sidechain(L, kick_times, depth=0.55, release=0.13)[:, None]
pad.buf *= sc; bass.buf *= (0.35 + 0.65 * sc)
IR = make_ir(2.0, 0.6, 6000)
bus = (drums.buf * 0.9 + bass.buf * 0.8 + pad.buf * 0.55 + keys.buf * 0.65 + fx.buf * 0.7)
bus += reverb(keys.buf * 0.65 + pad.buf * 0.3 + drums.buf * 0.12, IR, wet=0.32)
# a timeline (b40–41) começa abafada e o filtro abre, como quem aperta o play
s0, s1 = samples(b(40)), samples(b(41))
seg = bus[s0:s1]
filt = np.stack([sweep_lp(seg[:, ch], 450, 16000, curve=0.6) for ch in (0, 1)], axis=1)
xf = samples(0.02); w = np.ones(len(seg)); w[-xf:] = np.linspace(1, 0, xf)
bus[s0:s1] = filt * w[:, None] + seg * (1 - w[:, None])
bus = hp(bus, 28, 2)
# silêncio seco de 1/4 de batida antes da virada (b19,75 → b20): corta até as caudas de reverb
def mute(a, z, fade=0.005):
    t = tt(L); g = np.ones(len(t))
    g[(t >= a) & (t < z)] = 0
    for c, s in [(a, -1), (z, 1)]:
        m = np.abs(t - c) < fade
        g[m] = np.clip(0.5 + s * (t[m] - c) / (2 * fade), 0, 1) if s > 0 else np.clip(0.5 - (t[m] - c) / (2 * fade), 0, 1)
    return g[:, None]
bus *= mute(b(19.75), b(20))



# loop perfeito: a cauda depois dos 30 s volta para o começo
n = samples(DUR)
music = bus[:n].copy(); music[: len(bus) - n] += bus[n:]
music /= np.max(np.abs(music)) * 1.12
sf.write(os.path.join(HERE, "music.wav"), music.astype(np.float32), SR, subtype="FLOAT")


# ---------------------------------------------------------------- grid de batidas MEDIDO (librosa)
y = librosa.to_mono(music.T.astype(np.float32))
y22 = librosa.resample(y, orig_sr=SR, target_sr=22050)
tempo, frames = librosa.beat.beat_track(y=y22, sr=22050, start_bpm=120, tightness=300)
coarse = librosa.frames_to_time(frames, sr=22050)
# o beat tracker marca o pico da energia (~20-40 ms depois do ataque). Refina cada batida para o INÍCIO do
# ataque mais próximo, com onsets em alta resolução (hop de 64 amostras = 1,3 ms) e backtrack.
on = librosa.onset.onset_detect(y=y, sr=SR, hop_length=64, backtrack=True, units="time")
measured = []
for c in coarse:
    near = on[(on > c - 0.08) & (on <= c + 0.01)]
    if len(near): measured.append(near[np.argmin(np.abs(near - (c - 0.03)))])
measured = np.array(measured)
# ajusta uma reta (início + período) às batidas medidas, casando cada uma com o índice mais próximo do grid
idx = np.round(measured / BEAT).astype(int)
A = np.stack([np.ones_like(idx), idx], axis=1).astype(float)
(offset, period), *_ = np.linalg.lstsq(A, measured, rcond=None)
grid = [float(offset + i * period) for i in range(int(DUR / BEAT) + 1)]
resid = measured - (offset + idx * period)
out = {"bpm_medido": float(60 / period), "offset_s": float(offset), "periodo_s": float(period),
       "batidas_detectadas": int(len(measured)), "erro_medio_ms": float(np.mean(np.abs(resid)) * 1000),
       "beats": grid}
json.dump(out, open(os.path.join(HERE, "beats.json"), "w"), indent=1)
print(f"music.wav ok · tempo medido {out['bpm_medido']:.2f} BPM · início {offset*1000:.1f} ms · "
      f"{len(measured)} batidas detectadas · erro médio {out['erro_medio_ms']:.1f} ms")

# beats.js: o mesmo grid medido, para o film.html (window.BEATS)
with open(os.path.join(HERE, "..", "beats.js"), "w") as fh:
    fh.write("window.BEATS = " + json.dumps({k: out[k] for k in ("bpm_medido", "offset_s", "periodo_s")}) + ";\n")
