const { chromium } = require('/opt/node-tools/node_modules/playwright');
const VPS = [[320, 568], [360, 640], [360, 740], [375, 667], [390, 844], [412, 915], [430, 932], [768, 1024], [820, 1180], [960, 800]];
(async () => {
  const b = await chromium.launch(); let ruins = 0; const out = [];
  for (const lang of ['pt', 'es', 'fr']) for (const [w, h] of VPS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 700, hasTouch: w < 700 });
    await ctx.addInitScript(l => { try { localStorage.setItem('kg-lang', l); } catch (e) {} }, lang);
    const p = await ctx.newPage(); await p.goto('http://localhost:8765/index.html#/', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const ar = await p.evaluate(() => { const a = document.getElementById('arsenal'); return { top: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight, sticky: getComputedStyle(document.querySelector('.arsenal__sticky')).position }; });
    const res = [];
    for (const k of [0, 1, 2]) {
      const lista = ar.sticky !== 'sticky';
      const y = lista ? null : Math.round(ar.top + (ar.h - h) * (k + 0.5) / 3);
      if (lista) await p.evaluate(k => document.querySelectorAll('.arsenal__slide')[k].scrollIntoView(), k); else await p.evaluate(y => scrollTo(0, y), y);
      await p.waitForTimeout(250);
      const m = await p.evaluate(k => { const s = document.querySelectorAll('.arsenal__slide')[k]; const t = s.querySelector('.arsenal__text').getBoundingClientRect(); const c = s.querySelector('.arsenal__visual > *').getBoundingClientRect(); const sr = s.getBoundingClientRect();
        const lista = getComputedStyle(s).position !== 'absolute'; const v = s.querySelector('.arsenal__visual').getBoundingClientRect(); return { sobrep: Math.round(t.bottom - c.top), corte: lista ? Math.round(Math.max(c.bottom - sr.bottom, c.bottom - v.bottom, 0)) : Math.round(c.bottom - Math.min(innerHeight, sr.bottom) + 34), topoTexto: Math.round(t.top) }; }, k);
      const ruim = m.sobrep > 0 || m.corte > 0; if (ruim) ruins++;
      res.push(`${['AE', 'Máq', 'Telas'][k]}:${m.sobrep > 0 ? ' sobrepõe ' + m.sobrep : ''}${m.corte > 0 ? ' corta ' + m.corte : ''}${ruim ? '' : ' ok'}`);
    }
    out.push(`${lang} ${w}x${h} [${ar.sticky === 'sticky' ? 'fixo' : 'lista'}]  ${res.join(' | ')}`);
    await ctx.close();
  }
  await b.close(); console.log(out.join('\n')); console.log('\ncasos ruins:', ruins, 'de', 3 * VPS.length * 3);
})();
