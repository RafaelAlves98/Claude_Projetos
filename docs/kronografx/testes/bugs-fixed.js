const { chromium } = require('/opt/node-tools/node_modules/playwright');
const B = 'http://localhost:8765/';
(async () => {
  const b = await chromium.launch(); const r = []; let fail = 0;
  const ok = (cond, msg) => { if (!cond) fail++; r.push((cond ? '✓ ' : '✗ ') + msg); };
  const page = async (opts = {}, init) => { const ctx = await b.newContext(Object.assign({ viewport: { width: 1440, height: 900 } }, opts)); if (init) await ctx.addInitScript(init); const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); return [ctx, p]; };
  { const [c, p] = await page(); await p.goto(B + 'index.html#/faq', { waitUntil: 'networkidle' }); await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const s = await p.evaluate(() => ({ h: location.hash, vis: document.querySelector('.page:not([hidden])').dataset.page, foco: document.activeElement.id }));
    ok(s.vis === 'faq' && s.foco === 'app', `1 "Pular para o conteúdo": continua no FAQ (${s.vis}, hash ${s.h}) e o foco vai para #${s.foco}`); await c.close(); }
  { const [c, p] = await page(); await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' }); await p.evaluate(() => location.hash = '#/faq'); await p.waitForTimeout(150);
    await p.evaluate(() => location.hash = '#/projeto/nao-existe'); await p.waitForTimeout(300); const h1 = await p.evaluate(() => location.hash);
    await p.goBack(); await p.waitForTimeout(300); const h2 = await p.evaluate(() => location.hash);
    ok(h1 === '#/projetos' && h2 === '#/faq', `2 projeto inexistente → ${h1}; Voltar → ${h2}`); await c.close(); }
  { const [c, p] = await page({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await p.goto(B + 'index.html#/projetos', { waitUntil: 'networkidle' });
    await p.tap('#burger'); await p.tap('#navLinks a[href="#/projetos"]'); await p.waitForTimeout(200);
    ok(!(await p.evaluate(() => document.getElementById('navLinks').classList.contains('is-open'))), '3 menu do celular fecha ao tocar no link da página atual'); await c.close(); }
  { const [c, p] = await page(); await p.goto(B + 'termos.html#%E0%A4%A', { waitUntil: 'networkidle' }); ok(p._errs.length === 0, `4 hash malformado nas páginas legais: erros=${p._errs.length}`); await c.close(); }
  { const [c, p] = await page(); await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' }); await p.click('#langBtn'); for (let i = 0; i < 6; i++) await p.keyboard.press('Tab');
    ok(await p.evaluate(() => document.getElementById('langMenu').hidden), '5 seletor de idioma fecha quando o Tab sai dele');
    await p.click('#langBtn'); await p.click('#langMenu [data-lang="es"]'); ok((await p.evaluate(() => document.documentElement.dataset.lang)) === 'es', '5b escolher idioma com o mouse ainda funciona (es)'); await c.close(); }
  { const [c, p] = await page({}, () => { try { localStorage.setItem('kg-lang', 'en'); } catch (e) {} });
    for (const pg of ['termos.html', 'privacidade.html']) { await p.goto(B + pg, { waitUntil: 'networkidle' });
      const t = await p.evaluate(() => document.querySelector('.legal[data-l="en"]').textContent); ok(!t.includes('Olá, Kronografx') && t.includes('Hello, Kronografx! I saw the website'), `6 ${pg} (en) cita a mensagem do WhatsApp em inglês`); } await c.close(); }
  { const [c, p] = await page({}, () => { try { localStorage.setItem('kg-lang', 'fr'); } catch (e) {} });
    for (const pg of ['termos.html', 'privacidade.html']) { await p.goto(B + pg, { waitUntil: 'networkidle' });
      const n = await p.evaluate(() => (document.querySelector('.legal[data-l="fr"]').textContent.match(/ [:;?!»%]|« /g) || []).length); ok(n === 0, `7 ${pg} (fr) sem espaço comum antes de : ; ? ! » % (${n})`); }
    await p.goto(B + 'termos.html', { waitUntil: 'networkidle' }); const h = await p.textContent('h1'); ok(h === 'Conditions d’utilisation', `8 título dos Termos em francês: "${h}"`);
    const tx = await p.evaluate(() => document.querySelector('.legal[data-l="fr"]').textContent); ok(tx.includes('Un café à votre nom') && tx.includes('3 Signes'), '9 Termos (fr) usam os títulos de projeto do site'); await c.close(); }
  for (const w of [320, 340]) { const [c, p] = await page({ viewport: { width: w, height: 640 }, isMobile: true, hasTouch: true }); await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' });
    const bw = await p.evaluate(() => document.getElementById('burger').getBoundingClientRect().width); ok(bw >= 34, `10 botão do menu em ${w}px: ${Math.round(bw)}px`); await c.close(); }
  { const [c, p] = await page({}, () => { try { localStorage.setItem('kg-theme', 'light'); } catch (e) {} }); await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' });
    const col = await p.evaluate(() => getComputedStyle(document.querySelector('.ae__bar b')).color); ok(col !== 'rgb(10, 10, 11)', `12 título da janela do After Effects no tema claro: ${col}`); await c.close(); }
  { const [c, p] = await page({}, () => { try { localStorage.setItem('kg-theme', 'dark'); } catch (e) {} }); await p.goto(B + 'termos.html', { waitUntil: 'networkidle' });
    ok((await p.evaluate(() => getComputedStyle(document.querySelector('.legal__doc a')).color)) === 'rgb(183, 148, 255)', '13 links legais no escuro em #b794ff');
    const al = await p.evaluate(() => { const a = document.querySelector('.legal:not([hidden]) .legal__doc'), v = [...document.querySelectorAll('.legal[data-l]')].find(e => e.offsetParent !== null).querySelector('.legal__doc').getBoundingClientRect(), m = document.querySelector('.legal__more').getBoundingClientRect(); return Math.round(m.left - v.left); });
    ok(Math.abs(al) <= 1, `16 card "Ficou alguma dúvida?" alinhado com o texto (diferença ${al}px)`);
    await p.click('#langBtn'); await p.hover('#langMenu [data-lang="en"]'); const bg = await p.evaluate(() => getComputedStyle(document.querySelector('#langMenu [data-lang="en"]')).backgroundColor);
    ok(bg.includes('255, 255, 255, 0.08'), `15 hover do seletor de idioma no escuro: ${bg}`); await c.close(); }
  { const [c, p] = await page({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, () => { try { localStorage.setItem('kg-theme', 'light'); } catch (e) {} });
    await p.goto(B + 'index.html#/projeto/e2-3-sinais', { waitUntil: 'networkidle' }); await p.waitForTimeout(300); await p.tap('#burger'); await p.waitForTimeout(200);
    const s = await p.evaluate(() => ({ dark: document.getElementById('pillNav').classList.contains('on-dark'), bg: getComputedStyle(document.querySelector('#navLinks a.is-on')).backgroundColor }));
    ok(s.dark && s.bg === 'rgb(10, 10, 11)', `14 menu do celular (claro, sobre seção escura): item ativo ${s.bg}`); await c.close(); }
  { const [c, p] = await page(); await p.goto(B + 'index.html#/projeto/itau-um-unico-app', { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
    ok((await p.evaluate(() => getComputedStyle(document.getElementById('pNote')).color)) === 'rgb(110, 110, 115)', '17 aviso "sem vínculo" com cinza legível (ink-2)');
    await p.focus('#pPlay'); await p.keyboard.press('Enter'); await p.waitForTimeout(200); ok((await p.evaluate(() => document.activeElement.id)) === 'pVideo', '19 play pelo teclado leva o foco ao vídeo');
    ok((await p.evaluate(() => document.querySelector('[data-nav="projetos"]').getAttribute('aria-current'))) === 'page', '22 link da página atual tem aria-current="page"');
    await p.evaluate(() => location.hash = '#/contato'); await p.waitForTimeout(200); ok((await p.evaluate(() => [...document.querySelectorAll('#page-contato h2, #page-contato h3')].map(h => h.tagName).join())) === 'H2,H2', '20 Contato: títulos dos cartões são h2');
    ok(!(await p.evaluate(() => document.getElementById('langBtn').hasAttribute('aria-haspopup'))), '21 botão de idioma sem aria-haspopup');
    await c.close(); }
  { const [c, p] = await page({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await p.goto(B + 'index.html#/', { waitUntil: 'networkidle' });
    await p.tap('#burger'); await p.focus('#navLinks a[href="#/faq"]'); await p.keyboard.press('Escape'); ok((await p.evaluate(() => document.activeElement.id)) === 'burger', '18 Esc no menu do celular devolve o foco ao botão do menu');
    await p.tap('#langBtn'); await p.focus('#langMenu [data-lang="es"]'); await p.keyboard.press('Escape'); ok((await p.evaluate(() => document.activeElement.id)) === 'langBtn', '18b Esc no seletor de idioma devolve o foco ao botão'); await c.close(); }
  { const [c, p] = await page({ javaScriptEnabled: false }); await p.goto(B + 'index.html', { waitUntil: 'networkidle' });
    ok((await p.evaluate(() => getComputedStyle(document.querySelector('.hero__title')).opacity)) === '1', '23 sem JavaScript a home aparece'); await c.close(); }
  await b.close(); console.log(r.join('\n')); console.log(`\nFALHAS: ${fail}`);
})();
