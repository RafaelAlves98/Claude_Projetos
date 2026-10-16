/* =========================================================
   KRONOGRAFX · páginas legais (termos.html e privacidade.html)
   Idioma, tema, WhatsApp, ano do rodapé, menu do celular e sumário.
   Usa os mesmos textos (i18n.js) e as mesmas preferências salvas
   (kg-lang, kg-theme) da página principal.
   ========================================================= */
(function () {
  "use strict";
  var D = window.KRONO || {}, TR = D.traducoes || {}, I = window.KRONO_I18N || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  var LANGS = ["pt", "en", "es", "fr"], LOCALE = { pt: "pt_BR", en: "en_US", es: "es_ES", fr: "fr_FR" }, HTML_LANG = { pt: "pt-BR", en: "en", es: "es", fr: "fr" };
  var root = document.documentElement, DOC = document.body.getAttribute("data-doc"); // "terms" ou "privacy"
  var lang = root.getAttribute("data-lang");
  if (LANGS.indexOf(lang) < 0) lang = "pt";
  function t(key) {
    var d = I[lang] || {};
    if (d[key] != null) return d[key];
    return (I.pt && I.pt[key] != null) ? I.pt[key] : key;
  }

  /* ---------- WhatsApp e ano ---------- */
  function updateWa() {
    var txt = (lang !== "pt" && TR.whatsappTexto && TR.whatsappTexto[lang]) || D.whatsappTexto || "";
    var href = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(txt);
    $$("[data-wa]").forEach(function (a) { a.href = href; });
  }
  $("#year").textContent = new Date().getFullYear();

  /* ---------- menu (celular) ---------- */
  var burger = $("#burger"), links = $("#navLinks");
  function closeMenu() { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", t("nav.menuOpen")); }
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    closeLang();
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? t("nav.menuClose") : t("nav.menuOpen"));
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeLang(); } });

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

  function setLang(l, silent) {
    if (LANGS.indexOf(l) < 0) l = "pt";
    lang = l;
    if (!silent) store("kg-lang", l);
    root.lang = HTML_LANG[l];
    root.setAttribute("data-lang", l); // o CSS mostra só o texto deste idioma

    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-html]").forEach(function (el) { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });

    var cur = $('[data-lang="' + l + '"]', langMenu);
    $("#langFlag").innerHTML = $(".flag", cur).innerHTML;
    $("#langCode").textContent = l.toUpperCase();
    $$("[data-lang]", langMenu).forEach(function (b) { b.setAttribute("aria-current", String(b.dataset.lang === l)); });

    updateWa();
    updateThemeLabel();
    burger.setAttribute("aria-label", t(links.classList.contains("is-open") ? "nav.menuClose" : "nav.menuOpen"));
    document.title = t("title." + DOC);
    var md = $('meta[name="description"]'); if (md) md.content = t("meta." + DOC);
    var og = $('meta[property="og:description"]'); if (og) og.content = t("meta." + DOC);
    var ot = $('meta[property="og:title"]'); if (ot) ot.content = t("title." + DOC);
    var ol = $('meta[property="og:locale"]'); if (ol) ol.content = LOCALE[l];
    if (small.matches) $$(".legal__toc").forEach(function (toc) { toc.open = false; });
  }

  /* ---------- tema claro / escuro ---------- */
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
  if (sysDark.addEventListener) sysDark.addEventListener("change", function (e) { if (!store("kg-theme")) setTheme(e.matches ? "dark" : "light", false); });

  /* ---------- sumário: fechado no celular, fecha ao escolher um item ---------- */
  var small = matchMedia("(max-width: 860px)");
  $$(".legal__toc").forEach(function (toc) {
    toc.addEventListener("click", function (e) { if (e.target.closest("a") && small.matches) toc.open = false; });
  });

  /* ---------- link direto para uma seção (#cookies etc.) no idioma escolhido ---------- */
  function goToHash() {
    var id = decodeURIComponent(location.hash.slice(1)).replace(/^(en|es|fr)-/, "");
    if (!id) return;
    var el = document.getElementById(lang === "pt" ? id : lang + "-" + id);
    if (el && el.offsetParent !== null) el.scrollIntoView();
  }

  /* ---------- início ---------- */
  setTheme(getTheme(), false);
  setLang(lang, true);
  goToHash();
})();
