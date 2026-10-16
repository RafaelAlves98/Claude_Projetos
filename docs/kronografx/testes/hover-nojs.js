const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const B = 'http://localhost:8765/';
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(B + 'index.html#/projetos', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    const card = p.locator('#allGrid .pcard').first(); await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    const antes = await card.evaluate(e => getComputedStyle(e).transform);
    await card.hover(); await p.waitForTimeout(700);
    const depois = await card.evaluate(e => getComputedStyle(e).transform);
    console.log('hover no card de projeto: antes', antes, '→ depois', depois, depois !== antes && depois.includes('-5') ? 'OK (sobe)' : 'FALHOU');
    await p.close(); }
  { const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(B + 'index.html', { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ titulo: getComputedStyle(document.querySelector('.hero__title')).opacity, wa: document.querySelector('[data-wa]').href.slice(0, 60) }));
    console.log('sem JavaScript: opacidade do título =', r.titulo, '| link do WhatsApp =', r.wa);
    await p.goto(B + 'privacidade.html', { waitUntil: 'networkidle' });
    console.log('sem JavaScript, privacidade: blocos visíveis =', await p.evaluate(() => [...document.querySelectorAll('.legal[data-l]')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.dataset.l)));
    await ctx.close(); }
  await b.close();
})();
