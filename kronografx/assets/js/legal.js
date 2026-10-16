/* =========================================================
   KRONOGRAFX · páginas legais (termos.html e privacidade.html)
   Só o básico: WhatsApp, ano do rodapé, menu do celular e sumário.
   ========================================================= */
(function () {
  "use strict";
  var D = window.KRONO || {};
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- links de WhatsApp ---------- */
  var wa = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(D.whatsappTexto || "");
  Array.prototype.forEach.call(document.querySelectorAll("[data-wa]"), function (a) { a.href = wa; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- menu (celular) ---------- */
  var burger = $("#burger"), links = $("#navLinks");
  function closeMenu() { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menu"); }
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- sumário: fechado no celular, fecha ao escolher um item ---------- */
  var toc = $("#legalToc"), small = matchMedia("(max-width: 860px)");
  if (toc) {
    if (small.matches) toc.open = false;
    toc.addEventListener("click", function (e) { if (e.target.closest("a") && small.matches) toc.open = false; });
  }
})();
