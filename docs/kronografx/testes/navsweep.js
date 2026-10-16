const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const probs = []; let n = 0;
  for (const lang of ['pt', 'en', 'es', 'fr']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 800 } });
    await ctx.addInitScript(l => { try { localStorage.setItem('kg-lang', l); } catch (e) {} }, lang);
    const p = await ctx.newPage();
    for (const pg of ['index.html#/', 'termos.html']) {
      await p.goto('http://localhost:8765/' + pg, { waitUntil: 'networkidle' });
      for (let w = 861; w <= 1460; w += 20) {
        await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(40); n++;
        const r = await p.evaluate(() => {
          const nav = document.getElementById('pillNav'), nr = nav.getBoundingClientRect();
          const kids = [...nav.children].filter(c => c.offsetParent !== null || getComputedStyle(c).display !== 'none');
          const over = kids.some(c => { const cr = c.getBoundingClientRect(); return cr.width > 0 && (cr.right > nr.right - 3 || cr.left < nr.left + 3); });
          const links = [...document.querySelectorAll('#navLinks a')].map(a => a.getBoundingClientRect().height);
          return { right: Math.round(nr.right), vw: innerWidth, h: Math.round(nr.height), over, linkH: Math.max(...links) };
        });
        if (r.right > r.vw - 4 || r.h > 54 || r.over || r.linkH > 40) probs.push(`${lang} ${pg} ${w}px: nav right=${r.right}/${r.vw} altura=${r.h} item_fora=${r.over} link_h=${r.linkH}`);
      }
    }
    await ctx.close();
  }
  await b.close(); console.log(`${n} combinações medidas`); console.log(probs.length ? probs.join('\n') : 'menu cabe em todas');
})();
