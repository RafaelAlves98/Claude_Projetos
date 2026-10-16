/* =========================================================
   KRONOGRAFX · v5 · aplicação (rotas, idioma, tema, carrossel, projetos)
   ========================================================= */
(function () {
  "use strict";
  var D = window.KRONO || {};
  var P = D.projetos || [];
  var TR = D.traducoes || {};
  var I = window.KRONO_I18N || {};
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function byId(id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return i; return -1; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- idioma ---------- */
  var LANGS = ["pt", "en", "es", "fr"], LOCALE = { pt: "pt_BR", en: "en_US", es: "es_ES", fr: "fr_FR" }, HTML_LANG = { pt: "pt-BR", en: "en", es: "es", fr: "fr" };
  var lang = (function () {
    var s = store("kg-lang");
    if (LANGS.indexOf(s) >= 0) return s;
    var n = (navigator.language || "pt").slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) >= 0 ? n : "pt";
  })();
  function t(key) {
    var d = I[lang] || {};
    if (d[key] != null) return d[key];
    return (I.pt && I.pt[key] != null) ? I.pt[key] : key;
  }
  // campo de um projeto no idioma atual (cai no português se não houver tradução)
  function tp(p, f) {
    var tr = TR.projetos && TR.projetos[p.id] && TR.projetos[p.id][lang];
    return tr && tr[f] != null ? tr[f] : p[f];
  }

  /* ---------- links de WhatsApp ---------- */
  function updateWa() {
    var txt = (lang !== "pt" && TR.whatsappTexto && TR.whatsappTexto[lang]) || D.whatsappTexto || "";
    var href = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(txt);
    $$("[data-wa]").forEach(function (a) { a.href = href; });
  }
  $("#year").textContent = new Date().getFullYear();

  /* ---------- carrossel inclinado (montado uma vez, para a animação não reiniciar) ---------- */
  var row = $("#reelRow");
  if (row && D.carrossel) {
    var one = D.carrossel.map(function (c) {
      var i = byId(c[1]), p = P[i] || {};
      return '<a class="reel__card" data-pid="' + esc(c[1]) + '" href="#/projeto/' + esc(c[1]) + '"><img src="' + esc(c[0]) + '" alt="" loading="lazy"><span class="chip">' + esc(p.cliente || "") + '</span></a>';
    }).join("");
    row.innerHTML = one + one.replace(/<a class="reel__card" data-pid="[^"]*"/g, '<a class="reel__card" aria-hidden="true" tabindex="-1"');
  }
  function labelCarousel() {
    $$(".reel__card[data-pid]").forEach(function (a) {
      var i = byId(a.dataset.pid);
      if (i >= 0) a.setAttribute("aria-label", tp(P[i], "titulo"));
    });
  }

  /* ---------- cards de projeto ---------- */
  function pcard(p, instant) {
    return '<a class="pcard rv' + (instant ? " in" : "") + '" href="#/projeto/' + esc(p.id) + '" style="--c1:' + esc(p.cor) + ';--c2:' + esc(p.cor2) + '" data-f="' + esc(p.formato) + '">' +
      '<span class="pcard__bg"><img src="' + esc(p.fundo || p.capa) + '" alt="" loading="lazy"></span>' +
      '<span class="chip pcard__tag">' + esc(tp(p, "disciplina")) + '</span>' +
      '<span><span class="pcard__name">' + esc(tp(p, "titulo")) + '</span><span class="pcard__sub">' + esc(p.cliente) + ' · ' + esc(tp(p, "subtitulo")) + '</span></span></a>';
  }
  var fbox = $("#filters"), curFilter = "";
  function renderGrids(instant) {
    $("#homeGrid").innerHTML = P.slice(0, 4).map(function (p) { return pcard(p, instant); }).join("");
    $("#allGrid").innerHTML = P.map(function (p) { return pcard(p, instant); }).join("");
    // filtros por formato (o valor do filtro é o formato original; o rótulo é traduzido)
    var formatos = [];
    P.forEach(function (p) { if (formatos.indexOf(p.formato) < 0) formatos.push(p.formato); });
    var label = function (f) { for (var i = 0; i < P.length; i++) if (P[i].formato === f) return tp(P[i], "formato"); return f; };
    fbox.innerHTML = '<button data-f="">' + esc(t("projs.all")) + '</button>' + formatos.map(function (f) { return '<button data-f="' + esc(f) + '">' + esc(label(f)) + '</button>'; }).join("");
    applyFilter();
  }
  function applyFilter() {
    $$("button", fbox).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.f === curFilter)); });
    $$(".pcard", $("#allGrid")).forEach(function (c) { c.hidden = !!curFilter && c.dataset.f !== curFilter; });
  }
  fbox.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    curFilter = b.dataset.f; applyFilter();
  });

  /* ---------- FAQ ---------- */
  function renderFaq() {
    var list = (lang !== "pt" && TR.faq && TR.faq[lang]) || D.faq || [];
    var faq = $("#faqList");
    var openIdx = $$("details", faq).map(function (d) { return d.open; });
    faq.innerHTML = list.map(function (q, i) {
      var open = openIdx.length ? openIdx[i] : i === 0;
      return '<details' + (open ? " open" : "") + '><summary>' + esc(q[0]) + '<i aria-hidden="true"></i></summary><p>' + esc(q[1]) + '</p></details>';
    }).join("");
  }

  /* ---------- página de projeto ---------- */
  var pv = $("#pVideo"), pbox = $("#pPlayer"), curProject = null;
  $("#pPlay").addEventListener("click", function () {
    pbox.classList.add("is-playing"); pv.controls = true; pv.focus(); pv.play().catch(function () {});
  });
  function renderProjeto(id, textOnly) {
    var i = byId(id); if (i < 0) { location.replace("#/projetos"); return; }
    var p = P[i], page = $("#page-projeto");
    curProject = id;
    page.style.setProperty("--c1", p.cor); page.style.setProperty("--c2", p.cor2);
    page.classList.toggle("is-vertical", !!p.vertical);
    var titulo = tp(p, "titulo");
    $("#pCat").textContent = tp(p, "categoria");
    $("#pTitle").textContent = titulo;
    // projetos conceituais (marca sem vínculo) mostram "Marca" em vez de "Cliente"
    $("#pChips").innerHTML = [[t(p.conceitual ? "proj.brand" : "proj.client"), p.cliente], [t("proj.year"), p.ano], [t("proj.format"), tp(p, "formato")], [t("proj.duration"), p.duracao]].map(function (c) {
      return "<div><span>" + esc(c[0].toUpperCase()) + "</span><b>" + esc(c[1]) + "</b></div>";
    }).join("");
    $("#pStory").innerHTML = (tp(p, "historia") || []).map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("");
    $("#pNote").textContent = tp(p, "nota") || "";
    // vídeo sem faixa de áudio (audio: false): sem o aviso de som e botão "Assistir ao vídeo"
    var som = p.audio !== false;
    $("#pPlay").setAttribute("aria-label", t(som ? "proj.play" : "proj.playVideo"));
    $("#pHint").hidden = !som;
    $("#pSpecs").innerHTML = "<b>" + esc(p.ano) + "</b>" + (tp(p, "specs") || []).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
    var n = P[(i + 1) % P.length];
    var next = $("#pNext");
    if (P.length > 1) { next.hidden = false; next.href = "#/projeto/" + n.id; next.innerHTML = "<span>" + esc(t("proj.next")) + "</span><b>" + esc(tp(n, "titulo")) + "&nbsp;→</b>"; }
    else next.hidden = true;
    document.title = titulo + " · " + p.cliente + " · Kronografx";
    if (textOnly) {
      $$("#pFrames img").forEach(function (im, k) { im.alt = t("proj.frame") + " " + (k + 1) + " · " + titulo; });
      return;
    }
    pbox.classList.remove("is-playing"); pv.controls = false; pv.pause();
    pv.src = p.video; pv.poster = p.capa;
    $("#pFrames").innerHTML = (p.frames || []).map(function (f, k) { return '<figure><img src="' + esc(f) + '" alt="' + esc(t("proj.frame") + " " + (k + 1) + " · " + titulo) + '" loading="lazy"></figure>'; }).join("");
    $("#pFrames").scrollLeft = 0;
  }

  // arrastar os frames com o mouse
  var fr = $("#pFrames"), drag = null;
  fr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, s: fr.scrollLeft }; fr.classList.add("is-drag"); });
  addEventListener("pointermove", function (e) { if (drag) fr.scrollLeft = drag.s - (e.clientX - drag.x); });
  addEventListener("pointerup", function () { drag = null; fr.classList.remove("is-drag"); });

  /* ---------- rotas ---------- */
  var routeName = "home";
  var TITLE_KEY = { home: "title.home", projetos: "title.projects", faq: "title.faq", contato: "title.contact" };
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/"), name = parts[0] || "home";
    if (["home", "projetos", "projeto", "faq", "contato"].indexOf(name) < 0) {
      // âncoras antigas (#contato etc.) viram rotas
      name = "home";
    }
    routeName = name;
    $$(".page").forEach(function (pg) { pg.hidden = pg.dataset.page !== name; });
    $$("[data-nav]").forEach(function (a) {
      var on = a.dataset.nav === (name === "projeto" ? "projetos" : name);
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (name === "projeto") renderProjeto(parts[1]); else { pv.pause(); document.title = t(TITLE_KEY[name]); }
    closeMenu(); closeLang();
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { observeReveal(); onScroll(); playVisible(); });
  }
  addEventListener("hashchange", route);
  $(".skip").addEventListener("click", function (e) { e.preventDefault(); $("#app").focus(); });

  /* ---------- menu (celular) ---------- */
  var burger = $("#burger"), links = $("#navLinks");
  links.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  function closeMenu() { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", t("nav.menuOpen")); }
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    closeLang();
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? t("nav.menuClose") : t("nav.menuOpen"));
  });
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    // devolve o foco ao botão que abriu o menu (senão ele cai no <body>)
    var inMenu = links.contains(document.activeElement), inLang = langMenu.contains(document.activeElement);
    closeMenu(); closeLang();
    if (inMenu) burger.focus(); else if (inLang) langBtn.focus();
  });

  /* ---------- seletor de idioma ---------- */
  var langBtn = $("#langBtn"), langMenu = $("#langMenu");
  function closeLang() { langMenu.hidden = true; langBtn.setAttribute("aria-expanded", "false"); }
  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = langMenu.hidden;
    closeMenu();
    langMenu.hidden = !open; langBtn.setAttribute("aria-expanded", String(open));
  });
  langMenu.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]"); if (!b) return;
    setLang(b.dataset.lang); closeLang(); langBtn.focus();
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("#lang")) closeLang(); });
  $("#lang").addEventListener("focusout", function (e) { if (e.relatedTarget && !$("#lang").contains(e.relatedTarget)) closeLang(); });

  function setLang(l, silent) {
    if (LANGS.indexOf(l) < 0) l = "pt";
    var changed = l !== lang;
    lang = l;
    if (!silent) store("kg-lang", l);
    document.documentElement.lang = HTML_LANG[l];
    document.documentElement.setAttribute("data-lang", l);

    // textos fixos do HTML
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-html]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    $$("[data-i18n-alt]").forEach(function (el) { el.setAttribute("alt", t(el.getAttribute("data-i18n-alt"))); });

    // seletor: bandeira e código do idioma atual
    var cur = $('[data-lang="' + l + '"]', langMenu);
    $("#langFlag").innerHTML = $(".flag", cur).innerHTML;
    $("#langCode").textContent = l.toUpperCase();
    $$("[data-lang]", langMenu).forEach(function (b) { b.setAttribute("aria-current", String(b.dataset.lang === l)); });

    // partes montadas por script
    renderGrids(!silent);  // na troca de idioma os cards já aparecem; na carga inicial usam a revelação normal
    renderFaq();
    labelCarousel();
    updateWa();
    updateThemeLabel();
    burger.setAttribute("aria-label", t(links.classList.contains("is-open") ? "nav.menuClose" : "nav.menuOpen"));
    if (routeName === "projeto" && curProject) renderProjeto(curProject, true);
    else document.title = t(TITLE_KEY[routeName] || "title.home");

    // metadados (para compartilhamento e leitores de tela)
    var md = $('meta[name="description"]'); if (md) md.content = t("meta.desc");
    var og = $('meta[property="og:description"]'); if (og) og.content = t("meta.og");
    var ot = $('meta[property="og:title"]'); if (ot) ot.content = t("title.home");
    var ol = $('meta[property="og:locale"]'); if (ol) ol.content = LOCALE[l];
    if (changed) requestAnimationFrame(function () { observeReveal(); });
  }

  /* ---------- tema claro / escuro ---------- */
  var root = document.documentElement;
  var themeBtn = $("#themeBtn"), metaTheme = $('meta[name="theme-color"]');
  var sysDark = matchMedia("(prefers-color-scheme: dark)");
  function getTheme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function updateThemeLabel() {
    themeBtn.setAttribute("aria-label", t(getTheme() === "dark" ? "nav.themeToLight" : "nav.themeToDark"));
    themeBtn.setAttribute("title", themeBtn.getAttribute("aria-label"));
  }
  function setTheme(th, persist) {
    root.setAttribute("data-theme", th);
    if (persist) store("kg-theme", th);
    if (metaTheme) metaTheme.content = th === "dark" ? "#0e0e11" : "#ffffff";
    updateThemeLabel();
  }
  themeBtn.addEventListener("click", function () { setTheme(getTheme() === "dark" ? "light" : "dark", true); });
  // enquanto a pessoa não escolheu manualmente, acompanha o sistema
  if (sysDark.addEventListener) sysDark.addEventListener("change", function (e) { if (!store("kg-theme")) setTheme(e.matches ? "dark" : "light", false); });

  /* ---------- revelação ---------- */
  var rio = "IntersectionObserver" in window && !reduce ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }) : null;
  function observeReveal() {
    $$(".rv:not(.in)").forEach(function (el) { if (rio) rio.observe(el); else el.classList.add("in"); });
  }

  /* ---------- vídeos só tocam visíveis ---------- */
  var vio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && !reduce) { if (v.preload === "none") v.preload = "auto"; v.play().catch(function () {}); } else v.pause();
    });
  }, { rootMargin: "100px 0px" }) : null;
  function playVisible() { if (vio) $$("video[data-loop]").forEach(function (v) { vio.observe(v); }); }

  /* ---------- arsenal fixo com 3 telas ---------- */
  var ars = $("#arsenal"), slides = $$(".arsenal__slide"), dots = $$(".arsenal__dots i"), cur = -1;
  var nav = $("#pillNav"), darks = [$("#arsenal"), $("#confianca")];
  // celular deitado e telas baixas: o Arsenal vira lista (mesmas condições do style.css)
  var landscape = matchMedia("(orientation: landscape) and (max-height: 520px), (max-width: 960px) and (max-height: 760px)");
  function onScroll() {
    if (ars && !$("#page-home").hidden && !landscape.matches) {
      var r = ars.getBoundingClientRect(), total = r.height - innerHeight;
      var prog = Math.min(0.999, Math.max(0, -r.top / total));
      var k = Math.floor(prog * slides.length);
      if (k !== cur) {
        cur = k;
        slides.forEach(function (s, i) { s.classList.toggle("is-on", i === k); });
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i === k); });
      }
    }
    // navegação fica escura sobre seções escuras
    var y = 40, dark = false;
    darks.forEach(function (el) { if (!el || el.offsetParent === null) return; var rr = el.getBoundingClientRect(); if (rr.top < y && rr.bottom > y) dark = true; });
    if (!$("#page-projeto").hidden) { var ph = $("#pHero").getBoundingClientRect(); if (ph.bottom > y) dark = true; }
    nav.classList.toggle("on-dark", dark);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  if (landscape.addEventListener) landscape.addEventListener("change", function () { slides.forEach(function (s) { s.classList.add("is-on"); }); cur = -1; onScroll(); });
  if (landscape.matches) slides.forEach(function (s) { s.classList.add("is-on"); });

  /* ---------- detalhes vivos: timecode, agulha e render ---------- */
  var aeTc = $("#aeTc"), aeHead = $("#aeHead"), aeV = $(".ae__view video"), rigBar = $("#rigBar"), rigPct = $("#rigPct");
  var t0 = performance.now();
  function pad(n) { return String(n).padStart(2, "0"); }
  (function tick(now) {
    if (aeV && aeTc && !isNaN(aeV.duration) && aeV.duration > 0) {
      var tt = aeV.currentTime, f = Math.floor((tt % 1) * 30);
      aeTc.textContent = "0:00:" + pad(Math.floor(tt)) + ":" + pad(f);
      aeHead.style.left = "calc(102px + (100% - 114px) * " + (tt / aeV.duration).toFixed(4) + ")";
    }
    if (rigBar) {
      var p = ((now - t0) / 6000) % 1.15; p = Math.min(1, p);
      rigBar.style.width = (p * 100).toFixed(1) + "%"; rigPct.textContent = Math.round(p * 100) + "%";
    }
    requestAnimationFrame(tick);
  })(t0);

  /* ---------- início ---------- */
  setTheme(getTheme(), false);   // sincroniza meta theme-color e rótulo do botão
  setLang(lang, true);           // traduz a página (sem gravar a preferência)
  route();
})();
