const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const pg of ['index.html#/', 'privacidade.html']) {
    const ctx = await b.newContext({ colorScheme: 'dark', locale: 'fr-FR' });
    // simula armazenamento bloqueado: acessar localStorage lança erro (como com cookies bloqueados)
    await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }); });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/' + pg, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, lang: document.documentElement.dataset.lang, h1: (document.querySelector('.page:not([hidden]) h1, main h1') || {}).textContent }));
    out.push(`${pg}: sistema escuro + navegador francês, armazenamento bloqueado → tema=${r.theme} idioma=${r.lang} h1="${(r.h1||'').trim().slice(0,40)}" erros=${errs.length ? errs : 'nenhum'}`);
    await ctx.close();
  }
  await b.close(); console.log(out.join('\n'));
})();
