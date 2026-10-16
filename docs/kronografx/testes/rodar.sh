#!/bin/sh
# Testes de regressão do site (Playwright). Uso, na raiz do repositório:  sh docs/kronografx/testes/rodar.sh
# Sobe o site em http://localhost:8765 e roda cada teste; capturas vão para /tmp/kg-testes.
set -e
cd "$(dirname "$0")/../../.."
python3 -m http.server 8765 --directory kronografx >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV' EXIT
sleep 1; mkdir -p /tmp/kg-testes
for t in bugs-fixed persist nostorage hover-nojs navsweep burger arsenal arsmob; do echo "== $t"; node docs/kronografx/testes/$t.js; done
echo "== i18n-test (4 idiomas x 2 temas x 5 tamanhos, demora alguns minutos)"; node docs/kronografx/testes/i18n-test.js /tmp/kg-testes | grep -E "✗|FALHAS|troca"
