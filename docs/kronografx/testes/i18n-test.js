const { chromium } = require('/opt/node-tools/node_modules/playwright');
const OUT = process.argv[2], B = 'http://localhost:8765/';
const LANGS = ['pt', 'en', 'es', 'fr'], THEMES = ['light', 'dark'];
(async () => {
  const b = await chromium.launch(); const log = []; let falhas = 0;
  const bad = (m) => { falhas++; log.push('  ✗ ' + m); };
  const ctxWith = async (lang, theme, vp, mobile) => {
    const ctx = await b.newContext({ viewport: vp, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: mobile ? 2 : 1, locale: 'en-US' });
    await ctx.addInitScript(([l, t]) => { try { if (l) localStorage.setItem('kg-lang', l); if (t) localStorage.setItem('kg-theme', t); } catch (e) {} }, [lang, theme]);
    return ctx;
  };
  const leaks = (p) => p.evaluate(() => {
    // textos que são só a chave (ex.: "nav.home") = tradução faltando
    const out = []; const re = /^[a-z]+\.[a-zA-Z0-9]+$/;
    document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach(el => { const t = el.textContent.trim(); if (!t || re.test(t)) out.push((el.getAttribute('data-i18n') || el.getAttribute('data-i18n-html')) + '="' + t + '"'); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { const t = el.getAttribute('aria-label'); if (!t || re.test(t)) out.push('aria ' + el.getAttribute('data-i18n-aria')); });
    return out;
  });
  for (const lang of LANGS) for (const theme of THEMES) {
    log.push(`== ${lang} / ${theme}`);
    for (const [vn, vp, mob] of [['desk', { width: 1440, height: 900 }], ['mid', { width: 1150, height: 800 }], ['tab', { width: 900, height: 900 }], ['mob', { width: 390, height: 844 }, true], ['mob320', { width: 320, height: 640 }, true]]) {
      const ctx = await ctxWith(lang, theme, vp, mob); const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
      for (const pg of ['index.html#/', 'index.html#/projeto/itau-um-unico-app', 'index.html#/contato', 'termos.html', 'privacidade.html']) {
        await p.goto(B + pg, { waitUntil: 'networkidle' }); await p.waitForTimeout(250);
        const info = await p.evaluate(() => {
          const nav = document.getElementById('pillNav').getBoundingClientRect();
          const vis = [...document.querySelectorAll('.legal[data-l]')].filter(e => e.offsetParent !== null).map(e => e.dataset.l);
          return { lang: document.documentElement.getAttribute('data-lang'), htmlLang: document.documentElement.lang, theme: document.documentElement.getAttribute('data-theme'),
            title: document.title, navOver: Math.round(Math.max(nav.right - innerWidth, -nav.left, 0)), navH: Math.round(nav.height), overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, vis,
            bg: getComputedStyle(document.body).backgroundColor };
        });
        if (info.lang !== lang) bad(`${vn} ${pg}: data-lang=${info.lang}`);
        if (info.theme !== theme) bad(`${vn} ${pg}: tema=${info.theme}`);
        if (info.navOver > 0) bad(`${vn} ${pg}: menu passa da tela em ${info.navOver}px`);
        if (info.navH > 60) bad(`${vn} ${pg}: menu quebrou em 2 linhas (altura ${info.navH}px)`);
        if (info.overflowX > 0) bad(`${vn} ${pg}: rolagem lateral ${info.overflowX}px`);
        if (pg.endsWith('.html') && pg !== 'index.html#/' && (info.vis.length !== 1 || info.vis[0] !== lang)) bad(`${vn} ${pg}: blocos visíveis=${info.vis}`);
        const lk = await leaks(p); if (lk.length) bad(`${vn} ${pg}: sem tradução → ${lk.slice(0, 6).join(', ')}`);
        if (vn === 'desk') log.push(`  ${pg}: "${info.title}" lang=${info.htmlLang} fundo=${info.bg}`);
        if ((vn === 'desk' || vn === 'mob') && (theme === 'dark' || lang === 'fr')) {
          const n = `${OUT}/${lang}-${theme}-${vn}-${pg.replace(/[#\/.]+/g, '_')}.png`;
          await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150); await p.screenshot({ path: n });
        }
      }
      if (errs.length) bad(`${vn}: erros → ${[...new Set(errs)].join(' | ')}`);
      await ctx.close();
    }
  }
  // troca de idioma pelo menu e persistência entre páginas
  { const ctx = await ctxWith(null, null, { width: 1440, height: 900 }); const p = await ctx.newPage();
    await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' });
    await p.click('#langBtn'); await p.click('#langMenu [data-lang="fr"]'); await p.waitForTimeout(200);
    const nav1 = await p.textContent('[data-nav="home"]');
    await p.click('#themeBtn');
    await p.goto(B + 'privacidade.html', { waitUntil: 'networkidle' });
    const st = await p.evaluate(() => ({ l: document.documentElement.getAttribute('data-lang'), t: document.documentElement.getAttribute('data-theme'), h1: document.querySelector('h1').textContent }));
    log.push(`troca pelo menu: home="${nav1}" → privacidade.html lang=${st.l} tema=${st.t} h1="${st.h1}"`);
    if (st.l !== 'fr' || st.t !== 'dark') bad('preferência não passou para a página legal');
    await p.click('#langBtn'); await p.click('#langMenu [data-lang="es"]'); await p.waitForTimeout(200);
    const vis = await p.evaluate(() => [...document.querySelectorAll('.legal[data-l]')].filter(e => e.offsetParent !== null).map(e => e.dataset.l));
    log.push(`troca na página legal → visível: ${vis}`); if (vis.join() !== 'es') bad('troca de idioma na página legal');
    await ctx.close(); }
  await b.close();
  console.log(log.join('\n')); console.log(`\nFALHAS: ${falhas}`);
})();
