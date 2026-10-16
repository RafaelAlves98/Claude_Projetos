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
miss = sorted(set(strong) - set(hit))
print("sem evento visual (s):", " ".join(f"{m / FPS:.2f}" for m in miss[:40]))
