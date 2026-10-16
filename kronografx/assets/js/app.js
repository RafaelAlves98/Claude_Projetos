/* =========================================================
   KRONOGRAFX · v5 · aplicação (rotas, carrossel, projetos)
   ========================================================= */
(function () {
  "use strict";
  var D = window.KRONO || {};
  var P = D.projetos || [];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function byId(id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return i; return -1; }

  /* ---------- links de WhatsApp ---------- */
  var wa = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(D.whatsappTexto || "");
  $$("[data-wa]").forEach(function (a) { a.href = wa; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- carrossel inclinado ---------- */
  var row = $("#reelRow");
  if (row && D.carrossel) {
    var one = D.carrossel.map(function (c) {
      var i = byId(c[1]), p = P[i] || {};
      return '<a class="reel__card" href="#/projeto/' + esc(c[1]) + '" aria-label="' + esc(p.titulo || "") + '"><img src="' + esc(c[0]) + '" alt="" loading="lazy"><span class="chip">' + esc(p.cliente || "") + '</span></a>';
    }).join("");
    row.innerHTML = one + one.replace(/aria-label="[^"]*"/g, 'aria-hidden="true" tabindex="-1"');
  }

  /* ---------- cards de projeto ---------- */
  function pcard(p) {
    return '<a class="pcard rv" href="#/projeto/' + esc(p.id) + '" style="--c1:' + esc(p.cor) + ';--c2:' + esc(p.cor2) + '" data-f="' + esc(p.formato) + '">' +
      '<span class="pcard__bg"><img src="' + esc(p.fundo || p.capa) + '" alt="" loading="lazy"></span>' +
      '<span class="chip pcard__tag">' + esc(p.disciplina) + '</span>' +
      '<span><span class="pcard__name">' + esc(p.titulo) + '</span><span class="pcard__sub">' + esc(p.cliente) + ' · ' + esc(p.subtitulo) + '</span></span></a>';
  }
  $("#homeGrid").innerHTML = P.slice(0, 4).map(pcard).join("");
  $("#allGrid").innerHTML = P.map(pcard).join("");

  // filtros por formato
  var formatos = [];
  P.forEach(function (p) { if (formatos.indexOf(p.formato) < 0) formatos.push(p.formato); });
  var fbox = $("#filters");
  fbox.innerHTML = '<button aria-pressed="true" data-f="">Todos</button>' + formatos.map(function (f) { return '<button aria-pressed="false" data-f="' + esc(f) + '">' + esc(f) + '</button>'; }).join("");
  fbox.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", fbox).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    $$(".pcard", $("#allGrid")).forEach(function (c) { c.hidden = !!b.dataset.f && c.dataset.f !== b.dataset.f; });
  });

  /* ---------- FAQ ---------- */
  $("#faqList").innerHTML = (D.faq || []).map(function (q, i) {
    return '<details' + (i === 0 ? " open" : "") + '><summary>' + esc(q[0]) + '<i aria-hidden="true"></i></summary><p>' + esc(q[1]) + '</p></details>';
  }).join("");

  /* ---------- página de projeto ---------- */
  var pv = $("#pVideo"), pbox = $("#pPlayer");
  $("#pPlay").addEventListener("click", function () {
    pbox.classList.add("is-playing"); pv.controls = true; pv.play().catch(function () {});
  });
  function renderProjeto(id) {
    var i = byId(id); if (i < 0) { location.hash = "#/projetos"; return; }
    var p = P[i], page = $("#page-projeto");
    page.style.setProperty("--c1", p.cor); page.style.setProperty("--c2", p.cor2);
    page.classList.toggle("is-vertical", !!p.vertical);
    $("#pCat").textContent = p.categoria;
    $("#pTitle").textContent = p.titulo;
    $("#pChips").innerHTML = [["Cliente", p.cliente], ["Ano", p.ano], ["Formato", p.formato], ["Duração", p.duracao]].map(function (c) {
      return "<div><span>" + esc(c[0].toUpperCase()) + "</span><b>" + esc(c[1]) + "</b></div>";
    }).join("");
    $("#pStory").innerHTML = (p.historia || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    $("#pNote").textContent = p.nota || "";
    pbox.classList.remove("is-playing"); pv.controls = false; pv.pause();
    pv.src = p.video; pv.poster = p.capa;
    $("#pSpecs").innerHTML = "<b>" + esc(p.ano) + "</b>" + (p.specs || []).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
    $("#pFrames").innerHTML = (p.frames || []).map(function (f, k) { return '<figure><img src="' + esc(f) + '" alt="Quadro ' + (k + 1) + ' de ' + esc(p.titulo) + '" loading="lazy"></figure>'; }).join("");
    $("#pFrames").scrollLeft = 0;
    var n = P[(i + 1) % P.length];
    var next = $("#pNext");
    if (P.length > 1) { next.hidden = false; next.href = "#/projeto/" + n.id; next.innerHTML = "<span>PRÓXIMO PROJETO</span><b>" + esc(n.titulo) + " →</b>"; }
    else next.hidden = true;
    document.title = p.titulo + " · " + p.cliente + " · Kronografx";
  }

  // arrastar os frames com o mouse
  var fr = $("#pFrames"), drag = null;
  fr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, s: fr.scrollLeft }; fr.classList.add("is-drag"); });
  addEventListener("pointermove", function (e) { if (drag) fr.scrollLeft = drag.s - (e.clientX - drag.x); });
  addEventListener("pointerup", function () { drag = null; fr.classList.remove("is-drag"); });

  /* ---------- rotas ---------- */
  var titles = { home: "Kronografx · Motion Design, VFX e Pós-produção", projetos: "Projetos · Kronografx", faq: "Perguntas frequentes · Kronografx", contato: "Contato · Kronografx" };
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/"), name = parts[0] || "home";
    if (["home", "projetos", "projeto", "faq", "contato"].indexOf(name) < 0) {
      // âncoras antigas (#contato etc.) viram rotas
      name = "home";
    }
    $$(".page").forEach(function (pg) { pg.hidden = pg.dataset.page !== name; });
    $$("[data-nav]").forEach(function (a) { a.classList.toggle("is-on", a.dataset.nav === (name === "projeto" ? "projetos" : name)); });
    if (name === "projeto") renderProjeto(parts[1]); else { pv.pause(); document.title = titles[name]; }
    closeMenu();
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { observeReveal(); onScroll(); playVisible(); });
  }
  addEventListener("hashchange", route);

  /* ---------- menu (celular) ---------- */
  var burger = $("#burger"), links = $("#navLinks");
  function closeMenu() { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menu"); }
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

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
  var landscape = matchMedia("(orientation: landscape) and (max-height: 520px)");
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
      var t = aeV.currentTime, f = Math.floor((t % 1) * 30);
      aeTc.textContent = "0:00:" + pad(Math.floor(t)) + ":" + pad(f);
      aeHead.style.left = "calc(102px + (100% - 114px) * " + (t / aeV.duration).toFixed(4) + ")";
    }
    if (rigBar) {
      var p = ((now - t0) / 6000) % 1.15; p = Math.min(1, p);
      rigBar.style.width = (p * 100).toFixed(1) + "%"; rigPct.textContent = Math.round(p * 100) + "%";
    }
    requestAnimationFrame(tick);
  })(t0);

  route();
})();
