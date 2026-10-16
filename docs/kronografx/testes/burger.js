const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const lang of ['pt', 'fr']) for (const w of [280, 300, 320, 330, 331, 340, 360, 375, 381, 390, 414, 600, 860]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(l => { try { localStorage.setItem('kg-lang', l); } catch (e) {} }, lang);
    const p = await ctx.newPage(); await p.goto('http://localhost:8765/index.html#/', { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => { const q = s => document.querySelector(s).getBoundingClientRect(); const nav = q('#pillNav'), bu = q('#burger'), cta = q('.pill-nav__cta'), th = q('#themeBtn'), lg = q('#langBtn'), br = q('.pill-nav__brand');
      return { nav: Math.round(nav.width), burger: Math.round(bu.width), burgerRight: Math.round(bu.right), navRight: Math.round(nav.right), cta: Math.round(cta.width), theme: Math.round(th.width), lang: Math.round(lg.width), brand: Math.round(br.width) }; });
    out.push(`${lang} ${w}px: burger=${r.burger}px (dir ${r.burgerRight}/${r.navRight}) cta=${r.cta} tema=${r.theme} idioma=${r.lang} marca=${r.brand}${r.burger < 34 ? '  ← ENCOLHEU' : ''}`);
    await ctx.close();
  }
  await b.close(); console.log(out.join('\n'));
})();
