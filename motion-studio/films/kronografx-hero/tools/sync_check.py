"""Checagem objetiva de sincronia: ataques do áudio × picos de mudança na imagem (quadro a quadro, 60 fps).
Uso: python tools/sync_check.py out/preview-16x9.mp4"""
import subprocess, sys, json
import numpy as np, librosa

path = sys.argv[1]
W, H, FPS = 160, 90, 60
if "9x16" in path: W, H = 90, 160
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
v = np.r_[0, np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))]          # energia de mudança visual por quadro
vo = np.maximum(0, np.r_[0, np.diff(v)])                               # "ataque" visual: a mudança começa/aumenta
au = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], capture_output=True).stdout
y = np.frombuffer(au, np.float32)
hop = 48000 // FPS                                                     # 800 amostras = 1 quadro
ao = librosa.onset.onset_strength(y=y, sr=48000, hop_length=hop, n_fft=2048)
n = min(len(vo), len(ao)); vo, ao = vo[:n], ao[:n]
z = lambda a: (a - a.mean()) / (a.std() + 1e-9)
lags = range(-8, 9)
cc = [float(np.mean(z(ao)[max(0, -L):n - max(0, L)] * z(vo)[max(0, L):n - max(0, -L)])) for L in lags]
best = list(lags)[int(np.argmax(cc))]
# ataques fortes do áudio: há um evento visual a até ±2 quadros?
on = librosa.onset.onset_detect(onset_envelope=ao, sr=48000, hop_length=hop, units="frames", backtrack=False)
strong = [o for o in on if ao[o] > np.percentile(ao[on], 40)]
thr = np.percentile(vo, 75)
hit = [o for o in strong if vo[max(0, o - 2):o + 3].max() > thr]
print(json.dumps({"quadros": int(n), "melhor_defasagem_quadros": best, "correlacao_em_0": round(cc[8], 3), "correlacao_max": round(max(cc), 3),
                  "ataques_fortes": len(strong), "com_evento_visual_a_2q": len(hit), "taxa": round(len(hit) / max(1, len(strong)), 3)}, ensure_ascii=False))
# para cada ataque forte, o pico visual mais próximo (±3 quadros): diferença em quadros (+ = som depois da imagem)
offs = []
for o in strong:
    lo, hi = max(0, o - 3), min(n, o + 4); w = vo[lo:hi]
    if w.max() > thr: offs.append(o - (lo + int(np.argmax(w))))
if offs:
    oa = np.array(offs); print(f"diferença por par (quadros): mediana {np.median(oa):+.0f} · média {oa.mean():+.2f} · |d|≤1 em {np.mean(np.abs(oa) <= 1):.0%} dos pares")
# linha de base: a mesma taxa com o som deslocado no tempo (deslocamentos circulares aleatórios e por batidas inteiras).
# Se o filme muda de imagem o tempo todo, a taxa "por acaso" é alta; o que importa é ficar bem acima dela.
def rate(shift):
    sh = [(o + shift) % n for o in strong]
    return np.mean([vo[max(0, o - 2):o + 3].max() > thr for o in sh])
rng = np.random.default_rng(7)
null_r = np.array([rate(int(r)) for r in rng.integers(15, n - 15, 200)])
beat_r = np.array([rate(k * 30 + 15) for k in range(1, 60)])     # meia batida fora do lugar
real = len(hit) / max(1, len(strong))
print(f"linha de base (acaso): média {null_r.mean():.2f} · p95 {np.percentile(null_r, 95):.2f} · z = {(real - null_r.mean()) / (null_r.std() + 1e-9):.1f}"
      f" · deslocado meia batida: {beat_r.mean():.2f}")
# média da mudança visual alinhada aos eventos sonoros do film.js (cues): pico no quadro 0 = o gesto e o som coincidem
import os
cf = os.path.join(os.path.dirname(os.path.abspath(path)), "cues-" + ("9x16" if "9x16" in path else "16x9") + ".json")
if os.path.exists(cf):
    cj = json.load(open(cf)); fr = [int(round((cj["offset_s"] + q["x"] * cj["periodo_s"]) * FPS)) for q in cj["cues"]]
    fr = [f for f in fr if 8 <= f < n - 8]
    prof = np.array([np.mean([v[f + L] for f in fr]) for L in range(-8, 9)])   # energia de mudança visual em volta de cada evento
    base = np.array([np.mean([v[(f + int(r)) % n] for f in fr]) for r in rng.integers(30, n - 30, 200)])
    pk = int(np.argmax(prof)) - 8
    print(f"alinhado aos {len(fr)} eventos sonoros: pico da mudança visual no quadro {pk:+d} · no quadro 0 = {prof[8] / base.mean():.2f}× o acaso (p95 do acaso {np.percentile(base, 95) / base.mean():.2f}×)")
    print("  perfil (−8…+8 quadros, × acaso): " + " ".join(f"{q / base.mean():.2f}" for q in prof))
miss = sorted(set(strong) - set(hit))
print("sem evento visual (s):", " ".join(f"{m / FPS:.2f}" for m in miss[:40]))
