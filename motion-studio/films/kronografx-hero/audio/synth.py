"""Kronografx hero — biblioteca de síntese (tudo gerado por matemática, nenhum sample).
Estéreo float32 em SR Hz. Todas as funções devolvem arrays mono (n,) ou estéreo (n, 2)."""
import numpy as np
from scipy import signal

SR = 48000
BPM = 120.0
BEAT = 60.0 / BPM          # 0,5 s
RNG = np.random.default_rng(20261016)   # ruído com semente: o som é sempre o mesmo


def secs(n): return n / SR
def samples(t): return int(round(t * SR))
def tt(dur): return np.arange(samples(dur)) / SR
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)


# ---------------------------------------------------------------- osciladores
def polyblep_saw(freq, dur, phase0=0.0):
    """Dente-de-serra com polyBLEP (sem aliasing audível). freq pode ser escalar ou array."""
    n = samples(dur)
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    p = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * p - 1
    a = p < dt
    tA = p[a] / dt[a]; y[a] -= tA + tA - tA * tA - 1
    b = p > 1 - dt
    tB = (p[b] - 1) / dt[b]; y[b] -= tB * tB + tB + tB + 1
    return y


def sine(freq, dur, phase0=0.0):
    n = samples(dur)
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f) / SR))


def noise(dur):
    return RNG.standard_normal(samples(dur))


# ---------------------------------------------------------------- envelopes
def env_exp(dur, decay, attack=0.002):
    t = tt(dur)
    e = np.exp(-t / decay)
    if attack > 0:
        e *= np.clip(t / attack, 0, 1)
    return e


def env_ar(dur, attack, release):
    """Sobe em 'attack', segura e cai nos últimos 'release' segundos."""
    t = tt(dur)
    e = np.clip(t / max(attack, 1e-4), 0, 1)
    e *= np.clip((dur - t) / max(release, 1e-4), 0, 1)
    return e


# ---------------------------------------------------------------- filtros
def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, f1, f2, order=2):
    return signal.sosfilt(signal.butter(order, [f1, min(f2, SR * 0.45)], "band", fs=SR, output="sos"), x, axis=0)


def sweep_bp(x, f_start, f_end, width=0.6, block=256, curve=1.0):
    """Passa-banda com frequência central variando no tempo (riser/whoosh)."""
    out = np.zeros_like(x)
    n = len(x); zi = None
    for i in range(0, n, block):
        u = (i / max(n - 1, 1)) ** curve
        fc = f_start * (f_end / f_start) ** u
        lo, hi = fc * (1 - width / 2), min(fc * (1 + width / 2), SR * 0.45)
        sos = signal.butter(2, [max(lo, 20), hi], "band", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        seg, zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
        out[i:i + block] = seg
    return out


def sweep_lp(x, f_start, f_end, block=256, curve=1.0):
    out = np.zeros_like(x); n = len(x); zi = None
    for i in range(0, n, block):
        u = (i / max(n - 1, 1)) ** curve
        fc = f_start * (f_end / f_start) ** u
        sos = signal.butter(2, min(fc, SR * 0.45), "low", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        seg, zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
        out[i:i + block] = seg
    return out


# ---------------------------------------------------------------- espaço
def pan(x, p):
    """p em [-1, 1], lei de potência constante."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def make_ir(seconds=1.8, decay=0.55, tone=6500, predelay=0.012):
    """Resposta ao impulso sintética (sala), estéreo e decorrelacionada."""
    n = samples(seconds); t = np.arange(n) / SR
    env = np.exp(-t / decay)
    ir = np.stack([RNG.standard_normal(n) * env, RNG.standard_normal(n) * env], axis=1)
    ir = lp(ir, tone, 1)
    ir[: samples(predelay)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    return ir


def reverb(x_st, ir, wet=0.25):
    y = np.stack([signal.fftconvolve(x_st[:, c], ir[:, c])[: len(x_st)] for c in range(2)], axis=1)
    return y * wet


# ---------------------------------------------------------------- instrumentos
def kick(level=1.0, decay=0.30, punch=1.0):
    d = 0.6; t = tt(d)
    f = 44 + 118 * np.exp(-t / 0.035) * punch + 30 * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    click = hp(noise(0.006), 2500) * 0.5
    body[: len(click)] += click * np.exp(-np.arange(len(click)) / 80)
    return np.tanh(body * 1.6) * level


def clap(level=1.0):
    d = 0.4; out = np.zeros(samples(d))
    for k, off in enumerate([0.0, 0.009, 0.018, 0.027]):
        n = noise(0.02 if k < 3 else 0.32)
        e = env_exp(len(n) / SR, 0.006 if k < 3 else 0.09, 0.0005)
        s = samples(off); out[s:s + len(n)] += (n * e)[: len(out) - s]
    return bp(out, 900, 3200) * 1.8 * level


def hat(level=1.0, open_=False):
    d = 0.35 if open_ else 0.08
    x = hp(noise(d), 7200, 2) * env_exp(d, 0.11 if open_ else 0.022, 0.0005)
    return x * level * 0.9


def tick(level=1.0, freq=3100.0):
    d = 0.05; t = tt(d)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.008) + hp(noise(d), 4000) * np.exp(-t / 0.002) * 0.4
    return x * level


def bass_note(m, dur, level=1.0, cutoff=900, sub=0.7):
    f = midi(m)
    saw = polyblep_saw(f, dur) * 0.6 + polyblep_saw(f * 1.004, dur) * 0.4
    t = tt(dur)
    fenv_x = sweep_lp(saw, cutoff * 2.2, cutoff * 0.6, curve=0.5)
    body = fenv_x + sine(f, dur) * sub
    return np.tanh(body * 1.3) * env_ar(dur, 0.004, 0.03) * level


def pad_chord(notes, dur, level=1.0, cutoff=2400, detune=0.006, attack=0.25):
    x = np.zeros(samples(dur))
    for i, m in enumerate(notes):
        f = midi(m)
        for d in (-detune, 0.0, detune):
            x += polyblep_saw(f * (1 + d), dur, phase0=(i * 0.37 + d * 50) % 1)
    x = lp(x / (3 * len(notes)), cutoff, 2)
    return x * env_ar(dur, attack, min(0.35, dur * 0.4)) * level


def pluck(m, dur=0.45, level=1.0, bright=1.0):
    f = midi(m); t = tt(dur); x = np.zeros(len(t))
    for k in range(1, 14):
        if f * k > SR * 0.42: break
        x += np.sin(2 * np.pi * f * k * t + k * 0.7) * (1 / k ** (1.15 / bright)) * np.exp(-t * (5 + 2.4 * k ** 0.9 / bright))
    return x * np.clip(t / 0.002, 0, 1) * level * 0.5


def bell(m, dur=1.6, level=1.0, ratio=3.5, index=2.4):
    f = midi(m); t = tt(dur)
    mod = np.sin(2 * np.pi * f * ratio * t) * index * np.exp(-t / 0.35)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.7) * np.clip(t / 0.003, 0, 1)
    return x * level * 0.55


def riser(dur, level=1.0, f0=300, f1=9000):
    x = sweep_bp(noise(dur), f0, f1, width=0.9, curve=1.6)
    t = tt(dur)
    tone = sine(np.linspace(midi(57), midi(81), len(t)), dur) * 0.15
    return (x * 1.4 + tone) * (t / dur) ** 2.2 * level


def impact(level=1.0):
    d = 1.6; t = tt(d)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-t / 0.09)) / SR) * np.exp(-t / 0.55)
    crack = lp(noise(d), 4200) * np.exp(-t / 0.18) * 0.6
    return np.tanh((sub + crack) * 1.5) * level


def whoosh(dur=0.45, level=1.0, f0=500, f1=4500, f_end=900):
    n = noise(dur); half = len(n) // 2
    up = sweep_bp(n[:half], f0, f1, width=0.8)
    down = sweep_bp(n[half:], f1, f_end, width=0.8)
    x = np.concatenate([up, down])
    t = tt(len(x) / SR)
    shape = np.sin(np.pi * np.clip(t / (len(x) / SR), 0, 1)) ** 1.6
    return x * shape * level * 1.6


def pop(level=1.0, f0=900, f1=180, dur=0.12):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.018)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04) * level


def blip(level=1.0, freq=1800, dur=0.035):
    t = tt(dur)
    return np.sign(np.sin(2 * np.pi * freq * t)) * np.exp(-t / 0.008) * level * 0.25


def subdrop(level=1.0, dur=1.0):
    t = tt(dur)
    f = 30 + 70 * np.exp(-t / 0.25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * level


# ---------------------------------------------------------------- montagem
class Track:
    def __init__(self, dur):
        self.buf = np.zeros((samples(dur), 2))

    def add(self, x, t, p=0.0, gain=1.0):
        st = x if x.ndim == 2 else pan(x, p)
        s = samples(t)
        if s >= len(self.buf): return
        if s < 0: st = st[-s:]; s = 0
        e = min(len(self.buf), s + len(st))
        self.buf[s:e] += st[: e - s] * gain


def sidechain(dur, kick_times, depth=0.6, release=0.14):
    t = tt(dur); g = np.ones(len(t))
    for k in kick_times:
        m = t >= k
        g[m] = np.minimum(g[m], 1 - depth * np.exp(-(t[m] - k) / release))
    return g
