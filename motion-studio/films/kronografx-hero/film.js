/* Kronografx · hero (30 s · 60 fps · 16:9 e 9:16)
   O filme é uma função pura do tempo: window.seek(t) pinta o quadro do instante t (segundos).
   Nada é guardado entre quadros; o ruído sai de sementes (mulberry32), nunca de Math.random.
   Todo o tempo é contado em BATIDAS do grid medido no áudio (beats.js): x = (t - offset) / período.

   Roteiro (x = batida · 1 batida = 0,5 s)
     0– 4  "Olá."               o ponto violeta é o fio condutor
     4– 8  "Que bom ter você aqui."          (boas-vindas)
     8–16  "Seu público te dá 3 segundos."   (a dor: contagem real de 3 s, o feed passa, glitch, tudo cai)
    16–20  "Sem ritmo, ninguém fica."        curva linear → alças de Bézier → "Com ritmo, todo mundo fica."
    20–24  "Cada frame / pensado / pra prender / o olhar."   (a solução, um corte por batida)
    24–40  showreel: morph · tipografia cinética · UI · 3D
    40–44  timeline de edição → o playhead vira o cronômetro
    44–52  "Cada segundo conta." → o anel vira o logo Kronografx
    52–60  "Boas-vindas à Kronografx. Vamos dar movimento à sua ideia." → volta ao ponto (loop) */
(() => {
"use strict";

/* ================================================================ parâmetros */
const Q = new URLSearchParams(location.search);
const W = +Q.get("w") || 1920, H = +Q.get("h") || 1080;
const MB = Math.max(1, Math.round(+Q.get("mb") || 1));        // subquadros de motion blur
const SHUT = Q.has("shutter") ? +Q.get("shutter") : 0.5;        // obturador: 0,5 = 180°
const FPS = 60, DUR = 30;
const BJ = window.BEATS || { offset_s: 0, periodo_s: 0.5 };
const OFF = BJ.offset_s, PER = BJ.periodo_s;
const T = (x) => OFF + x * PER;                                 // batida → segundos
const X = (t) => (t - OFF) / PER;                               // segundos → batida
const U = Math.min(W, H) / 1080, P = H > W;
const cx = W / 2, cy = H / 2;

const cv = document.getElementById("c");
cv.width = W; cv.height = H;
const ctx = cv.getContext("2d", { willReadFrequently: true });
const sub = document.createElement("canvas"); sub.width = W; sub.height = H;
const sctx = sub.getContext("2d", { willReadFrequently: true });
const gbuf = document.createElement("canvas"); gbuf.width = W; gbuf.height = H;
const gctx = gbuf.getContext("2d");

/* ================================================================ cor, matemática, easing, ruído */
const INK = "#0a0a0b", PAPER = "#f5f5f7", VIO = "#7c3aed", WHITE = "#ffffff";
const G1 = "#131316", G2 = "#26262c", G3 = "#46464e", G4 = "#86868f", G5 = "#c7c7cc", G6 = "#e6e6eb";
const TAU = Math.PI * 2;
const cl = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a, b, u) => a + (b - a) * u;
const prog = (x, a, b) => cl((x - a) / (b - a));
const bump = (u) => Math.sin(Math.PI * cl(u));
const oCubic = (u) => 1 - Math.pow(1 - u, 3);
const iCubic = (u) => u * u * u;
const ioCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const oExpo = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u));
const iExpo = (u) => (u <= 0 ? 0 : Math.pow(2, 10 * u - 10));
const ioExpo = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2);
const oBack = (u, s = 1.70158) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
const iBack = (u, s = 1.70158) => (s + 1) * u * u * u - s * u * u;
const spring = (d, f = 1.6, z = 6) => (d <= 0 ? 0 : 1 - Math.exp(-z * d) * Math.cos(TAU * f * d));
const wobble = (d, f = 2.4, z = 8) => (d <= 0 ? 0 : Math.exp(-z * d) * Math.cos(TAU * f * d));   // 1 → 0 oscilando
function invert(fn, y) { let a = 0, b = 1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (fn(m) < y) a = m; else b = m; } return (a + b) / 2; }

const HX = {};
const rgb = (h) => HX[h] || (HX[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
function mixc(a, b, u) { const A = rgb(a), B = rgb(b); u = cl(u); return `rgb(${Math.round(mix(A[0], B[0], u))},${Math.round(mix(A[1], B[1], u))},${Math.round(mix(A[2], B[2], u))})`; }
const rgba = (h, al) => { const A = rgb(h); return `rgba(${A[0]},${A[1]},${A[2]},${al})`; };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = (seed, i = 0) => mulberry32(Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul((i | 0) + 7, 0x85ebca6b))();
function noise1(seed, x) { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return mix(rnd(seed, i), rnd(seed, i + 1), s); }

/* ================================================================ texto (uma fonte display, uma de UI) */
const FD = (s) => `${s.toFixed(2)}px "Cal Sans"`;
const FI = (s, w = 500) => `${w} ${s.toFixed(2)}px Inter`;
const mc = document.createElement("canvas").getContext("2d");
const LC = new Map();
function lay(text, font) {
  const key = font + "|" + text;
  let L = LC.get(key);
  if (L) return L;
  mc.font = font;
  const xs = [], ws = [];
  for (let i = 0; i < text.length; i++) {
    const adv = mc.measureText(text[i]).width;
    xs.push(mc.measureText(text.slice(0, i + 1)).width - adv);   // origem do glifo (respeita o kerning)
    ws.push(adv);
  }
  const m = mc.measureText(text), mh = mc.measureText("H"), mx = mc.measureText("x");
  L = { text, font, xs, ws, w: m.width, cap: mh.actualBoundingBoxAscent, xh: mx.actualBoundingBoxAscent,
        asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  LC.set(key, L);
  return L;
}
function fit(texts, face, maxW, maxS) {
  let s = maxS;
  for (const t of texts) { const L = lay(t, face(maxS)); if (L.w > maxW) s = Math.min(s, maxS * maxW / L.w); }
  return s;
}
const gcx = (L, x0, i, tr = 0) => x0 + L.xs[i] + L.ws[i] / 2 + i * tr;      // centro do glifo i
/* desenha glifo a glifo; fn(i, ch) devolve false (pula) ou {dx, dy, sx, sy, rot, oy, color, a} */
function glyphs(c, L, x0, y0, fn, tr = 0) {
  c.font = L.font; c.textBaseline = "alphabetic"; c.textAlign = "left";
  for (let i = 0; i < L.text.length; i++) {
    const ch = L.text[i];
    if (ch === " ") continue;
    const g = fn ? fn(i, ch) : null;
    if (g === false) continue;
    const gx = x0 + L.xs[i] + i * tr;
    if (!g) { c.fillText(ch, gx, y0); continue; }
    if ((g.sx !== undefined && Math.abs(g.sx) < 1e-3) || (g.sy !== undefined && Math.abs(g.sy) < 1e-3)) continue;
    c.save();
    const w = L.ws[i], oy = g.oy || 0;
    c.translate(gx + w / 2 + (g.dx || 0), y0 - oy + (g.dy || 0));
    if (g.rot) c.rotate(g.rot);
    c.scale(g.sx === undefined ? 1 : g.sx, g.sy === undefined ? 1 : g.sy);
    if (g.color) c.fillStyle = g.color;
    if (g.a !== undefined) c.globalAlpha *= g.a;
    c.fillText(ch, -w / 2, oy);
    c.restore();
  }
}
function wordMap(text) { const m = []; let k = -1, inW = false; for (const ch of text) { if (ch === " ") { inW = false; m.push(-1); } else { if (!inW) { k++; inW = true; } m.push(k); } } return m; }
function wordSpan(L, x0, k) { const wm = wordMap(L.text); let a = -1, b = -1; wm.forEach((v, i) => { if (v === k) { if (a < 0) a = i; b = i; } }); return [x0 + L.xs[a], x0 + L.xs[b] + L.ws[b]]; }
const nWords = (t) => t.split(" ").filter(Boolean).length;
/* linha com máscara: as palavras sobem/descem por dentro da faixa da linha */
function maskLine(c, L, x0, y0, fn) {
  const wm = wordMap(L.text);
  c.save();
  c.beginPath(); c.rect(-W, y0 - L.asc * 0.98, W * 3, (L.asc * 0.98 + L.desc * 1.05)); c.clip();
  glyphs(c, L, x0, y0, (i, ch) => fn(wm[i], i, ch));
  c.restore();
}
const bandH = (L) => L.asc * 0.98 + L.desc * 1.05;

/* ================================================================ primitivas */
const PADB = 200 * U;   // margem para o tremor de câmera
function bg(c, col) { c.fillStyle = col; c.fillRect(-PADB, -PADB, W + 2 * PADB, H + 2 * PADB); }
function blob(c, x, y, r, sx = 1, sy = 1, ang = 0, col = VIO) {
  if (r <= 0.05) return;
  c.save(); c.translate(x, y); if (ang) c.rotate(ang); c.scale(sx, sy);
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = col; c.fill(); c.restore();
}
/* estica um objeto na direção da velocidade (px por batida) */
function stretchOf(pos, x, k = 1 / 5200, max = 1.6) {
  const h = 0.004, a = pos(x - h), b = pos(x + h);
  const vx = (b[0] - a[0]) / (2 * h), vy = (b[1] - a[1]) / (2 * h), sp = Math.hypot(vx, vy);
  const s = 1 + Math.min(sp * k / U, max);
  return { s, ang: Math.atan2(vy, vx) };
}
function quadPts(p0, p1, p2, n = 40) { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; o.push([a * p0[0] + b * p1[0] + d * p2[0], a * p0[1] + b * p1[1] + d * p2[1]]); } return o; }
function polyPart(c, pts, a, b) {
  if (b - a <= 1e-4) return;
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const Lt = len[len.length - 1], s0 = a * Lt, s1 = b * Lt;
  c.beginPath(); let st = false;
  for (let i = 1; i < pts.length; i++) {
    const l0 = len[i - 1], l1 = len[i];
    if (l1 < s0 || l0 > s1) continue;
    const d = l1 - l0 || 1, u0 = cl((s0 - l0) / d), u1 = cl((s1 - l0) / d);
    const p = (u) => [mix(pts[i - 1][0], pts[i][0], u), mix(pts[i - 1][1], pts[i][1], u)];
    const q0 = p(u0), q1 = p(u1);
    if (!st) { c.moveTo(q0[0], q0[1]); st = true; }
    c.lineTo(q1[0], q1[1]);
  }
  c.stroke();
}
function underline(c, x0, x1, y, fs, a, b) {
  const pts = quadPts([x0 - 0.03 * fs, y + 0.02 * fs], [(x0 + x1) / 2, y + 0.09 * fs], [x1 + 0.05 * fs, y - 0.03 * fs]);
  c.strokeStyle = VIO; c.lineWidth = 0.065 * fs; c.lineCap = "round"; c.lineJoin = "round";
  polyPart(c, pts, a, b);
}
function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); }
/* queda com quiques. d = batidas desde o início da queda. Devolve y (negativo = acima do repouso) e squash */
const DROP = { fall: 0.28, q: 0.3, k: 0.72, n: 4 };
function dropBounce(d, h0, hop) {
  if (d < 0) return null;
  const { fall, q, k, n } = DROP;
  if (d < fall) { const u = d / fall; return { y: -h0 * (1 - u * u), sq: 0, st: 1 + 0.45 * u }; }
  let dd = d - fall;
  for (let j = 0; j < n; j++) {
    const qn = q * Math.pow(k, j);
    if (dd < qn) { const ph = dd / qn, A = hop * Math.pow(qn / q, 2); return { y: -A * 4 * ph * (1 - ph), sq: Math.exp(-ph * 10) * 0.34 * Math.pow(0.62, j), st: 1 }; }
    dd -= qn;
  }
  return { y: 0, sq: Math.exp(-dd * 10) * 0.34 * Math.pow(0.62, n), st: 1 };
}
function dropContacts(start) { const o = []; let t = start + DROP.fall; for (let j = 0; j <= DROP.n; j++) { o.push([t, Math.pow(0.55, j)]); t += DROP.q * Math.pow(DROP.k, j); } return o; }
function bouncingDot(c, x, start, tx, ty, r, h0, hop, col = VIO) {
  const b = dropBounce(x - start, h0, hop);
  if (!b) return;
  if (b.sq > 0.002) { const sy = 1 - b.sq, sx = 1 + b.sq * 0.8; blob(c, tx, ty + b.y + r - r * sy, r, sx, sy, 0, col); }
  else blob(c, tx, ty + b.y, r, 1 / Math.sqrt(b.st), b.st, 0, col);
}
/* cronômetro (o mesmo anel na dor e na resolução) */
const RC = { r: (P ? 300 : 290) * U, x: P ? cx : cx + 370 * U, y: cy + (P ? 20 : 10) * U };
const PIN = (R, x0, y0) => ({ stem: [x0 - 13 * U, y0 - R - 46 * U, 26 * U, 34 * U], cap: [x0 - 42 * U, y0 - R - 68 * U, 84 * U, 24 * U] });
function drawPin(c, pin, col) { c.fillStyle = col; c.fillRect(...pin.stem); c.beginPath(); c.roundRect(...pin.cap, 10 * U); c.fill(); }
function lerpRect(a, b, u) { return a.map((v, i) => mix(v, b[i], u)); }
function caption(c, text, x, a, b, theme) {
  const fs = (P ? 46 : 34) * U, L = lay(text, FI(fs, 500)), rd = 0.2 * fs, gap = 0.6 * fs;
  const tot = 2 * rd + gap + L.w, x0 = cx - tot / 2, y = H - (P ? 250 : 104) * U;
  const u = oExpo(prog(x, a, a + 0.5)), v = ioCubic(prog(x, b - 0.35, b));
  if (u <= 0 || v >= 1) return;
  const bh = bandH(L), dy = (1 - u) * bh + v * bh;
  c.save();
  c.beginPath(); c.rect(0, y - L.asc, W, bh); c.clip();
  blob(c, x0 + rd, y - L.xh * 0.5 + dy, rd, 1, 1, 0, theme === "vio" ? PAPER : VIO);
  c.fillStyle = theme === "light" ? G3 : theme === "vio" ? PAPER : G5;
  glyphs(c, L, x0 + 2 * rd + gap, y + dy, null);
  c.restore();
}
function shake(x) {
  let dx = 0, dy = 0;
  for (const [b, a] of [[20, 26], [48, 18], [14.5, 9]]) {
    const d = x - b; if (d < 0 || d > 1.2) continue;
    const k = a * U * Math.exp(-d * 5.5);
    dx += k * (noise1(11 + b, d * 14) - 0.5) * 2; dy += k * (noise1(23 + b, d * 14) - 0.5) * 2;
  }
  return [dx, dy];
}

/* ================================================================ S1 · "Olá." (0–4) */
const R0 = 16 * U, Z1 = 0.72, Z2 = 1.0;      // Z1: fim da ida à esquerda · Z2: o ponto pousa (palma da batida 1)                                   // o ponto do quadro 0 (e do último: loop)
let _s1;
function s1L() {
  if (_s1) return _s1;
  const fs = 340 * U, L = lay("Olá", FD(fs)), rd = fs * 0.072, gap = fs * 0.05;
  const x0 = cx - (L.w + gap + 2 * rd) / 2, base = cy + L.cap / 2;
  const endX = x0 + L.w + gap + rd, endY = base - rd, leftX = x0 - fs * 0.22;
  const pass = [0, 1, 2].map((i) => Z1 + (Z2 - Z1) * invert(ioCubic, (gcx(L, x0, i) - leftX) / (endX - leftX)));
  return (_s1 = { fs, L, rd, x0, base, endX, endY, leftX, pass });
}
function s1Dot(x) {
  const S = s1L();
  if (x < 0.25) return [cx, cy];
  if (x < 0.5) return [cx + 40 * U * ioCubic(prog(x, 0.25, 0.5)), cy];
  if (x < Z1) { const u = ioCubic(prog(x, 0.5, Z1)); return [mix(cx + 40 * U, S.leftX, u), mix(cy, S.endY, u) - Math.sin(Math.PI * u) * 60 * U]; }
  return [mix(S.leftX, S.endX, ioCubic(prog(x, Z1, Z2))), S.endY];
}
const WAVE = 2.25, waveDy = (x, i, fs) => -fs * 0.14 * bump(prog(x, WAVE + 0.075 * i, WAVE + 0.34 + 0.075 * i));
function s1(c, x) {
  bg(c, INK);
  const S = s1L(), { fs, L, rd, x0, base } = S;
  // ripple do primeiro "pop"
  const ru = prog(x, 0, 1), lw = 4 * U * Math.pow(1 - ru, 2);
  if (lw > 0.15) { c.strokeStyle = G3; c.lineWidth = lw; c.beginPath(); c.arc(cx, cy, R0 + 230 * U * oExpo(ru), 0, TAU); c.stroke(); }
  // letras nascem quando o ponto passa
  c.fillStyle = PAPER;
  glyphs(c, L, x0, base, (i) => {
    const v = prog(x, S.pass[i] - 0.02, S.pass[i] + 0.45);
    if (v <= 0) return false;
    const s = oBack(v, 2.0), w = waveDy(x, i, fs);
    const air = bump(prog(x, WAVE + 0.075 * i, WAVE + 0.34 + 0.075 * i));
    return { sx: s * (1 - 0.06 * air), sy: s * (1 + 0.1 * air), dy: (1 - oExpo(v)) * fs * 0.1 + w };
  });
  // o ponto
  const [px, py] = s1Dot(x);
  let r = R0, sx = 1, sy = 1, ang = 0;
  if (x < 0.25) r = R0 * (1 + 0.75 * (x < 0.05 ? Math.sin((Math.PI / 2) * x / 0.05) : Math.exp(-(x - 0.05) * 11)));
  else if (x < 0.5) { const u = ioCubic(prog(x, 0.25, 0.5)); r = R0 * (1 + 0.75 * Math.exp(-(x - 0.05) * 11)); sx = 1 - 0.3 * u; sy = 1 + 0.24 * u; }
  else if (x < Z2) {
    r = mix(R0, rd, ioCubic(prog(x, Z1, Z2)));
    const st = stretchOf(s1Dot, x); sx = st.s; sy = 1 / Math.sqrt(st.s); ang = st.ang;
  } else { r = rd * (1 - 0.18 * ioCubic(prog(x, 3.1, 3.45))); const k = 0.36 * wobble(x - Z2, 2.4, 8); sx = 1 + k; sy = 1 - k; }
  const hop = x >= Z2 ? waveDy(x, 3, fs) : 0;
  // íris: o ponto engole a tela e abre o papel
  const maxD = Math.hypot(Math.max(S.endX, W - S.endX), Math.max(S.endY, H - S.endY)) + 40 * U;
  if (x >= 3.45) {
    const rI = mix(rd * 0.82, maxD, ioCubic(prog(x, 3.45, 3.9)));
    blob(c, S.endX, S.endY, rI);
    const rP = maxD * ioCubic(prog(x, 3.62, 4.0));
    if (rP > 0.5) blob(c, S.endX, S.endY, rP, 1, 1, 0, PAPER);
  } else {
    const yy = x >= Z2 ? py + hop + (1 - sy) * r : py;
    blob(c, px, yy, r, sx, sy, ang);
  }
}

/* ================================================================ S2 · "Que bom ter você aqui." (4–8) */
let _s2;
function s2L() {
  if (_s2) return _s2;
  const lines = P ? ["Que bom", "ter você", "aqui"] : ["Que bom", "ter você aqui"];
  const fs = (P ? 178 : 156) * U, lh = fs * 1.08, Ls = lines.map((t) => lay(t, FD(fs)));
  const rd = fs * 0.075, gap = fs * 0.045, n = Ls.length, last = Ls[n - 1];
  const bw = Math.max(...Ls.map((L, i) => (i === n - 1 ? L.w + gap + 2 * rd : L.w)));
  const bx = cx - bw / 2, b0 = cy - ((n - 1) * lh) / 2 + Ls[0].cap / 2;
  const bases = Ls.map((_, i) => b0 + i * lh);
  const starts = []; let k = 0;
  Ls.forEach((L) => { const m = nWords(L.text); for (let j = 0; j < m; j++) starts.push(4 + 0.25 * k++); });
  const vl = lines.findIndex((t) => t.includes("você")), vk = nWords(lines[vl].split("você")[0]);
  const vs = wordSpan(Ls[vl], bx, vk);
  return (_s2 = { fs, lh, Ls, rd, bx, bases, starts, tx: bx + last.w + gap + rd, ty: bases[n - 1] - rd, vl, vs });
}
const S2DROP = 5.25;
function s2(c, x) {
  bg(c, PAPER);
  const S = s2L(), { fs, Ls, bx, bases } = S;
  let k0 = 0;
  c.fillStyle = INK;
  Ls.forEach((L, li) => {
    const bh = bandH(L), k1 = k0;
    maskLine(c, L, bx, bases[li], (k) => {
      const g = k1 + k, st = S.starts[g];
      const u = oExpo(prog(x, st, st + 0.55)), e = ioCubic(prog(x, 7.0 + 0.045 * g, 7.4 + 0.045 * g));
      if (u <= 0 || e >= 1) return false;
      return { dy: (1 - u) * bh * 0.95 + e * bh * 0.95 };
    });
    k0 += nWords(L.text);
  });
  // "você" ganha um traço violeta
  const ua = oExpo(prog(x, 7.0, 7.35)), ub = oExpo(prog(x, 6.0, 6.45));
  underline(c, S.vs[0], S.vs[1], bases[S.vl] + fs * 0.16, fs, ua, ub);
  // o ponto final cai e quica; depois pula para o centro do cronômetro
  const maxD = Math.hypot(W, H);
  if (x >= 7.55) blob(c, RC.x, RC.y, maxD * ioCubic(prog(x, 7.55, 8.0)), 1, 1, 0, INK);
  if (x < 7.25) bouncingDot(c, x, S2DROP, S.tx, S.ty, S.rd, S.ty + 0.15 * H, 0.24 * fs);
  else {
    const u = ioCubic(prog(x, 7.25, 7.8));
    const pos = (xx) => { const v = ioCubic(prog(xx, 7.25, 7.8)); return [mix(S.tx, RC.x, v), mix(S.ty, RC.y, v) - Math.sin(Math.PI * v) * 0.22 * H]; };
    const [px, py] = pos(x), st = stretchOf(pos, x);
    blob(c, px, py, mix(S.rd, 18 * U, u), st.s, 1 / Math.sqrt(st.s), st.ang);
  }
}

/* ================================================================ S3 · a dor: "Seu público te dá 3 segundos." (8–16) */
const PAIN = ["Rolou.", "Passou.", "Esqueceu."], PAIN_AT = [10, 11, 12];
const GAIN = ["Parou.", "Olhou.", "Ficou."], GAIN_AT = [45, 46, 47];
let _rc;
function rcL() {
  if (_rc) return _rc;
  const nf = (P ? 172 : 190) * U, NF = FD(nf), digW = Math.max(...("0123456789".split("").map((d) => lay(d, NF).w))), comW = lay(",", NF).w;
  const hs = (P ? 112 : 124) * U, ws = (P ? 104 : 112) * U;
  const hy = P ? [RC.y - RC.r - 252 * U, RC.y - RC.r - 128 * U] : [cy - 150 * U, cy - 14 * U];
  return (_rc = { nf, NF, digW, comW, hs, ws, hy, hx: P ? null : 150 * U, wy: P ? RC.y + RC.r + 185 * U : cy + 200 * U, lab: lay("SEGUNDOS", FI((P ? 36 : 30) * U, 600)) });
}
function clockNumber(c, v, x, col, scale = 1) {
  const S = rcL(), d = Math.floor(v + 1e-9), t = Math.round((v - d) * 10) % 10;
  const chars = [String(d), ",", String(t)], widths = [S.digW, S.comW, S.digW];
  const tot = widths.reduce((a, b) => a + b, 0), base = RC.y + lay("0", S.NF).cap / 2 - 26 * U;
  c.save(); c.translate(RC.x, base - lay("0", S.NF).cap / 2); c.scale(scale, scale); c.translate(-RC.x, -(base - lay("0", S.NF).cap / 2));
  c.fillStyle = col; c.font = S.NF; c.textBaseline = "alphabetic"; c.textAlign = "center";
  let xx = RC.x - tot / 2;
  chars.forEach((ch, i) => { c.fillText(ch, xx + widths[i] / 2, base); xx += widths[i]; });
  c.textAlign = "left";
  const lab = S.lab, tr = 0.22 * lab.cap;
  c.fillStyle = G4;
  glyphs(c, lab, RC.x - (lab.w + (lab.text.length - 1) * tr) / 2, base + 70 * U, null, tr);
  c.restore();
}
function ticks(c, sweep, colOf) {
  for (let j = 0; j < 60; j++) {
    const a = (j / 60) * TAU;
    if (a > sweep + 1e-6) break;
    const big = j % 5 === 0, r1 = RC.r - (big ? 46 : 32) * U, r2 = RC.r - 20 * U, an = a - Math.PI / 2;
    c.strokeStyle = colOf(j, a); c.lineWidth = (big ? 5 : 3) * U; c.lineCap = "butt";
    c.beginPath(); c.moveTo(RC.x + r1 * Math.cos(an), RC.y + r1 * Math.sin(an)); c.lineTo(RC.x + r2 * Math.cos(an), RC.y + r2 * Math.sin(an)); c.stroke();
  }
}
/* cabeçalho em duas linhas: à esquerda no 16:9, centrado no 9:16 */
function header(c, x, lines, st) {
  const S = rcL(); let k0 = 0;
  lines.forEach((t, li) => {
    const L = lay(t, FD(S.hs)), bh = bandH(L), kk = k0;
    maskLine(c, L, S.hx === null ? cx - L.w / 2 : S.hx, S.hy[li], (k) => ({ dy: (1 - oExpo(prog(x, st + 0.12 * (kk + k), st + 0.55 + 0.12 * (kk + k)))) * bh }));
    k0 += nWords(t);
  });
}
/* palavras que rolam num slot abaixo do anel */
function slotWords(c, x, list, at, col, lastCol) {
  const S = rcL();
  list.forEach((w, j) => {
    const L = lay(w, FD(S.ws)), bh = bandH(L);
    const u = oExpo(prog(x, at[j], at[j] + 0.4)), o = j + 1 < list.length ? oExpo(prog(x, at[j + 1], at[j + 1] + 0.4)) : 0;
    if (u <= 0 || o >= 1) return;
    c.fillStyle = j === list.length - 1 && lastCol ? lastCol : col;
    maskLine(c, L, S.hx === null ? cx - L.w / 2 : S.hx, S.wy, () => ({ dy: (1 - u) * bh - o * bh }));
  });
}
function feed(c, x) {
  const nc = P ? 4 : 7, gap = 26 * U, cw = (W - gap * (nc + 1)) / nc;
  const entry = (1 - oExpo(prog(x, 7.9, 9.2))) * H * 0.95;
  let scroll = 90 * U * (x - 8);
  for (const k of PAIN_AT) scroll += 620 * U * oExpo(prog(x, k, k + 0.6));
  scroll += 2400 * U * iCubic(prog(x, 15, 16));
  for (let i = 0; i < nc; i++) {
    const sf = [1, 1.16, 0.9, 1.06, 0.94, 1.12, 1.0][i], off = scroll * sf + i * 137 * U, X0 = gap + i * (cw + gap);
    const hs = []; let per = 0;
    for (let j = 0; j < 10; j++) { const h = (250 + 190 * rnd(5 + i, j)) * U; hs.push(h); per += h + gap; }
    let y = -(off % per) + entry - per;
    for (let rep = 0; rep < 4 && y < H; rep++) {
      for (let j = 0; j < 10; j++) {
        const h = hs[j];
        if (y + h > -20 && y < H + 20) {
          c.fillStyle = "#111114"; c.beginPath(); c.roundRect(X0, y, cw, h, 22 * U); c.fill();
          c.fillStyle = "#17171b"; c.beginPath(); c.roundRect(X0 + 16 * U, y + 16 * U, cw - 32 * U, h * 0.58, 14 * U); c.fill();
          c.fillRect(X0 + 16 * U, y + h * 0.58 + 36 * U, cw * 0.62, 12 * U); c.fillRect(X0 + 16 * U, y + h * 0.58 + 60 * U, cw * 0.4, 12 * U);
        }
        y += h + gap;
      }
    }
  }
  const g = c.createRadialGradient(RC.x, RC.y, RC.r * 0.7, RC.x, RC.y, Math.hypot(W, H) * 0.55);
  g.addColorStop(0, rgba(INK, 0.94)); g.addColorStop(1, rgba(INK, 0.45));
  c.fillStyle = g; c.fillRect(-PADB, -PADB, W + 2 * PADB, H + 2 * PADB);
}
const fallOf = (x, k) => { const u = prog(x, 15 + 0.07 * k, 15.78 + 0.07 * k); return { dy: Math.pow(u, 2.2) * H * 1.3, rot: (k % 2 ? 1 : -1) * 0.5 * u * u }; };
function grp(c, tr, px, py, fn) { c.save(); c.translate(px, py + tr.dy); c.rotate(tr.rot); c.translate(-px, -py); fn(); c.restore(); }
function s3content(c, x) {
  bg(c, INK);
  feed(c, x);
  const S = rcL(), R = RC.r;
  const sweep = TAU * ioCubic(prog(x, 8.0, 8.75));
  // o ponto anda no tique-taque (batidas inteiras); a contagem corre contínua de b8,5 a b14,5
  let es = 0;
  [[9, 0.5], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1], [14.5, 0.5]].forEach(([b0, dv]) => { es += dv * oBack(prog(x, b0, b0 + 0.22), 2.2); });
  const aDot = -Math.PI / 2 + es * (Math.PI / 3);
  // anel
  grp(c, fallOf(x, 2), RC.x, RC.y, () => {
    c.lineCap = "butt"; c.lineWidth = 12 * U;
    c.strokeStyle = G2; c.beginPath(); c.arc(RC.x, RC.y, R, -Math.PI / 2, -Math.PI / 2 + sweep); c.stroke();
    const a0 = Math.max(aDot, -Math.PI / 2), a1 = -Math.PI / 2 + sweep;
    if (a1 > a0 + 1e-3) { c.strokeStyle = G5; c.beginPath(); c.arc(RC.x, RC.y, R, a0, a1); c.stroke(); }
    ticks(c, sweep, () => G3);
    const pu = prog(x, 8.3, 8.62);
    if (pu > 0) { c.save(); c.translate(0, -(1 - oBack(pu, 2.4)) * 70 * U); drawPin(c, PIN(R, RC.x, RC.y), G3); c.restore(); }
  });
  // número
  grp(c, fallOf(x, 1), RC.x, RC.y, () => {
    const v = x < 8.5 ? 3 : Math.max(0, 3 - (T(x) - T(8.5)));
    const disp = Math.ceil(v * 10 - 1e-6) / 10, s = oBack(prog(x, 8.15, 8.5), 2) * (1 + 0.14 * wobble(x - 14.5, 2, 7));
    if (s > 0.01) clockNumber(c, disp, x, x >= 14.5 ? G5 : PAPER, s);
  });
  // "Seu público te dá"
  grp(c, fallOf(x, 0), P ? cx : S.hx, S.hy[0], () => { c.fillStyle = PAPER; header(c, x, ["Seu público", "te dá"], 8.2); });
  grp(c, fallOf(x, 3), P ? cx : S.hx, S.wy, () => slotWords(c, x, PAIN, PAIN_AT, G5));
  // o ponto: sai do centro, vai ao topo do anel e marca o tempo que escorre
  grp(c, fallOf(x, 4), RC.x, RC.y, () => {
    let px, py;
    if (x < 8.55) { const u = ioCubic(prog(x, 8.15, 8.55)); px = RC.x; py = mix(RC.y, RC.y - R, u); }
    else { px = RC.x + R * Math.cos(aDot); py = RC.y + R * Math.sin(aDot); }
    blob(c, px, py, 18 * U);
  });
}
function s3(c, x) {
  if (x < 14.5 || x >= 15.0) { s3content(c, x); return; }
  gctx.setTransform(1, 0, 0, 1, 0, 0);
  s3content(gctx, x);
  const seed = Math.floor((x - 14.5) * 22);
  const amp = (x < 14.64 ? 1 : 0.6 * (1 - prog(x, 14.64, 15.0))) * (rnd(91, seed) > 0.25 ? 1 : 0.2);
  bg(c, INK);
  let y = 0, j = 0;
  while (y < H) {
    const h = (24 + 120 * rnd(seed + 3, j)) * U, r = rnd(seed + 7, j);
    const dx = (rnd(seed + 11, j) - 0.5) * 2 * 150 * U * amp * (r > 0.35 ? 1 : 0.12);
    c.drawImage(gbuf, 0, y, W, h, dx, y, W, h);
    if (r > 0.9 && amp > 0.3) { c.fillStyle = r > 0.95 ? G5 : G2; c.fillRect(dx * 1.8 + W * rnd(seed + 13, j), y, W * 0.18, h * 0.5); }
    y += h; j++;
  }
}

/* ================================================================ S4 · "Sem ritmo, ninguém fica." (16–20) */
let _s4;
function s4L() {
  if (_s4) return _s4;
  const fs = (P ? 104 : 96) * U, lh = fs * 1.12;
  const tx = P ? 96 * U : 170 * U, ty1 = P ? 330 * U : cy - 40 * U;
  const gs = (P ? 600 : 460) * U, gx = P ? cx : cx + 390 * U, gy = P ? cy + 10 * U : cy - 80 * U;
  const trY = P ? cy + 520 * U : cy + 300 * U, tr0 = P ? cx - 400 * U : gx - 300 * U, tr1 = P ? cx + 400 * U : gx + 300 * U;
  return (_s4 = { fs, lh, tx, ty1, ty2: ty1 + lh, gs, gx, gy, trY, tr0, tr1, cs: 116 * U });
}
function bez(p1, p2, s) {   // curva temporal: x = tempo, y = valor (como no Graph Editor)
  const bx = (t) => 3 * (1 - t) * (1 - t) * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t * t * t;
  const by = (t) => 3 * (1 - t) * (1 - t) * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t * t * t;
  const t = invert(bx, s); return by(t);
}
function s4State(x) {
  const m = ioCubic(prog(x, 18.15, 19.0));
  const p1 = [mix(1 / 3, 0.8, m), mix(1 / 3, 0.0, m)], p2 = [mix(2 / 3, 0.2, m), mix(2 / 3, 1.0, m)];
  const q = (Math.min(x, 19.75) - 16) % 2, s = q < 1 ? q : 2 - q;
  return { m, p1, p2, s, v: bez(p1, p2, s) };
}
function s4CardPos(x) { const S = s4L(), st = s4State(x); return [mix(S.tr0 + S.cs / 2, S.tr1 - S.cs / 2, st.v), S.trY]; }
function s4(c, x) {
  bg(c, INK);
  const S = s4L(), st = s4State(x), push = 1 + 0.08 * ioCubic(prog(x, 18.0, 19.75));
  c.save(); c.translate(S.gx, S.gy); c.scale(push, push); c.translate(-S.gx, -S.gy);
  const [kx, ky] = s4CardPos(x);
  if (x >= 19.75) {    // silêncio: só o card violeta, prendendo a respiração
    const u = prog(x, 19.75, 19.93), g = iExpo(prog(x, 19.93, 20.0));
    const s = (1 - 0.18 * oCubic(u)) * mix(1, (Math.hypot(W, H) * 1.2) / S.cs, g);
    c.fillStyle = VIO; c.beginPath(); c.roundRect(kx - (S.cs * s) / 2, ky - (S.cs * s) / 2, S.cs * s, S.cs * s, 24 * U * Math.max(1, s * 0.2)); c.fill();
    c.restore(); return;
  }
  // texto
  const A = lay("Sem ritmo,", FD(S.fs)), A2 = lay("Com ritmo,", FD(S.fs));
  const B = lay("ninguém fica.", FD(S.fs)), B2 = lay("todo mundo fica.", FD(S.fs));
  const tx = P ? cx - Math.max(A.w, B2.w) / 2 : S.tx;
  const fu = prog(x, 18.5, 18.72);
  c.fillStyle = PAPER;
  maskLine(c, fu < 0.5 ? A : A2, tx, S.ty1, (k) => {
    const u = oExpo(prog(x, 16.0 + 0.15 * k, 16.55 + 0.15 * k)), bh = bandH(A);
    if (k === 0 && fu > 0) { const sy = Math.abs(Math.cos(Math.PI * fu)); return { dy: (1 - u) * bh, sy: Math.max(sy, 0.002), oy: A.cap / 2, color: fu >= 0.5 ? VIO : PAPER }; }
    return { dy: (1 - u) * bh };
  });
  maskLine(c, B, tx, S.ty2, (k) => {
    const u = oExpo(prog(x, 16.4 + 0.15 * k, 16.95 + 0.15 * k)), o = ioCubic(prog(x, 18.55 + 0.05 * k, 18.8 + 0.05 * k)), bh = bandH(B);
    if (o >= 1) return false;
    return { dy: (1 - u) * bh + o * bh };
  });
  maskLine(c, B2, tx, S.ty2, (k) => {
    const u = oExpo(prog(x, 18.88 + 0.1 * k, 19.38 + 0.1 * k)), bh = bandH(B2);
    if (u <= 0) return false;
    return { dy: (1 - u) * bh };
  });
  // graph editor
  const g0 = S.gs, X0 = S.gx - g0 / 2, Y0 = S.gy + g0 / 2;
  const pin = oExpo(prog(x, 16.1, 16.7));
  c.save(); c.translate(0, (1 - pin) * 60 * U);
  c.fillStyle = G1; c.beginPath(); c.roundRect(X0 - 46 * U, Y0 - g0 - 46 * U, g0 + 92 * U, g0 + 92 * U, 34 * U); c.fill();
  c.strokeStyle = G2; c.lineWidth = 2 * U;
  for (let i = 0; i <= 4; i++) {
    c.beginPath(); c.moveTo(X0 + (i / 4) * g0, Y0); c.lineTo(X0 + (i / 4) * g0, Y0 - g0 * pin); c.stroke();
    c.beginPath(); c.moveTo(X0, Y0 - (i / 4) * g0); c.lineTo(X0 + g0 * pin, Y0 - (i / 4) * g0); c.stroke();
  }
  const mp = (u, v) => [X0 + u * g0, Y0 - v * g0];
  // cursor de tempo
  const [sx0, sy0] = mp(st.s, st.v);
  c.strokeStyle = G3; c.lineWidth = 2 * U; c.beginPath(); c.moveTo(sx0, Y0); c.lineTo(sx0, sy0); c.stroke();
  // curva
  const pts = []; for (let i = 0; i <= 80; i++) { const t = i / 80, b = (a, b2) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b2 + t * t * t; pts.push(mp(b(st.p1[0], st.p2[0]), b(st.p1[1], st.p2[1]))); }
  c.strokeStyle = mixc(G4, VIO, st.m); c.lineWidth = 6 * U; c.lineCap = "round"; c.lineJoin = "round";
  polyPart(c, pts, 0, oExpo(prog(x, 16.3, 17.0)));
  // alças de Bézier
  const hs = oBack(prog(x, 18.0, 18.25), 2.2);
  if (hs > 0) {
    const h1 = mp(...st.p1), h2 = mp(...st.p2), e0 = mp(0, 0), e1 = mp(1, 1);
    c.strokeStyle = VIO; c.lineWidth = 3 * U;
    c.beginPath(); c.moveTo(...e0); c.lineTo(...h1); c.moveTo(...e1); c.lineTo(...h2); c.stroke();
    blob(c, h1[0], h1[1], 14 * U * hs); blob(c, h2[0], h2[1], 14 * U * hs);
    blob(c, h1[0], h1[1], 5 * U * hs, 1, 1, 0, INK); blob(c, h2[0], h2[1], 5 * U * hs, 1, 1, 0, INK);
  }
  for (const [u, v] of [[0, 0], [1, 1]]) { const [a, b] = mp(u, v); c.save(); c.translate(a, b); c.rotate(Math.PI / 4); c.fillStyle = mixc(G5, VIO, st.m); const d = 12 * U * oBack(prog(x, 16.3, 16.6)); c.fillRect(-d, -d, 2 * d, 2 * d); c.restore(); }
  blob(c, sx0, sy0, 11 * U * oBack(prog(x, 16.5, 16.8)), 1, 1, 0, mixc(PAPER, VIO, st.m));
  c.restore();
  // trilho + card
  const tp = oExpo(prog(x, 16.2, 16.8));
  c.strokeStyle = G2; c.lineWidth = 4 * U; c.lineCap = "round";
  c.beginPath(); c.moveTo(mix((S.tr0 + S.tr1) / 2, S.tr0, tp), S.trY); c.lineTo(mix((S.tr0 + S.tr1) / 2, S.tr1, tp), S.trY); c.stroke();
  const ks = oBack(prog(x, 16.4, 16.75), 2);
  if (ks > 0) {
    const vs = stretchOf(s4CardPos, x, 1 / 9000, 0.5), sxk = 1 + (vs.s - 1) * st.m;
    c.save(); c.translate(kx, ky); c.scale(ks * sxk, ks / Math.sqrt(sxk));
    c.fillStyle = mixc(G3, VIO, st.m); c.beginPath(); c.roundRect(-S.cs / 2, -S.cs / 2, S.cs, S.cs, 24 * U); c.fill();
    c.restore();
  }
  c.restore();
}

/* ================================================================ S5 · "Cada frame pensado pra prender o olhar." (20–24) */
let _s5;
function s5L() {
  if (_s5) return _s5;
  const mk = (lines, maxW, maxS) => {
    const fs = fit(lines, FD, maxW, maxS), Ls = lines.map((t) => lay(t, FD(fs))), lh = fs * 1.0;
    const b0 = cy - ((lines.length - 1) * lh) / 2 + Ls[0].cap / 2;
    return { fs, Ls, lh, bases: Ls.map((_, i) => b0 + i * lh), xs: Ls.map((L) => cx - L.w / 2) };
  };
  const a = mk(P ? ["Cada", "frame"] : ["Cada frame"], W * (P ? 0.8 : 0.84), P ? 330 * U : 290 * U);
  const b = mk(["pensado"], W * (P ? 0.84 : 0.62), 300 * U);
  const c3 = mk(P ? ["pra", "prender"] : ["pra prender"], W * (P ? 0.84 : 0.8), P ? 300 * U : 270 * U);
  const dfs = fit(["o olhar."], FD, W * (P ? 0.84 : 0.6), 300 * U), dL = lay("o olhar", FD(dfs)), drd = dfs * 0.075, dgap = dfs * 0.04;
  const dx0 = cx - (dL.w + dgap + 2 * drd) / 2, dbase = cy + dL.cap / 2;
  // a letra "o" vira um olho
  const ox = gcx(dL, dx0, 0), oy = dbase - dL.xh / 2;
  return (_s5 = { a, b, c: c3, d: { fs: dfs, L: dL, rd: drd, x0: dx0, base: dbase, px: dx0 + dL.w + dgap + drd, py: dbase - drd, ox, oy, ri: dL.xh * 0.21 } });
}
const eyeLook = (x) => -1 * ioCubic(prog(x, 23.3, 23.42)) + 2 * ioCubic(prog(x, 23.48, 23.6)) - ioCubic(prog(x, 23.66, 23.74));
function s5(c, x) {
  const S = s5L();
  if (x < 21) {                        // "Cada frame": as letras despencam e amassam no chão
    bg(c, VIO);
    let g = 0; c.fillStyle = PAPER;
    S.a.Ls.forEach((L, li) => {
      const base = S.a.bases[li];
      glyphs(c, L, S.a.xs[li], base, () => {
        const st = 20 + 0.028 * g++, u = prog(x, st, st + 0.17);
        if (x < st) return false;
        if (u < 1) return { dy: -(1 - u * u) * (base + S.a.fs * 1.1), sy: 1.22, sx: 0.9 };
        const k = wobble(x - st - 0.17, 2.6, 9);
        return { sy: 1 - 0.3 * k, sx: 1 + 0.22 * k };
      });
    });
  } else if (x < 22) {                 // "pensado": encolhe do gigante, o tracking fecha
    bg(c, INK);
    const e = oExpo(prog(x, 21, 21.6)), s = mix(2.7, 1, e) * (1 + 0.03 * prog(x, 21.6, 22)), tr = mix(0.38, 0, e) * S.b.fs;
    const L = S.b.Ls[0], w = L.w + (L.text.length - 1) * tr;
    c.save(); c.translate(cx, cy); c.rotate(mix(-0.1, 0, e)); c.scale(s, s); c.translate(-cx, -cy);
    c.fillStyle = PAPER; glyphs(c, L, cx - w / 2, S.b.bases[0], null, tr);
    c.restore();
  } else if (x < 23) {                 // "pra prender": entra pela direita; colchetes violeta prendem a palavra
    bg(c, PAPER);
    let g = 0; c.fillStyle = INK;
    const li = S.c.Ls.length - 1, Lp = S.c.Ls[li], wk = nWords(Lp.text) - 1, [w0, w1] = wordSpan(Lp, S.c.xs[li], wk);
    const sq = 1 - 0.05 * bump(prog(x, 22.68, 22.95)), wc = (w0 + w1) / 2;
    S.c.Ls.forEach((L, l) => {
      const wm = wordMap(L.text);
      glyphs(c, L, S.c.xs[l], S.c.bases[l], (i) => {
        const st = 22 + 0.022 * g++, u = oExpo(prog(x, st, st + 0.42));
        const inW = l === li && wm[i] === wk, gx = gcx(L, S.c.xs[l], i);
        return { dx: (1 - u) * W * 0.75 + (inW ? (gx - wc) * (sq - 1) : 0), sx: inW ? sq : 1 };
      });
    });
    const bu = prog(x, 22.5, 22.78);
    if (bu > 0) {
      const fs = S.c.fs, gap = mix(0.95 * fs, 0.1 * fs, oBack(bu, 1.6)) * (0.8 + 0.2 * sq), base = S.c.bases[li];
      const top = base - Lp.cap * 1.08, bot = base + fs * 0.25, arm = 0.17 * fs;
      c.strokeStyle = VIO; c.lineWidth = 0.075 * fs; c.lineJoin = "miter"; c.lineCap = "butt";
      const l0 = wc - (w1 - w0) / 2 * sq - gap, r0 = wc + (w1 - w0) / 2 * sq + gap;
      c.beginPath(); c.moveTo(l0 + arm, top); c.lineTo(l0, top); c.lineTo(l0, bot); c.lineTo(l0 + arm, bot); c.stroke();
      c.beginPath(); c.moveTo(r0 - arm, top); c.lineTo(r0, top); c.lineTo(r0, bot); c.lineTo(r0 - arm, bot); c.stroke();
    }
  } else {                             // "o olhar.": o "o" vira um olho e a íris vira a próxima forma
    bg(c, INK);
    const D = S.d, L = D.L;
    c.fillStyle = PAPER;
    const out = (i) => iCubic(prog(x, 23.74 + 0.012 * i, 23.95 + 0.012 * i));
    maskLine(c, L, D.x0, D.base, (k, i) => {
      const u = oExpo(prog(x, 23 + 0.03 * i, 23.45 + 0.03 * i));
      if (u <= 0) return false;
      return { dy: (1 - u) * bandH(L) + out(i) * bandH(L) };
    });
    const ps = oBack(prog(x, 23.42, 23.62), 2.4), po = out(7);
    if (ps > 0 && po < 1) { c.save(); c.beginPath(); c.rect(-W, D.base - L.asc * 0.98, W * 3, bandH(L)); c.clip(); blob(c, D.px, D.py + po * bandH(L), D.rd * ps); c.restore(); }
    const e = ioExpo(prog(x, 23.74, 24.0)), is = oBack(prog(x, 23.18, 23.4), 2.2);
    if (is > 0) {
      const blink = 1 - 0.92 * bump(prog(x, 23.6, 23.7));
      const ex = mix(D.ox + eyeLook(x) * L.xh * 0.13, cx, e), ey = mix(D.oy, cy, e), r = mix(D.ri * is, S6R, e);
      blob(c, ex, ey, r, 1, mix(blink, 1, e));
    }
  }
}

/* ================================================================ S6 · morph (24–28) */
const S6R = (P ? 175 : 190) * U;
const KF = (P ? [[0, 0], [-220, -520], [200, -190], [-180, 250], [0, 0]] : [[0, 0], [-560, 70], [-190, -110], [430, 70], [0, 0]]).map(([a, b]) => [cx + a * U, cy + b * U]);
const NS = 240;
const SHAPES = [
  () => 1,
  (t) => 0.93 * Math.pow(Math.pow(Math.abs(Math.cos(t)), 4) + Math.pow(Math.abs(Math.sin(t)), 4), -1 / 4),
  (t) => 1.2 * Math.pow(Math.pow(Math.abs(Math.cos(t)), 1.15) + Math.pow(Math.abs(Math.sin(t)), 1.15), -1 / 1.15),
  (t) => 0.86 + 0.17 * cl(0.5 + 2.4 * Math.cos(12 * t)),
  (t) => Math.pow(Math.pow(Math.abs(Math.cos(t)) / 1.55, 8) + Math.pow(Math.abs(Math.sin(t)) / 0.87, 8), -1 / 8),
];
const RAD = SHAPES.map((f) => { const a = new Float32Array(NS); for (let i = 0; i < NS; i++) a[i] = f((i / NS) * TAU); return a; });
function s6Seg(x) { const i = cl(Math.floor(x - 24), 0, 3); return { i, e: ioExpo(prog(x, 24 + i, 24.55 + i)) }; }
function s6Ctrl(i) { const a = KF[i], b = KF[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], s = (i % 2 ? -1 : 1) * 0.32; return [mx - dy * s, my + dx * s]; }
function s6Pos(x) {
  const { i, e } = s6Seg(x), a = KF[i], b = KF[i + 1], k = s6Ctrl(i);
  const u = e, w0 = (1 - u) * (1 - u), w1 = 2 * (1 - u) * u, w2 = u * u;
  return [w0 * a[0] + w1 * k[0] + w2 * b[0], w0 * a[1] + w1 * k[1] + w2 * b[1]];
}
function s6Shape(c, x, mode, col) {
  const { i, e } = s6Seg(x), [px, py] = s6Pos(x), ra = RAD[i], rb = RAD[i + 1];
  const rot = (i + e) * (Math.PI / 2);
  const grow = x >= 27.6 ? ioExpo(prog(x, 27.6, 28.0)) : 0;
  const cover = Math.max(W / (2 * 1.55 * S6R), H / (2 * 0.87 * S6R)) * 1.18;
  const sc = mix(1, cover, grow);
  const st = stretchOf(s6Pos, x, 1 / 7000, 0.45);
  c.save(); c.translate(px, py);
  c.rotate(st.ang); c.scale(st.s, 1 / Math.sqrt(st.s)); c.rotate(-st.ang);
  c.beginPath();
  for (let j = 0; j <= NS; j++) {
    const jj = j % NS, t = (jj / NS) * TAU, r = mix(ra[jj], rb[jj], e) * S6R * sc;
    const xx = r * Math.cos(t + rot), yy = r * Math.sin(t + rot);
    j ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
  }
  c.closePath();
  if (mode === "fill") { c.fillStyle = col; c.fill(); } else { c.strokeStyle = col; c.lineWidth = 2 * U; c.stroke(); }
  // furo da engrenagem
  const gw = i === 2 ? e : i === 3 ? 1 - e : 0;
  if (mode === "fill" && gw > 0.01) blob(c, 0, 0, 0.3 * S6R * oBack(gw, 1.2), 1, 1, 0, INK);
  c.restore();
}
function s6(c, x) {
  bg(c, INK);
  const grow = x >= 27.6 ? ioExpo(prog(x, 27.6, 28.0)) : 0;
  // trajetória pontilhada + keyframes (losangos)
  if (grow < 1) {
    c.fillStyle = G3;
    for (let i = 0; i < 4; i++) {
      if (x < 24 + i) break;
      const e = i < Math.floor(x - 24) ? 1 : s6Seg(x).e, k = s6Ctrl(i), pts = quadPts(KF[i], k, KF[i + 1], 60);
      let acc = 0;
      for (let j = 1; j < pts.length; j++) {
        acc += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
        if (j / (pts.length - 1) > e) break;
        if (acc > 22 * U) { acc = 0; c.beginPath(); c.arc(pts[j][0], pts[j][1], 3 * U, 0, TAU); c.fill(); }
      }
    }
    for (let i = 0; i < 5; i++) {
      const at = i === 0 ? 24 : 24 + (i - 1) + 0.55, s = oBack(prog(x, at, at + 0.25), 2.4);
      if (s <= 0 || (i === 4)) continue;
      const [a, b] = KF[i]; c.save(); c.translate(a, b); c.rotate(Math.PI / 4); const d = 11 * U * s;
      c.fillStyle = PAPER; c.fillRect(-d, -d, 2 * d, 2 * d); c.restore();
    }
    // onion skin
    for (let j = 3; j >= 1; j--) { c.globalAlpha = [0, 0.55, 0.35, 0.2][j]; s6Shape(c, x - 0.045 * j, "stroke", G4); }
    c.globalAlpha = 1;
  }
  s6Shape(c, x, "fill", mixc(VIO, PAPER, grow));
  caption(c, "Motion design", x, 24.15, 27.6, "dark");
}

/* ================================================================ S7 · tipografia cinética (28–32) */
let _s7;
function s7L() {
  if (_s7) return _s7;
  const one = (t, maxW, maxS) => { const fs = fit([t], FD, maxW, maxS), L = lay(t, FD(fs)); return { fs, L, x0: cx - L.w / 2, base: cy + L.cap / 2 }; };
  const m = one("MOTION", W * (P ? 0.86 : 0.7), 360 * U), d = one("DESIGN", W * (P ? 0.86 : 0.7), 360 * U), v = one("VFX", W * (P ? 0.8 : 0.5), 420 * U);
  const pfs = fit(["PÓS."], FD, W * (P ? 0.7 : 0.45), 380 * U), pL = lay("PÓS", FD(pfs)), rd = pfs * 0.075, gap = pfs * 0.04;
  const px0 = cx - (pL.w + gap + 2 * rd) / 2, pbase = cy + pL.cap / 2;
  const tops = [0, 1, 2].map((i) => [gcx(pL, px0, i), pbase - pL.cap * (i === 1 ? 1.27 : 1.0) - rd]);
  tops.push([px0 + pL.w + gap + rd, pbase - rd]);
  return (_s7 = { m, d, v, p: { fs: pfs, L: pL, rd, x0: px0, base: pbase, tops } });
}
const HOPS = [31.22, 31.47, 31.72, 31.97];
function s7Dot(x) {
  const S = s7L().p, t = S.tops;
  if (x < HOPS[0]) { const u = prog(x, 31.0, HOPS[0]); return [t[0][0], mix(-S.rd * 3, t[0][1], u * u)]; }
  for (let j = 0; j < 3; j++) if (x < HOPS[j + 1]) {
    const u = prog(x, HOPS[j], HOPS[j + 1]);
    return [mix(t[j][0], t[j + 1][0], u), mix(t[j][1], t[j + 1][1], u) - 0.34 * S.fs * 4 * u * (1 - u)];
  }
  return t[3];
}
function s7(c, x, skipDot) {
  const S = s7L();
  let theme = "dark";
  if (x < 29) {                        // MOTION: as letras viram como cartas
    bg(c, PAPER); theme = "light"; c.fillStyle = INK;
    glyphs(c, S.m.L, S.m.x0, S.m.base, (i) => {
      const u = prog(x, 28 + 0.04 * i, 28.42 + 0.04 * i);
      if (u <= 0) return false;
      return { sy: Math.cos((1 - oBack(u, 1.8)) * (Math.PI / 2)), oy: S.m.L.cap / 2 };
    });
  } else if (x < 30) {                 // DESIGN: mola que abre do centro
    bg(c, INK); c.fillStyle = PAPER;
    const sp = spring(x - 29, 1.7, 7);
    glyphs(c, S.d.L, S.d.x0, S.d.base, (i) => {
      const gx = gcx(S.d.L, S.d.x0, i);
      return { dx: (gx - cx) * (sp - 1), sx: Math.max(sp, 0.002), sy: 1 + (1 - sp) * 0.5, oy: S.d.L.cap / 2 };
    });
  } else if (x < 31) {                 // VFX: fatias que se encaixam
    bg(c, VIO); theme = "vio"; c.fillStyle = PAPER;
    const n = 9, top = S.v.base - S.v.L.cap * 1.06, hh = (S.v.L.cap * 1.12) / n;
    for (let j = 0; j < n; j++) {
      let dx = (1 - oExpo(prog(x, 30 + 0.025 * j, 30.42 + 0.025 * j))) * W * 0.95 * (j % 2 ? 1 : -1);
      if (x >= 30.55 && x < 30.75) dx += (rnd(77, j * 13 + Math.floor((x - 30.55) * 30)) - 0.5) * 110 * U * (1 - prog(x, 30.55, 30.75));
      c.save(); c.beginPath(); c.rect(-W, top + j * hh, W * 3, hh + 0.6); c.clip();
      glyphs(c, S.v.L, S.v.x0 + dx, S.v.base, null);
      c.restore();
    }
  } else {                             // PÓS: o ponto quica de letra em letra até virar o ponto final
    bg(c, INK); c.fillStyle = PAPER;
    const p = S.p;
    maskLine(c, p.L, p.x0, p.base, (k, i) => {
      const u = oExpo(prog(x, 31 + 0.04 * i, 31.4 + 0.04 * i)), hit = wobble(x - HOPS[i], 2.4, 9);
      if (u <= 0) return false;
      return { dy: (1 - u) * bandH(p.L), sy: 1 - (x >= HOPS[i] ? 0.12 * hit : 0) };
    });
    if (!skipDot && x >= 31.0) {
      const [dx, dy] = s7Dot(x), last = HOPS.findLast((h) => h <= x), sq = last !== undefined ? 0.3 * Math.exp(-(x - last) * 12) : 0;
      blob(c, dx, dy + p.rd * sq, p.rd, 1 + sq * 0.8, 1 - sq);
    }
  }
  caption(c, "Tipografia cinética", x, 28.15, 32.4, theme);
}

/* ================================================================ S8 · UI animada (32–35,75) */
let _s8;
function s8L() {
  if (_s8) return _s8;
  const w = (P ? 900 : 900) * U, h = (P ? 640 : 560) * U, x = cx, y = cy - (P ? 60 : 30) * U;
  return (_s8 = { w, h, x, y, L: x - w / 2, T: y - h / 2, nb: 18, hmax: (P ? 300 : 240) * U });
}
function eqH(x, i) {
  const ph = x - Math.floor(x), ph2 = x + 0.5 - Math.floor(x + 0.5);
  const w = 0.35 + 0.65 * rnd(81, i + 31 * Math.floor(x)), w2 = 0.3 + 0.7 * rnd(83, i + 17 * Math.floor(x + 0.5));
  return cl(0.1 + 0.9 * (w * Math.exp(-ph * 3.2) + 0.45 * w2 * Math.exp(-ph2 * 5)) + 0.06 * Math.sin(x * 3 + i));
}
function cursorPath(c, x0, y0, s) {
  const pts = [[0, 0], [0, 38], [9.5, 29.5], [16, 44], [23, 41], [16.5, 27], [28, 27]];
  c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(x0 + a * s, y0 + b * s) : c.moveTo(x0 + a * s, y0 + b * s))); c.closePath();
}
function s8(c, x, noBg) {
  if (!noBg) bg(c, PAPER);
  const S = s8L(), { w, h, L: Lx, T: Ty } = S;
  const flip = Math.cos((Math.PI / 2) * ioCubic(prog(x, 35.5, 35.75)));
  // o ponto do "PÓS." vira o card
  const g = ioExpo(prog(x, 32.22, 32.66));
  if (g < 1) {
    const d7 = s7Dot(32.0), u = ioCubic(prog(x, 32.0, 32.4));
    const px = mix(d7[0], S.x, u), py = mix(d7[1], S.y, u) - Math.sin(Math.PI * u) * 90 * U;
    const rd = s7L().p.rd, ww = mix(2 * rd, w, g), hh = mix(2 * rd, h, g), rr = mix(rd, 40 * U, g);
    c.fillStyle = mixc(VIO, WHITE, g); c.beginPath(); c.roundRect(px - ww / 2, py - hh / 2, ww, hh, rr); c.fill();
    caption(c, "UI animada", x, 32.4, 35.5, "light");
    return;
  }
  c.save(); c.translate(S.x, S.y); c.scale(flip, 1); c.translate(-S.x, -S.y);
  c.save(); c.shadowColor = "rgba(10,10,11,0.10)"; c.shadowBlur = 60 * U; c.shadowOffsetY = 24 * U;
  c.fillStyle = WHITE; c.beginPath(); c.roundRect(Lx, Ty, w, h, 40 * U); c.fill(); c.restore();
  // cabeçalho: avatar, linhas skeleton, toggle
  const av = oBack(prog(x, 32.5, 32.75), 2);
  blob(c, Lx + 74 * U, Ty + 76 * U, 32 * U * av, 1, 1, 0, G6);
  c.fillStyle = G6;
  for (const [i, bw, bh2, yy] of [[0, 250, 18, 58], [1, 160, 14, 88]]) {
    const u = oExpo(prog(x, 32.55 + 0.07 * i, 32.95 + 0.07 * i));
    if (u > 0) { c.beginPath(); c.roundRect(Lx + 128 * U, Ty + yy * U, bw * U * u, bh2 * U, bh2 * U / 2); c.fill(); }
  }
  const ts = oBack(prog(x, 32.6, 32.85), 2), tx = Lx + w - 92 * U, ty = Ty + 76 * U;
  if (ts > 0) {
    const on = spring(x - 33.0, 1.4, 7);
    c.save(); c.translate(tx, ty); c.scale(ts, ts);
    c.fillStyle = on > 0.5 ? VIO : "#d4d4da"; c.beginPath(); c.roundRect(-46 * U, -25 * U, 92 * U, 50 * U, 25 * U); c.fill();
    blob(c, mix(-21, 21, on) * U, 0, 19 * U, 1 + 0.25 * bump(prog(x, 33.0, 33.2)), 1, 0, WHITE);
    c.restore();
  }
  // equalizador no ritmo da música
  const bwid = 26 * U, gp = 15 * U, tot = S.nb * (bwid + gp) - gp, ex0 = S.x - tot / 2, eb = Ty + h - 160 * U;
  for (let i = 0; i < S.nb; i++) {
    const gr = oExpo(prog(x, 32.65 + 0.015 * i, 33.0 + 0.015 * i));
    if (gr <= 0) continue;
    const hh = S.hmax * eqH(x, i) * gr;
    c.fillStyle = x >= 33.0 + 0.02 * i ? VIO : G5;
    c.beginPath(); c.roundRect(ex0 + i * (bwid + gp), eb - hh, bwid, hh, bwid / 2); c.fill();
  }
  // botão: clique → spinner → ✓
  const bs = oBack(prog(x, 32.75, 33.05), 2) * (1 - 0.07 * bump(prog(x, 33.98, 34.14))) * (1 + 0.07 * wobble(x - 35.0, 2, 8) * (x >= 35 ? 1 : 0));
  const bx = S.x, by = Ty + h - 72 * U, bw2 = 300 * U, bh3 = 84 * U;
  if (bs > 0) {
    c.save(); c.translate(bx, by); c.scale(bs, bs);
    c.fillStyle = x >= 35.0 ? VIO : INK; c.beginPath(); c.roundRect(-bw2 / 2, -bh3 / 2, bw2, bh3, bh3 / 2); c.fill();
    const tsc = 1 - iBack(prog(x, 34.0, 34.12), 1.5);
    if (tsc > 0.01) { const Lb = lay("Começar", FI(34 * U, 600)); c.save(); c.scale(tsc, tsc); c.fillStyle = PAPER; glyphs(c, Lb, -Lb.w / 2, Lb.cap / 2, null); c.restore(); }
    if (x >= 34.1 && x < 35.0) {
      const sp = oBack(prog(x, 34.1, 34.25), 2), a = (x - 34.1) * TAU * 1.6;
      c.strokeStyle = PAPER; c.lineWidth = 5 * U; c.lineCap = "round";
      c.beginPath(); c.arc(0, 0, 20 * U * sp, a, a + 4.6); c.stroke();
    }
    if (x >= 35.0) {
      c.strokeStyle = PAPER; c.lineWidth = 7 * U; c.lineCap = "round"; c.lineJoin = "round";
      polyPart(c, [[-16 * U, 0], [-5 * U, 11 * U], [17 * U, -13 * U]], 0, oExpo(prog(x, 35.0, 35.25)));
    }
    c.restore();
  }
  c.restore();
  // cursor
  if (x >= 33.25 && x < 34.95) {
    const tgt = [bx + 34 * U, by + 14 * U], from = [W + 80 * U, H * 0.86], away = [W + 140 * U, H + 160 * U];
    const u = oCubic(prog(x, 33.25, 33.9)), v = iCubic(prog(x, 34.35, 34.95));
    let px = mix(from[0], tgt[0], u), py = mix(from[1], tgt[1], u) - Math.sin(Math.PI * u) * 60 * U;
    px = mix(px, away[0], v); py = mix(py, away[1], v);
    const cs = 1.45 * U * (1 - 0.16 * bump(prog(x, 33.97, 34.16)));
    cursorPath(c, px, py, cs); c.fillStyle = INK; c.fill(); c.strokeStyle = WHITE; c.lineWidth = 3 * U; c.lineJoin = "round"; c.stroke();
  }
  caption(c, "UI animada", x, 32.4, 35.5, "light");
}

/* ================================================================ S9 · anel 3D de frames (35,75–40) */
const NC = 12, CW = 280 * U, CH = 360 * U, RR = (P ? 540 : 700) * U, FOC = 1500 * U;
const CARD_BG = [WHITE, VIO, "#18181c", PAPER, G2, "#1f1f24", PAPER, VIO, "#18181c", G3, PAPER, "#18181c"];
function cardContent(c, i, map, s) {      // conteúdo em coordenadas locais (a, b) ∈ [-0,5; 0,5]
  const P2 = (a, b) => map(a, b);
  const rect = (a0, b0, a1, b1, col) => { poly(c, [P2(a0, b0), P2(a1, b0), P2(a1, b1), P2(a0, b1)]); c.fillStyle = col; c.fill(); };
  const circ = (a, b, r, col, n = 28) => { const pts = []; for (let k = 0; k < n; k++) { const t = (k / n) * TAU; pts.push(P2(a + (r * Math.cos(t)) / CW * U, b + (r * Math.sin(t)) / CH * U)); } poly(c, pts); c.fillStyle = col; c.fill(); };
  switch (i) {
    case 0: rect(-0.36, -0.38, 0.1, -0.33, G6); rect(-0.36, -0.29, -0.05, -0.25, G6);
      for (let k = 0; k < 7; k++) { const hh = 0.08 + 0.2 * rnd(3, k); rect(-0.36 + k * 0.105, 0.12 - hh, -0.29 + k * 0.105, 0.12, VIO); }
      rect(-0.25, 0.26, 0.25, 0.37, VIO); break;
    case 1: circ(0, 0, 92, PAPER); break;
    case 2: { const R = 120; poly(c, LOGO.stem.map(([a, b]) => P2((a * R) / CW * U, (b * R) / CH * U))); c.fillStyle = "#9a3cf9"; c.fill();
      poly(c, LOGO.chev.map(([a, b]) => P2((a * R) / CW * U, (b * R) / CH * U))); c.fillStyle = "#d3d8df"; c.fill(); break; }
    case 3: for (let k = 0; k < 5; k++) rect(-0.36, -0.34 + k * 0.15, 0.36, -0.27 + k * 0.15, INK); break;
    case 4: poly(c, [P2(0, -0.26), P2(0.32, 0.24), P2(-0.32, 0.24)]); c.fillStyle = VIO; c.fill(); break;
    case 5: for (let a = 0; a < 4; a++) for (let b = 0; b < 5; b++) circ(-0.27 + a * 0.18, -0.32 + b * 0.16, 11, PAPER, 12); break;
    case 6: { const pts = []; for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU, r = 100 * RAD[1][Math.floor((k / 40) * NS)]; pts.push(P2((r * Math.cos(t)) / CW * U, (r * Math.sin(t)) / CH * U)); } poly(c, pts); c.fillStyle = VIO; c.fill(); break; }
    case 7: for (let k = 0; k < 5; k++) { const hh = 0.15 + 0.5 * rnd(9, k); rect(-0.34 + k * 0.14, 0.34 - hh, -0.25 + k * 0.14, 0.34, INK); } break;
    case 8: { c.strokeStyle = PAPER; c.lineWidth = Math.max(1, 8 * U * s); c.lineCap = "round"; c.beginPath(); for (let k = 0; k <= 30; k++) { const a = -0.36 + (k / 30) * 0.72, p = P2(a, Math.sin(k / 30 * TAU * 1.5) * 0.14); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke(); break; }
    case 9: poly(c, [P2(0, -0.27), P2(0.3, 0), P2(0, 0.27), P2(-0.3, 0)]); c.fillStyle = PAPER; c.fill(); break;
    case 10: circ(0, 0, 100, VIO); circ(0, 0, 52, PAPER); break;
    case 11: { c.lineWidth = Math.max(1, 9 * U * s); for (const [col, a0, a1] of [[G2, 0, TAU], [VIO, -Math.PI / 2, Math.PI * 0.9]]) { c.strokeStyle = col; c.beginPath(); for (let k = 0; k <= 40; k++) { const t = a0 + (a1 - a0) * (k / 40), p = P2((95 * Math.cos(t)) / CW * U, (95 * Math.sin(t)) / CH * U); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke(); } break; }
  }
}
function ringTheta(x) {
  let th = (x - 35.75) * 0.1;
  for (const s of [36.5, 37, 37.5, 38]) th += (Math.PI / 6) * oBack(prog(x, s, s + 0.36), 1.5);
  return th;
}
/* layout final dos clipes (timeline) */
let _tl;
function tlL() {
  if (_tl) return _tl;
  const lx0 = (P ? 60 : 140) * U, lx1 = W - (P ? 60 : 140) * U, lh = (P ? 104 : 92) * U, gap = 22 * U, len = lx1 - lx0;
  const y0 = cy + (P ? 60 : 40) * U, lanes = [0, 1, 2].map((j) => y0 + (j - 1) * (lh + gap));
  const clips = [];
  for (let j = 0; j < 3; j++) {
    const ws = [0, 1, 2, 3].map((k) => 0.6 + 0.8 * rnd(41, j * 4 + k)), sum = ws.reduce((a, b) => a + b, 0), gc = 10 * U;
    let xx = lx0;
    ws.forEach((wv, k) => {
      const ww = ((len - 3 * gc) * wv) / sum, i = j * 4 + k;
      clips.push({ i, lane: j, x: xx, y: lanes[j] - lh / 2, w: ww, h: lh, off: (rnd(43, i) - 0.5) * 2 * 260 * U + (j - 1) * 120 * U });
      xx += ww + gc;
    });
  }
  return (_tl = { lx0, lx1, lh, len, lanes, clips, kfY: lanes[0] - lh / 2 - 46 * U, headY: lanes[0] - lh / 2 - 118 * U, botY: lanes[2] + lh / 2 + 24 * U });
}
const SNAP = [40.25, 40.5, 40.75];
function clipRect(i, x) { const C = tlL().clips[i], s = oBack(prog(x, SNAP[C.lane], SNAP[C.lane] + 0.32), 2); return [C.x + C.off * (1 - s), C.y, C.w, C.h]; }
const rectMap = (r) => (a, b) => [r[0] + (a + 0.5) * r[2], r[1] + (b + 0.5) * r[3]];
function s9(c, x) {
  bg(c, INK);
  const th = ringTheta(x), tilt = mix(0.24, 0.1, ioCubic(prog(x, 36, 38.5)));
  const ca = Math.cos(tilt), sa = Math.sin(tilt);
  const frontY = mix(s8L().y, cy + (P ? 40 : 70) * U, ioCubic(prog(x, 35.9, 37.2)));
  const RCY = frontY - RR * sa * (FOC / (FOC + RR * (1 - ca)));
  const cards = [];
  for (let i = 0; i < NC; i++) {
    const ph = (i / NC) * TAU + th, cphi = Math.cos(ph), sphi = Math.sin(ph);
    const first = i === 0 ? ioExpo(prog(x, 35.8, 36.35)) : 1;
    const w = i === 0 ? mix(s8L().w, CW, first) : CW, h = i === 0 ? mix(s8L().h, CH, first) : CH;
    const flipIn = i === 0 ? Math.sin((Math.PI / 2) * ioCubic(prog(x, 35.75, 36.0))) : 1;
    const ord = Math.min(i, NC - i), app = i === 0 ? 1 : oBack(prog(x, 35.9 + 0.03 * ord, 36.3 + 0.03 * ord), 1.6);
    const proj = (a, b) => {
      const X3 = RR * sphi + cphi * w * a * flipIn * app, Y3 = h * b * app, Z3 = RR * (1 - cphi) + sphi * w * a * flipIn * app;
      const y2 = Y3 * ca - (Z3 - RR) * sa, z2 = RR + (Z3 - RR) * ca + Y3 * sa, s = FOC / (FOC + z2);
      return [cx + X3 * s, RCY + y2 * s, s, z2];
    };
    const fl = ioExpo(prog(x, 38.5 + 0.035 * i, 39.55 + 0.035 * i)), r = clipRect(i, Math.max(x, 40)), rm = rectMap(r);
    const map = (a, b) => { const p = proj(a, b); if (fl <= 0) return p; const q = rm(a, b); return [mix(p[0], q[0], fl), mix(p[1], q[1], fl)]; };
    const z = proj(0, 0)[3] * (1 - fl);
    cards.push({ i, z, map, cphi, fl, s: proj(0, 0)[2], app });
  }
  cards.sort((a, b) => b.z - a.z);
  for (const k of cards) {
    if (k.app <= 0.001) continue;
    const quad = [k.map(-0.5, -0.5), k.map(0.5, -0.5), k.map(0.5, 0.5), k.map(-0.5, 0.5)];
    const front = (quad[1][0] - quad[0][0]) * (quad[3][1] - quad[0][1]) - (quad[1][1] - quad[0][1]) * (quad[3][0] - quad[0][0]) > 0;
    poly(c, quad); c.fillStyle = front ? CARD_BG[k.i] : "#1a1a1f"; c.fill();
    if (front) cardContent(c, k.i, k.map, k.s);
    const dark = cl((k.z / (2 * RR)) * 0.75) * (1 - k.fl);
    if (dark > 0.01) { poly(c, quad); c.fillStyle = rgba(INK, dark); c.fill(); }
  }
  caption(c, "3D & VFX", x, 36.1, 38.6, "dark");
}

/* ================================================================ S10 · timeline (40–44) */
const PH0 = 40.75, PH1 = 43.0;
function phX(x) { const S = tlL(); return S.lx0 + S.len * prog(x, PH0, PH1); }
const KFX = (k) => tlL().lx0 + tlL().len * ((k + 0.5) / 10);
function tc(t) { const s = Math.floor(t), f = Math.floor((t - s) * 60 + 1e-6), p = (n) => String(n).padStart(2, "0"); return `00:00:${p(s)}:${p(f)}`; }
function s10(c, x) {
  bg(c, INK);
  const S = tlL(), col = oExpo(prog(x, 43.1, 43.5));
  // trilhas
  S.lanes.forEach((ly) => {
    const wv = S.len * (1 - col), x0 = cx - wv / 2;
    if (wv > 1) { c.fillStyle = G1; c.beginPath(); c.roundRect(x0, ly - S.lh / 2 - 6 * U, wv, S.lh + 12 * U, 18 * U); c.fill(); }
  });
  // clipes (os mesmos frames do anel 3D)
  const pxh = phX(x);
  S.clips.forEach((C) => {
    const fallU = iCubic(prog(x, 43.0 + 0.02 * C.i, 43.55 + 0.02 * C.i));
    if (fallU >= 1) return;
    const r = clipRect(C.i, x), rr = [r[0], r[1] + fallU * H * 0.9, r[2], r[3]];
    c.save(); c.translate(rr[0] + rr[2] / 2, rr[1] + rr[3] / 2); c.rotate((C.i % 2 ? 1 : -1) * 0.4 * fallU * fallU); c.translate(-(rr[0] + rr[2] / 2), -(rr[1] + rr[3] / 2));
    c.save(); c.beginPath(); c.roundRect(rr[0], rr[1], rr[2], rr[3], 14 * U); c.clip();
    c.fillStyle = CARD_BG[C.i]; c.fillRect(rr[0], rr[1], rr[2], rr[3]);
    cardContent(c, C.i, rectMap(rr), 0.5);
    if (pxh >= rr[0] && pxh <= rr[0] + rr[2] && x < PH1) { c.fillStyle = "rgba(255,255,255,0.16)"; c.fillRect(rr[0], rr[1], rr[2], rr[3]); }
    c.restore(); c.restore();
  });
  // keyframes que nascem quando o playhead passa
  for (let k = 0; k < 10; k++) {
    const kx = KFX(k), at = PH0 + (PH1 - PH0) * ((kx - S.lx0) / S.len), s = oBack(prog(x, at, at + 0.22), 2.6) * (1 - iBack(prog(x, 43.0, 43.25)));
    if (s <= 0) continue;
    c.save(); c.translate(kx, S.kfY); c.rotate(Math.PI / 4); const d = 10 * U * s; c.fillStyle = k % 3 === 2 ? VIO : PAPER; c.fillRect(-d, -d, 2 * d, 2 * d); c.restore();
  }
  // playhead → vira o cronômetro
  const drop = oBack(prog(x, 40.6, 40.9), 1.8);
  if (drop <= 0) { caption(c, "Edição & finalização", x, 40.2, 43.0, "dark"); return; }
  const toC = ioExpo(prog(x, 43.0, 43.3)), hx = mix(pxh, RC.x, toC), m = ioExpo(prog(x, 43.3, 43.95));
  const ytop = S.headY + 30 * U, ybot = S.botY;
  const N = 120, pts = [];
  for (let k = 0; k <= N; k++) {
    const u = k / N, ly = mix(ytop, ybot, u) - (1 - drop) * 200 * U, a = -Math.PI / 2 + TAU * u;
    pts.push([mix(hx, RC.x + RC.r * Math.cos(a), m), mix(ly, RC.y + RC.r * Math.sin(a), m)]);
  }
  c.strokeStyle = mixc(VIO, G2, m); c.lineWidth = mix(4, 12, m) * U; c.lineCap = m > 0.99 ? "butt" : "round";
  polyPart(c, pts, 0, 1);
  // cabeça do playhead → pino
  const head = [hx - 16 * U, S.headY - (1 - drop) * 200 * U, 32 * U, 34 * U], pin = PIN(RC.r, RC.x, RC.y);
  c.fillStyle = mixc(VIO, G3, m);
  const hs = lerpRect(head, pin.stem, m), hc = lerpRect([head[0], head[1], head[2], 0.01], pin.cap, m);
  c.beginPath(); c.roundRect(hs[0], hs[1], hs[2], hs[3], 6 * U * (1 - m)); c.fill();
  if (m > 0.01) { c.beginPath(); c.roundRect(...hc, 10 * U * m); c.fill(); }
  if (m < 0.01) { poly(c, [[hx - 16 * U, head[1] + 34 * U], [hx + 16 * U, head[1] + 34 * U], [hx, head[1] + 50 * U]]); c.fill(); }
  const ls = 1 - iBack(prog(x, 42.95, 43.12));
  if (ls > 0.01) {
    const Lt = lay(tc(T(x)), FI(28 * U, 600));
    c.save(); c.translate(hx + 30 * U, head[1] + 17 * U); c.scale(ls, ls); c.fillStyle = PAPER; glyphs(c, Lt, 0, Lt.cap / 2, null); c.restore();
  }
  caption(c, "Edição & finalização", x, 40.2, 43.0, "dark");
}

/* ================================================================ S11 · "Cada segundo conta." → logo (44–52) */
const LOGO = {
  // medido no mark-lg.png (centro e raio do anel = 1)
  arcA: [-123.6, 29.4], arcB: [57.7, 137.6], th: 0.1,
  pin: [0.022, -0.874, 0.052, 0.219],
  stem: [[-0.732, -0.679], [-0.449, -0.540], [-0.449, 0.658], [-0.732, 0.474]],
  chev: [[0.266, -0.605], [0.608, -0.605], [0.025, -0.066], [0.866, 0.732], [0.493, 0.726], [-0.342, -0.066]],
};
const LG = { x: cx, y: cy - (P ? 230 : 120) * U, r: (P ? 215 : 168) * U };
let _wm;
function wmL() {
  if (_wm) return _wm;
  const fs = (P ? 150 : 128) * U, L = lay("Kronografx", FD(fs)), base = LG.y + LG.r + (P ? 205 : 172) * U;
  const tL = lay("Motion design · VFX · Pós-produção", FI((P ? 40 : 36) * U, 500));
  return (_wm = { fs, L, x0: cx - L.w / 2, base, tL, tx0: cx - tL.w / 2, tbase: base + (P ? 92 : 78) * U });
}
const D2R = Math.PI / 180;
function conicFor(c, x0, y0, stops) { const g = c.createConicGradient(0, x0, y0); stops.forEach(([deg, col]) => g.addColorStop(((deg % 360) + 360) % 360 / 360, col)); return g; }
/* o logo. o: {x, y, r, ring(0 = anel violeta inteiro → 1 = arcos do logo), stem, chev, shine, pinDy, s} */
function drawLogo(c, o) {
  const { x: lx, y: ly, r: R } = o;
  if (R <= 0.5) return;
  const e = o.ring, th = mix(12 * U, LOGO.th * R, e);
  const gA = (LOGO.arcB[0] - LOGO.arcA[1]) / 2 * (1 - e), gB = (360 + LOGO.arcA[0] - LOGO.arcB[1]) / 2 * (1 - e);
  const A = [LOGO.arcA[0] - gB, LOGO.arcA[1] + gA], B = [LOGO.arcB[0] - gA, LOGO.arcB[1] + gB];
  const ga = conicFor(c, lx, ly, [[0, "#7c21fc"], [29.4, "#7c21fc"], [57, "#c06cff"], [95, "#bb66fd"], [112, "#8a4cdc"], [137.6, "#4d26b6"], [200, "#4d26b6"], [236.4, "#d4d9df"], [300, "#dfe3ea"], [320, "#ffffff"], [330, "#e0ccfe"], [340, "#9f5cfd"], [350, "#7c21fc"], [359.9, "#7c21fc"]]);
  c.lineCap = "butt"; c.lineWidth = th;
  for (const [a0, a1] of [A, B]) {
    c.strokeStyle = ga; c.beginPath(); c.arc(lx, ly, R, a0 * D2R, a1 * D2R); c.stroke();
    if (e < 1) { c.globalAlpha = 1 - e; c.strokeStyle = VIO; c.beginPath(); c.arc(lx, ly, R, a0 * D2R, a1 * D2R); c.stroke(); c.globalAlpha = 1; }
  }
  // pino
  const pinL = [lx + LOGO.pin[0] * R, ly + LOGO.pin[1] * R + (o.pinDy || 0), LOGO.pin[2] * R, LOGO.pin[3] * R];
  const pw = PIN(o.r0 || R, lx, ly), pe = cl(o.pinM === undefined ? 1 : o.pinM);
  c.fillStyle = mixc(G3, "#f0f0f3", pe);
  const ps = lerpRect(pw.stem, pinL, pe), pc = lerpRect(pw.cap, pinL, pe);
  c.fillRect(ps[0], ps[1], ps[2], ps[3]); c.beginPath(); c.roundRect(pc[0], pc[1], pc[2], pc[3], 10 * U * (1 - pe) + 1); c.fill();
  // haste violeta
  if (o.stem > 0.001) {
    const s = o.stem, cxs = -0.59, cys = 0.0;
    const pts = LOGO.stem.map(([a, b]) => [lx + (cxs + (a - cxs) + -0.35 * (1 - s)) * R, ly + (cys + (b - cys) * s) * R]);
    const g = c.createLinearGradient(0, ly - 0.68 * R, 0, ly + 0.66 * R); g.addColorStop(0, "#ad42ff"); g.addColorStop(1, "#8a2cf5");
    poly(c, pts); c.fillStyle = g; c.fill();
  }
  // divisa prateada
  if (o.chev > 0.001) {
    const s = o.chev, k = mix(0.5, 1, s), ccx = 0.26, ccy = 0.06;
    const pts = LOGO.chev.map(([a, b]) => [lx + (ccx + (a - ccx) * k + 0.45 * (1 - s)) * R, ly + (ccy + (b - ccy) * k) * R]);
    const g = c.createLinearGradient(lx + 0.62 * R, ly - 0.62 * R, lx - 0.1 * R, ly + 0.45 * R);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.55, "#b8bfca"); g.addColorStop(1, "#cdd2da");
    poly(c, pts); c.fillStyle = g; c.fill();
    if (o.shine > 0 && o.shine < 1) {
      c.save(); poly(c, pts); c.clip();
      const bx = lx + mix(-0.9, 1.3, ioCubic(o.shine)) * R;
      c.translate(bx, ly); c.rotate(0.5); c.fillStyle = "rgba(255,255,255,0.8)"; c.fillRect(-0.07 * R, -2 * R, 0.14 * R, 4 * R);
      c.restore();
    }
  }
}
function s11(c, x) {
  bg(c, INK);
  const S = rcL(), R = RC.r;
  const out = iBack(prog(x, 47.72, 47.98), 1.4);           // antecipação: tudo encolhe antes da trava
  const f = ioCubic(prog(x, 44.15, 47.5));
  const L48 = oExpo(prog(x, 47.95, 48.3));                  // anel → logo
  if (x < 48.3) {
    // texto + número + palavras (somem na antecipação)
    const sc = 1 - out;
    if (sc > 0.01) {
      const ax = P ? cx : S.hx;
      c.save(); c.translate(ax, S.hy[0]); c.scale(sc, sc); c.translate(-ax, -S.hy[0]);
      c.fillStyle = PAPER; header(c, x, ["Cada segundo", "conta."], 44.1);
      c.restore();
      c.save(); c.translate(ax, S.wy); c.scale(sc, sc); c.translate(-ax, -S.wy);
      slotWords(c, x, GAIN, GAIN_AT, PAPER, VIO);
      c.restore();
      clockNumber(c, Math.floor(3 * f * 10 + 1e-6) / 10, x, PAPER, sc * oBack(prog(x, 44.0, 44.3), 2));
    }
    if (L48 <= 0) {
      const ring = 1 - 0.08 * ioCubic(prog(x, 47.72, 47.98));
      c.save(); c.translate(RC.x, RC.y); c.scale(ring, ring); c.translate(-RC.x, -RC.y);
      c.lineCap = "butt"; c.lineWidth = 12 * U;
      c.strokeStyle = G2; c.beginPath(); c.arc(RC.x, RC.y, R, 0, TAU); c.stroke();
      if (f > 0) { c.strokeStyle = VIO; c.beginPath(); c.arc(RC.x, RC.y, R, -Math.PI / 2, -Math.PI / 2 + TAU * f); c.stroke(); }
      ticks(c, TAU - 1e-4, (j, a) => (a <= TAU * f + 1e-6 && f > 0 ? PAPER : G3));
      drawPin(c, PIN(R, RC.x, RC.y), G3);
      if (f > 0) { const a = -Math.PI / 2 + TAU * f; blob(c, RC.x + R * Math.cos(a), RC.y + R * Math.sin(a), 17 * U * (1 - out)); }
      c.restore();
      return;
    }
  }
  // o logo trava na batida 48
  const lx = mix(RC.x, LG.x, L48), ly = mix(RC.y, LG.y, L48), lr = mix(RC.r * 0.92, LG.r, L48);
  const shock = prog(x, 48, 48.8);
  if (shock > 0 && shock < 1) { c.strokeStyle = G3; c.lineWidth = 4 * U * Math.pow(1 - shock, 2); c.beginPath(); c.arc(LG.x, LG.y, LG.r * mix(1.05, 2.3, oExpo(shock)), 0, TAU); c.stroke(); }
  drawLogo(c, {
    x: lx, y: ly, r: lr, r0: lr, ring: L48, pinM: L48,
    stem: oBack(prog(x, 48.0, 48.3), 1.6), chev: oBack(prog(x, 48.04, 48.34), 1.6),
    shine: prog(x, 50.5, 50.92), pinDy: 0.05 * LG.r * bump(prog(x, 51.0, 51.18)),
  });
  // wordmark + tagline
  wordmark(c, x, 48.5, 52.0);
}
function wordmark(c, x, a, outAt) {
  const S = wmL(), bh = bandH(S.L);
  c.fillStyle = PAPER;
  maskLine(c, S.L, S.x0, S.base, (k, i) => {
    const u = oExpo(prog(x, a + 0.03 * i, a + 0.45 + 0.03 * i)), o = iCubic(prog(x, outAt + 0.02 * i, outAt + 0.3 + 0.02 * i));
    if (u <= 0 || o >= 1) return false;
    return { dy: (1 - u) * bh + o * bh };
  });
  const tl = S.tL, n = Math.floor(prog(x, 49.5, 50.7) * tl.text.length + 1e-9), o = iCubic(prog(x, outAt + 0.05, outAt + 0.35));
  if (n > 0 && o < 1) {
    c.save(); c.beginPath(); c.rect(0, S.tbase - tl.asc, W, bandH(tl)); c.clip();
    c.fillStyle = G5; glyphs(c, tl, S.tx0, S.tbase + o * bandH(tl), (i) => (i < n ? null : false));
    c.restore();
  }
  const caret = x >= 49.4 && x < 51.6 && (x < 50.7 || (x * 2) % 1 < 0.55);
  if (caret) { const cxp = n > 0 ? S.tx0 + tl.xs[n - 1] + tl.ws[n - 1] + 6 * U : S.tx0; c.fillStyle = VIO; c.fillRect(cxp, S.tbase - tl.cap * 1.12, 3.5 * U, tl.cap * 1.38); }
}

/* ================================================================ S12 · convite + volta ao ponto (52–60) */
let _s12;
function s12L() {
  if (_s12) return _s12;
  const lines = P ? ["Vamos dar", "movimento", "à sua ideia"] : ["Vamos dar movimento", "à sua ideia"];
  const fs = (P ? 150 : 124) * U, lh = fs * 1.1, Ls = lines.map((t) => lay(t, FD(fs)));
  const rd = fs * 0.075, gap = fs * 0.045, n = Ls.length;
  const b0 = P ? cy - 80 * U : cy + 60 * U, bases = Ls.map((_, i) => b0 + i * lh);
  const xs = Ls.map((L, i) => cx - (L.w + (i === n - 1 ? gap + 2 * rd : 0)) / 2);
  const starts = []; let k = 0;
  Ls.forEach((L) => { for (let j = 0; j < nWords(L.text); j++) starts.push(53 + 0.25 * k++); });
  const last = Ls[n - 1], tx = xs[n - 1] + last.w + gap + rd, ty = bases[n - 1] - rd;
  const iw = wordSpan(last, xs[n - 1], nWords(last.text) - 1);
  const wl = lay("Boas-vindas à Kronografx.", FI((P ? 50 : 44) * U, 600));
  return (_s12 = { fs, lh, Ls, rd, xs, bases, starts, tx, ty, iw, wl, wy: P ? cy - 300 * U : cy - 140 * U, ly: P ? cy - 470 * U : cy - 270 * U, lr: (P ? 70 : 56) * U, nw: k });
}
const S12DROP = 54.5;
function suck(x, k) { return iExpo(prog(x, 56.0 + 0.16 * k, 56.6 + 0.16 * k)); }
function s12(c, x) {
  bg(c, INK);
  const S = s12L(), D = [S.tx, S.ty];
  const mv = ioExpo(prog(x, 52.0, 52.6));
  // logo encolhe e sobe
  const lo = suck(x, 1);
  if (lo < 1) {
    const lx = mix(LG.x, cx, mv), ly = mix(LG.y, S.ly, mv), lr = mix(LG.r, S.lr, mv);
    drawLogo(c, { x: mix(lx, D[0], lo), y: mix(ly, D[1], lo), r: lr * (1 - lo), ring: 1, stem: 1, chev: 1, shine: 0 });
  }
  if (x < 52.7) wordmark(c, x, 48.5, 52.0);
  // "Boas-vindas à Kronografx."
  const wo = suck(x, 2), wl = S.wl;
  c.fillStyle = PAPER;
  if (wo > 0 && wo < 1) glyphs(c, wl, cx - wl.w / 2, S.wy, (i) => { const gx = gcx(wl, cx - wl.w / 2, i); return { dx: (D[0] - gx) * wo, dy: (D[1] - S.wy) * wo, sx: 1 - wo, sy: 1 - wo }; });
  else if (wo <= 0) maskLine(c, wl, cx - wl.w / 2, S.wy, (k) => { const u = oExpo(prog(x, 52.45 + 0.1 * k, 52.95 + 0.1 * k)); return u <= 0 ? false : { dy: (1 - u) * bandH(wl) }; });
  // "Vamos dar movimento à sua ideia."
  let g0 = 0;
  S.Ls.forEach((L, li) => {
    const gs = g0, base = S.bases[li], bh = bandH(L);
    const fn = (k, i) => {
      const g = gs + k, st = S.starts[g], u = oExpo(prog(x, st, st + 0.55)), so = suck(x, 3 + (S.nw - 1 - g));
      if (u <= 0 || so >= 1) return false;
      if (so > 0) { const gx = gcx(L, S.xs[li], i); return { dx: (D[0] - gx) * so, dy: (D[1] - base) * so, sx: 1 - so, sy: 1 - so }; }
      return { dy: (1 - u) * bh };
    };
    if (suck(x, 3) > 0) glyphs(c, L, S.xs[li], base, (i) => { const wm = wordMap(L.text); return wm[i] < 0 ? false : fn(wm[i], i); });
    else maskLine(c, L, S.xs[li], base, fn);
    g0 += nWords(L.text);
  });
  // traço em "ideia"
  underline(c, S.iw[0], S.iw[1], S.bases[S.bases.length - 1] + S.fs * 0.16, S.fs, oExpo(prog(x, 56.0, 56.3)), oExpo(prog(x, 55.0, 55.45)));
  // o ponto: cai, quica, engole tudo e volta ao centro, do tamanho do quadro 0
  if (x < 58.0) bouncingDot(c, x, S12DROP, S.tx, S.ty, S.rd * (1 + 0.25 * bump(prog(x, 57.6, 58.0))), S.ty + 0.15 * H, 0.22 * S.fs);
  else {
    const pos = (xx) => { const v = ioExpo(prog(xx, 58.0, 59.0)); return [mix(S.tx, cx, v), mix(S.ty, cy, v) - Math.sin(Math.PI * v) * 0.12 * H]; };
    const [px, py] = pos(x), st = stretchOf(pos, x, 1 / 6000, 0.8);
    const r = mix(S.rd, R0, ioCubic(prog(x, 58.0, 59.0))) * (1 - 0.22 * bump(prog(x, 59.2, 60)));
    blob(c, px, py, r, st.s, 1 / Math.sqrt(st.s), st.ang);
  }
}

/* ================================================================ montagem */
function paint(c, x) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; c.shadowColor = "transparent"; c.shadowBlur = 0;
  bg(c, INK);
  const [dx, dy] = shake(x);
  c.translate(dx, dy);
  if (x < 4) s1(c, x);
  else if (x < 8) s2(c, x);
  else if (x < 16) s3(c, x);
  else if (x < 20) s4(c, x);
  else if (x < 24) s5(c, x);
  else if (x < 28) s6(c, x);
  else if (x < 32) s7(c, x);
  else if (x < 32.45) {                // empurra a tipografia para cima; o ponto vira o card
    const e = ioExpo(prog(x, 32, 32.45));
    c.save(); c.translate(0, -H * e); s7(c, x, true); c.restore();
    c.fillStyle = PAPER; c.fillRect(-PADB, H * (1 - e), W + 2 * PADB, H + PADB);
    s8(c, x, true);
  }
  else if (x < 35.75) s8(c, x);
  else if (x < 40) s9(c, x);
  else if (x < 44) s10(c, x);
  else if (x < 52) s11(c, x);
  else s12(c, x);
}

/* ================================================================ motion blur + API */
let acc = null, last = null;
function seek(t) {
  if (MB === 1) { paint(ctx, X(t)); last = null; return; }
  if (!acc) acc = new Uint16Array(W * H * 4);
  acc.fill(0);
  for (let k = 0; k < MB; k++) {
    paint(sctx, X(t + (k / MB) * SHUT / FPS));
    const d = sctx.getImageData(0, 0, W, H).data;
    for (let i = 0; i < d.length; i++) acc[i] += d[i];
  }
  const img = ctx.createImageData(W, H), o = img.data, half = MB >> 1;
  for (let i = 0; i < o.length; i++) o[i] = (acc[i] + half) / MB;
  ctx.putImageData(img, 0, 0);
  last = o;
}
window.seek = seek;
window.FILM = { W, H, FPS, DUR, MB, frames: FPS * DUR, T, X };
/* render: pinta o quadro f e envia os pixels RGBA crus ao render.mjs */
window.grab = async (f, t) => {
  seek(t === undefined ? f / FPS : t);
  const px = last || ctx.getImageData(0, 0, W, H).data;
  const r = await fetch(`/frame?i=${f}`, { method: "POST", body: px });
  if (!r.ok) throw new Error("frame " + f + " " + r.status);
  return f;
};

/* ================================================================ eventos sonoros (sfx.py lê isto) */
function buildCues() {
  const C = [], add = (x, k, v = 0.5, o = {}) => C.push({ x: +x.toFixed(4), k, v, ...o });
  const pan = (px) => +(cl((px - cx) / (W / 2), -1, 1) * 0.55).toFixed(3);
  // S1
  const s1 = s1L();
  add(0, "pop", 0.9, { f: 1 }); add(0, "ping", 0.3);
  add(0.25, "stretch", 0.3, { d: 0.25 });
  add(0.5, "zip", 0.7, { d: Z1 - 0.5, p: -0.45 }); add(Z1, "zip", 0.6, { d: Z2 - Z1, p: 0.35, f: 1.25 });
  s1.pass.forEach((x, i) => add(x, "pop", 0.5, { f: 1.25 + 0.18 * i, p: pan(gcx(s1.L, s1.x0, i)) }));
  add(Z2, "tock", 0.6, { p: pan(s1.endX) });
  for (let i = 0; i < 4; i++) add(WAVE + 0.075 * i, "blip", 0.22, { f: 1 + 0.12 * i, p: pan(i < 3 ? gcx(s1.L, s1.x0, i) : s1.endX) });
  add(3.45, "whoosh", 0.55, { d: 0.55, f: 1.2 });
  // S2
  const s2 = s2L();
  s2.starts.forEach((x) => add(x, "thup", 0.32));
  dropContacts(S2DROP).forEach(([x, l]) => add(x, "pop", 0.55 * l, { f: 0.8, p: pan(s2.tx) }));
  add(6.0, "scribble", 0.5, { d: 0.45 });
  add(7.0, "whoosh", 0.35, { d: 0.4, f: 0.7 }); add(7.25, "bloop", 0.5); add(7.55, "whoosh", 0.5, { d: 0.45, f: 0.6 });
  // S3
  for (let j = 0; j < 60; j += 2) add(8 + 0.75 * invert(ioCubic, j / 60), "ratchet", j % 10 === 0 ? 0.3 : 0.16, { p: pan(RC.x + RC.r * Math.cos((j / 60) * TAU - Math.PI / 2)) });
  add(8.3, "clack", 0.4);
  for (let k = 0; k < 3; k++) add(8.2 + 0.12 * k, "thup", 0.22);
  PAIN_AT.forEach((x) => add(x, "flick", 0.55));
  add(14.5, "glitch", 0.8, { d: 0.5 }); add(15.0, "fall", 0.5, { d: 1.0 });
  // S4
  add(16.0, "blip", 0.3, { f: 0.8 });
  add(17, "bonk", 0.45, { p: pan(s4L().tr1) }); add(18, "bonk", 0.45, { p: pan(s4L().tr0) });
  add(18.0, "pop", 0.4, { f: 1.5 }); add(18.06, "pop", 0.4, { f: 1.7 });
  add(18.15, "stretch", 0.4, { d: 0.85 }); add(18.5, "flip", 0.45); add(18.88, "thup", 0.3); add(19.0, "swish", 0.35, { d: 0.5 });
  // S5
  let g = 0; s5L().a.Ls.forEach((L) => { for (const ch of L.text) if (ch !== " ") add(20 + 0.028 * g++ + 0.17, "thud", 0.3); });
  add(21.0, "whoosh", 0.55, { d: 0.5, f: 0.8 }); add(22.0, "whoosh", 0.5, { d: 0.42, p: 0.5, f: 1.1 });
  add(22.5, "clack", 0.7); add(22.78, "tock", 0.35);
  add(23.0, "thup", 0.3); add(23.18, "pop", 0.45, { f: 1.4 }); add(23.3, "tic", 0.25); add(23.48, "tic", 0.25); add(23.6, "blip", 0.25, { f: 1.6 }); add(23.42, "pop", 0.35, { f: 1.1 });
  add(23.74, "whoosh", 0.5, { d: 0.3, f: 1.1 });
  // S6
  for (let i = 0; i < 4; i++) { add(24 + i, "morph", 0.6, { d: 0.55, p: pan((KF[i][0] + KF[i + 1][0]) / 2) }); add(24.55 + i, "tock", 0.3, { p: pan(KF[i + 1][0]) }); }
  add(27.6, "whoosh", 0.7, { d: 0.4, f: 1.3 });
  // S7
  for (let i = 0; i < 6; i++) add(28 + 0.04 * i, "tic", 0.3, { f: 1 + 0.08 * i });
  add(29, "boing", 0.6);
  for (let j = 0; j < 9; j++) add(30 + 0.025 * j, "swipe", 0.2, { p: j % 2 ? 0.4 : -0.4 });
  add(30.55, "glitch", 0.4, { d: 0.2 });
  HOPS.forEach((x, i) => add(x, "pop", 0.55, { f: 1 + 0.15 * i, p: pan(s7L().p.tops[i][0]) }));
  add(32.0, "whoosh", 0.6, { d: 0.45, f: 0.9 });
  // S8
  add(32.22, "pop", 0.5, { f: 0.7 }); add(32.55, "type", 0.3); add(32.62, "type", 0.3);
  add(33.0, "toggle", 0.6); add(34.0, "click", 0.8); add(34.1, "spin", 0.15, { d: 0.9 }); add(35.0, "chime", 0.7); add(35.5, "whoosh", 0.5, { d: 0.3, f: 1.4 });
  // S9
  for (let o = 1; o <= 6; o++) add(35.9 + 0.03 * o, "pop", 0.2, { f: 1 + 0.06 * o });
  [36.5, 37, 37.5, 38].forEach((x) => add(x, "rotate", 0.55, { d: 0.36 }));
  add(38.5, "whoosh", 0.6, { d: 1.0, f: 0.8 });
  for (let i = 0; i < NC; i++) add(39.55 + 0.035 * i, "thup", 0.22);
  // S10
  SNAP.forEach((x) => add(x, "snap", 0.55)); add(40.6, "pop", 0.4, { f: 0.9 });
  for (let k = 0; k < 10; k++) { const kx = KFX(k); add(PH0 + (PH1 - PH0) * ((kx - tlL().lx0) / tlL().len), "blip", 0.28, { f: 1 + 0.07 * k, p: pan(kx) }); }
  add(43.0, "fall", 0.45, { d: 0.6 }); add(43.3, "swirl", 0.55, { d: 0.65 });
  // S11
  for (let j = 5; j <= 60; j += 5) add(44.15 + 3.35 * invert(ioCubic, j / 60), "tick", 0.3, { f: 1 + j / 60, p: pan(RC.x + RC.r * Math.cos((j / 60) * TAU - Math.PI / 2)) });
  for (let k = 0; k < 3; k++) add(44.1 + 0.14 * k, "thup", 0.22);
  GAIN_AT.forEach((x, i) => add(x, "flick", 0.4 + 0.1 * i, { f: 1.2 }));
  add(47.72, "suck", 0.6, { d: 0.26 }); add(48.0, "lock", 1.0); add(48.5, "whoosh", 0.35, { d: 0.5 });
  const tl = wmL().tL.text; for (let i = 0; i < tl.length; i++) if (tl[i] !== " ") add(49.5 + 1.2 * (i / tl.length), "type", 0.26, { f: 0.9 + 0.2 * rnd(61, i) });
  add(50.5, "shimmer", 0.45, { d: 0.42 }); add(51.0, "click", 0.55);
  // S12
  add(52.0, "whoosh", 0.45, { d: 0.6, f: 0.8 });
  for (let k = 0; k < 4; k++) add(52.45 + 0.1 * k, "thup", 0.2);
  const s12 = s12L(); s12.starts.forEach((x) => add(x, "thup", 0.36));
  dropContacts(S12DROP).forEach(([x, l]) => add(x, "pop", 0.55 * l, { f: 0.85, p: pan(s12.tx) }));
  add(55.0, "scribble", 0.5, { d: 0.45 });
  add(56.0, "suck", 0.45, { d: 1.6 });
  for (let k = 1; k < 3 + s12.nw; k++) add(56.6 + 0.16 * k, "pop", 0.22, { f: 1.4 + 0.05 * k });
  add(58.0, "whoosh", 0.4, { d: 1.0, f: 0.9 });
  return C.sort((a, b) => a.x - b.x);
}

/* ================================================================ início: espera as fontes */
Promise.all([document.fonts.load(FD(100)), document.fonts.load(FI(100, 500)), document.fonts.load(FI(100, 600))]).then(() => {
  if (!document.fonts.check(FD(100)) || !document.fonts.check(FI(100, 500))) throw new Error("fontes não carregaram");
  window.CUES = buildCues();
  seek(0);
  window.__ready = true;
});
})();
