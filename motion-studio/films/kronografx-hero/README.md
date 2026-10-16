# Kronografx · vídeo do Hero (30 s · 60 fps · 16:9 e 9:16)

Filme de motion graphics feito 100% em código: canvas 2D (imagem) + Python/numpy (som).
Nenhum template, nenhuma skill, nenhum sample: cada quadro é uma função pura do tempo e cada som sai de osciladores e ruído.

## Roteiro (1 batida = 0,5 s · 120 BPM · 60 batidas)

| batidas | tempo | cena |
|---|---|---|
| 0–4 | 0–2 s | **"Olá."**: o ponto violeta estoura, corre e revela as letras (o fio condutor do filme) |
| 4–8 | 2–4 s | **"Que bom ter você aqui."**: boas-vindas; traço violeta em "você" |
| 8–16 | 4–8 s | **A dor:** "Seu público te dá 3,0 segundos", com contagem real de 3 s, o feed passando, "Rolou. Passou. Esqueceu.", glitch e queda |
| 16–20 | 8–10 s | "Sem ritmo, ninguém fica." A curva linear ganha alças de Bézier: "Com ritmo, todo mundo fica." Silêncio de 1/4 de batida |
| 20–24 | 10–12 s | **A solução:** "Cada frame / pensado / pra prender / o olhar.", um corte por batida |
| 24–40 | 12–20 s | Showreel: morph, tipografia cinética, UI animada, anel 3D de frames |
| 40–44 | 20–22 s | Timeline de edição; o playhead vira o cronômetro |
| 44–52 | 22–26 s | Espelho da dor: "Cada segundo conta.", "Parou. Olhou. Ficou."; o anel trava no **logo** |
| 52–60 | 26–30 s | "Boas-vindas à Kronografx. Vamos dar movimento à sua ideia."; tudo volta ao ponto (**loop perfeito**) |

## Como gerar

```bash
cd motion-studio/films/kronografx-hero
../../.venv/bin/python audio/music.py      # trilha → audio/music.wav + grid MEDIDO (audio/beats.json, beats.js)
node render.mjs --cues                     # eventos sonoros que o film.js calcula → out/cues-<formato>.json
../../.venv/bin/python audio/mix.py        # efeitos + trilha → out/audio-<formato>.wav (−14 LUFS, ≤ −1 dBTP)
node render.mjs --sheet                    # prancha: 1 quadro por batida (revisão)
node render.mjs                            # render final: out/kronografx-hero-16x9.mp4 e -9x16.mp4
../../.venv/bin/python tools/sync_check.py out/preview-16x9.mp4   # sincronia som × imagem (gerar antes com --scale 0.25 --mb 1)
```

Outros modos do `render.mjs`: `--stills 2.5,20.4` (quadros soltos), `--strip 19.5:20.5:0.1` (tira de movimento),
`--scale 0.25 --mb 1` (prévia leve), `--frames 0-599`, `--fmt 9x16`, `--jobs 2`, `--crf 16`.

## Arquivos

- `film.html` + `film.js`: o filme (`window.seek(t)` pinta o quadro t). Parâmetros de URL: `?w=1920&h=1080&mb=6&shutter=0.5`.
  Tudo é medido em **batidas do grid medido** (`beats.js`); motion blur por média de subquadros (obturador de 180°).
- `audio/synth.py`: biblioteca de síntese (osciladores polyBLEP, FM, filtros, reverb por convolução, sidechain).
- `audio/music.py`: a trilha (Lá menor, 120 BPM) + medição das batidas com librosa.
- `audio/sfx.py`: um som por evento visual. `audio/mix.py`: mixagem e loudness (BS.1770).
- `fonts/`: Cal Sans (display) e Inter (UI), as mesmas do site.
- `out/`: gerado (não vai para o git).
