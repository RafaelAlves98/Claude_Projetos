#!/bin/sh
# Versões para o site, a partir dos masters (out/kronografx-hero-<formato>.mp4, CRF 16):
#   out/web/hero-16x9.mp4 e hero-9x16.mp4   H.264 High, 60 fps, CRF 23, faststart, AAC 128k (o site toca mudo e liga o som se o visitante quiser)
#   out/web/hero-16x9-poster.jpg e -9x16-poster.jpg   quadro do logo (b51,4), para o atributo poster do <video>
# Uso: sh tools/web.sh   (a partir de films/kronografx-hero)
set -e
cd "$(dirname "$0")/.."
mkdir -p out/web
for f in 16x9 9x16; do
  ffmpeg -v error -y -i "out/kronografx-hero-$f.mp4" -map 0:v -map 0:a \
    -c:v libx264 -preset slow -crf 23 -tune animation -profile:v high -pix_fmt yuv420p \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    -g 120 -movflags +faststart -c:a aac -b:a 128k "out/web/hero-$f.mp4"
  # b51,4 = 25,7 s: logo + "Kronografx" + tagline completa (depois do brilho e do clique do pino)
  ffmpeg -v error -y -ss 25.7 -i "out/kronografx-hero-$f.mp4" -frames:v 1 -q:v 2 "out/web/hero-$f-poster.jpg"
done
ls -la out/web
