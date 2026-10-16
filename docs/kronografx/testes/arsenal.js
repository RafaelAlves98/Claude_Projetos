const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const w of [961, 1000, 1100, 1175, 1280, 1366, 1440, 1600, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    await p.goto('http://localhost:8765/#/', { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => [...document.querySelectorAll('.arsenal__slide')].map(s => {
      const tx = s.querySelector('.arsenal__text').getBoundingClientRect();
      const vis = s.querySelector('.arsenal__visual > *').getBoundingClientRect();
      // folga horizontal entre o fim do texto e o início do quadro (negativa = sobreposição)
      const vert = tx.top < vis.bottom && tx.bottom > vis.top;
      return Math.round(vis.left - tx.right) + (vert ? '' : '(sem cruzar)') + ' | quadro ' + Math.round(vis.width) + 'px';
    }));
    out.push(`${w}px  AE: ${r[0]}   Máquina: ${r[1]}   Telas: ${r[2]}`);
    await p.close();
  }
  await b.close(); console.log(out.join('\n'));
})();
