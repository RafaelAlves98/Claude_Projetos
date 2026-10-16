// Kronografx · hero — renderizador.
//   node render.mjs                      render completo (16:9 e 9:16, 60 fps, motion blur, com áudio se existir)
//   node render.mjs --fmt 9x16           só um formato
//   node render.mjs --sheet              prancha: um quadro por batida (rápido, 1/4 da resolução)
//   node render.mjs --stills 2.5,20.4    quadros soltos em resolução cheia (posição em batidas)
//   node render.mjs --strip 19.5:20.5:0.1  tira de quadros (de:até:passo, em batidas) para ver o movimento
//   node render.mjs --cues               só exporta os eventos sonoros (out/cues-<fmt>.json)
// Opções: --mb 6 (subquadros de motion blur) --jobs 2 (abas em paralelo) --frames 0-599 --crf 16
// O filme é uma função pura do tempo (window.seek). Os pixels RGBA saem do canvas por POST e vão crus para o ffmpeg.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "out");
fs.mkdirSync(OUT, { recursive: true });
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1] === undefined || argv[i + 1].startsWith("--") ? true : argv[i + 1]; };
const FORMATS = { "16x9": [1920, 1080], "9x16": [1080, 1920] };
const fmts = opt("fmt", "all") === "all" ? Object.keys(FORMATS) : [opt("fmt")];
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf";
const FPS = 60, DUR = 30, NF = FPS * DUR;
const beats = JSON.parse(fs.readFileSync(path.join(ROOT, "audio", "beats.json"), "utf8"));
const T = (x) => beats.offset_s + x * beats.periodo_s;

/* ---------------------------------------------------------------- servidor local */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".woff2": "font/woff2", ".json": "application/json" };
let sink = async () => {};
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (req.method === "POST" && u.pathname === "/frame") {
    const parts = [];
    req.on("data", (d) => parts.push(d));
    req.on("end", () => {
      Promise.resolve(sink(+u.searchParams.get("i"), Buffer.concat(parts)))
        .then(() => res.end("ok"), (e) => { res.statusCode = 500; res.end(String(e)); });
    });
    return;
  }
  const f = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
  if (!f.startsWith(ROOT + path.sep)) { res.statusCode = 403; return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.statusCode = 404; return res.end(); }
    res.setHeader("Content-Type", MIME[path.extname(f)] || "application/octet-stream");
    res.end(data);
  });
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const PORT = server.address().port;

/* ---------------------------------------------------------------- ffmpeg */
function ffmpeg(args) {
  const p = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((ok, ko) => p.on("close", (c) => (c === 0 ? ok() : ko(new Error("ffmpeg saiu com " + c)))));
  return { p, done, async write(buf) { if (!p.stdin.write(buf)) await once(p.stdin, "drain"); }, async end() { p.stdin.end(); await done; } };
}
const raw = (w, h, fps) => ["-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${w}x${h}`, "-framerate", String(fps), "-i", "-"];

/* ---------------------------------------------------------------- navegador */
const browser = await chromium.launch({ args: ["--disable-gpu", "--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"] });
async function openPage(w, h, mb) {
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("ERRO NA PÁGINA:", e.message); process.exitCode = 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(`http://127.0.0.1:${PORT}/film.html?w=${w}&h=${h}&mb=${mb}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  return page;
}

/* renderiza uma lista de tempos (s) e entrega os quadros EM ORDEM para write(buf) */
async function renderList(w, h, mb, jobs, times, write, label) {
  const pages = await Promise.all(Array.from({ length: jobs }, () => openPage(w, h, mb)));
  const pending = new Map(); let next = 0; const waiters = [];
  const wake = () => { for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].i - next < 2 * jobs) { waiters[i].ok(); waiters.splice(i, 1); } };
  sink = async (i, buf) => {
    if (buf.length !== w * h * 4) throw new Error(`quadro ${i}: ${buf.length} bytes`);
    if (i - next >= 2 * jobs) await new Promise((ok) => waiters.push({ i, ok }));
    pending.set(i, buf);
    while (pending.has(next)) { const b = pending.get(next); pending.delete(next); next++; await write(b); wake(); }
  };
  const t0 = Date.now();
  await Promise.all(pages.map(async (page, j) => {
    for (let k = j; k < times.length; k += jobs) {
      await page.evaluate(([f, t]) => window.grab(f, t), [k, times[k]]);
      if (k % 120 === 0 && k) { const s = (Date.now() - t0) / 1000; console.log(`  ${label} ${k}/${times.length} · ${(k / s).toFixed(1)} q/s · faltam ~${Math.round((times.length - k) / (k / s))} s`); }
    }
  }));
  await Promise.all(pages.map((p) => p.close()));
  return (Date.now() - t0) / 1000;
}

async function dumpCues(fmt) {
  const [w, h] = FORMATS[fmt];
  const page = await openPage(w, h, 1);
  const cues = await page.evaluate(() => window.CUES);
  await page.close();
  fs.writeFileSync(path.join(OUT, `cues-${fmt}.json`), JSON.stringify({ fmt, offset_s: beats.offset_s, periodo_s: beats.periodo_s, cues }, null, 0));
  console.log(`cues-${fmt}.json · ${cues.length} eventos`);
}

/* ---------------------------------------------------------------- modos */
for (const fmt of fmts) {
  const [W, H] = FORMATS[fmt];
  await dumpCues(fmt);
  if (opt("cues", false)) continue;

  if (opt("sheet", false)) {                       // um quadro por batida, rótulo = número da batida
    const at = +opt("at", 0.45), w = W / 4, h = H / 4, cols = fmt === "16x9" ? 10 : 12, rows = Math.ceil(60 / cols);
    const out = path.join(OUT, `sheet-${fmt}.jpg`);
    const ff = ffmpeg([...raw(w, h, 1), "-vf", `drawtext=fontfile=${FONT}:text='%{n}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6:boxborderw=3,tile=${cols}x${rows}:padding=4:color=0x555555`, "-frames:v", "1", "-q:v", "3", out]);
    const s = await renderList(w, h, +opt("mb", 1), 1, Array.from({ length: 60 }, (_, i) => T(i + at)), (b) => ff.write(b), "prancha");
    await ff.end(); console.log(`${out} · ${s.toFixed(1)} s`);
    continue;
  }
  if (opt("stills", false)) {                     // quadros soltos em resolução cheia
    const xs = String(opt("stills")).split(",").map(Number);
    const ff = ffmpeg([...raw(W, H, 1), "-f", "image2", path.join(OUT, `still-${fmt}-%02d.png`)]);
    await renderList(W, H, +opt("mb", 1), 1, xs.map(T), (b) => ff.write(b), "stills");
    await ff.end(); console.log(`stills ${fmt}: ${xs.map((x, i) => `${String(i + 1).padStart(2, "0")}=b${x}`).join(" ")}`);
    continue;
  }
  if (opt("strip", false)) {                      // tira de movimento: de:até:passo (batidas)
    const spec = String(opt("strip")), xs = [];
    if (spec.includes(",")) xs.push(...spec.split(",").map(Number));
    else { const [a0, b0, st] = spec.split(":").map(Number); for (let x = a0; x <= b0 + 1e-9; x += st) xs.push(+x.toFixed(4)); }
    const a = xs[0], b = xs[xs.length - 1];
    const sc = +opt("scale", 0.25), w = Math.round(W * sc), h = Math.round(H * sc), cols = Math.min(xs.length, +opt("cols", fmt === "16x9" ? 6 : 8)), rows = Math.ceil(xs.length / cols);
    const out = path.join(OUT, `strip-${fmt}-${a}-${b}.jpg`);
    const ff = ffmpeg([...raw(w, h, 1), "-vf", `drawtext=fontfile=${FONT}:text='%{n}':x=6:y=6:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=${cols}x${rows}:padding=4:color=0x555555`, "-frames:v", "1", "-q:v", "3", out]);
    await renderList(w, h, +opt("mb", 1), 1, xs.map(T), (b2) => ff.write(b2), "tira");
    await ff.end(); console.log(`${out} · ${xs.length} quadros · ${xs[0]}..${xs[xs.length - 1]}`);
    continue;
  }
  // render completo
  const [f0, f1] = String(opt("frames", `0-${NF - 1}`)).split("-").map(Number);
  const audio = path.join(OUT, `audio-${fmt}.wav`), hasAudio = fs.existsSync(audio) && f0 === 0 && f1 === NF - 1;
  const sc = +opt("scale", 1), RW = Math.round(W * sc / 2) * 2, RH = Math.round(H * sc / 2) * 2;
  const out = path.join(OUT, sc < 1 ? `preview-${fmt}.mp4` : f0 === 0 && f1 === NF - 1 ? `kronografx-hero-${fmt}.mp4` : `parcial-${fmt}-${f0}-${f1}.mp4`);
  const args = [...raw(RW, RH, FPS)];
  if (hasAudio) args.push("-i", audio);
  args.push("-map", "0:v");
  if (hasAudio) args.push("-map", "1:a");
  args.push("-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", String(opt("crf", 16)), "-tune", "animation", "-pix_fmt", "yuv420p",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-g", "120", "-movflags", "+faststart");
  if (hasAudio) args.push("-c:a", "aac", "-b:a", "256k", "-ar", "48000");
  args.push(out);
  const ff = ffmpeg(args);
  const times = Array.from({ length: f1 - f0 + 1 }, (_, k) => (f0 + k) / FPS);
  console.log(`${fmt}: ${times.length} quadros ${RW}x${RH} · mb=${opt("mb", 6)} · áudio ${hasAudio ? "sim" : "não"}`);
  const s = await renderList(RW, RH, +opt("mb", 6), +opt("jobs", 2), times, (b) => ff.write(b), fmt);
  await ff.end();
  console.log(`${out} · ${s.toFixed(0)} s`);
}
await browser.close();
server.close();
