const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', locale: 'pt-BR' }); const p = await ctx.newPage();
  await p.goto('http://localhost:8765/index.html#/', { waitUntil: 'networkidle' });
  const ini = await p.evaluate(() => [document.documentElement.dataset.lang, document.documentElement.dataset.theme]);
  await p.click('#langBtn'); await p.click('#langMenu [data-lang="fr"]'); await p.click('#themeBtn'); await p.waitForTimeout(200);
  await p.goto('http://localhost:8765/privacidade.html', { waitUntil: 'networkidle' });
  const leg = await p.evaluate(() => [document.documentElement.dataset.lang, document.documentElement.dataset.theme, document.querySelector('h1').textContent]);
  await p.click('#themeBtn'); await p.click('#langBtn'); await p.click('#langMenu [data-lang="en"]');
  await p.goto('http://localhost:8765/index.html#/faq', { waitUntil: 'networkidle' });
  const back = await p.evaluate(() => [document.documentElement.dataset.lang, document.documentElement.dataset.theme, document.querySelector('#page-faq h1').textContent]);
  console.log('início (sistema claro, navegador pt):', ini, '\nhome→FR+escuro→privacidade:', leg, '\nprivacidade→claro+EN→home/faq:', back);
  await b.close();
})();
