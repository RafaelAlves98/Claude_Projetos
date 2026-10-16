# Motion studio rules

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode,
  no state carried between frames. Seeded noise only (mulberry32), never Math.random.
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.

## Look
- Banned defaults: centered title on gradient, everything fading in,
  corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen.

## Sound
- Score and SFX are synthesized in code unless a track is supplied.
- Place hits on the measured beat grid (beats.json). Loudness -14 LUFS.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet and LOOK at it.
2. Score it 1-10 on: hook in first 2s, readability at phone size,
   motion quality, variety, brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render.

---

## Ambiente deste projeto (notas do Claude, montado em 2026-10-16)

- Dono: Rafael (Kronografx, estúdio de motion design/VFX). Responder em português.
- **Node 22 + ffmpeg 6.1 + Python 3.13** já existem na sessão na nuvem.
- **Python de áudio**: ambiente próprio em `motion-studio/.venv` (com os pacotes do sistema), com `numpy`, `librosa`
  e `soundfile`. Use `.venv/bin/python` (ex.: para gerar `beats.json` com `librosa.beat.beat_track`).
  A `.venv/` não vai para o git; para recriar: `python3 -m venv --system-site-packages .venv && .venv/bin/pip install librosa soundfile`.
- **Playwright fixado em 1.56.1** (`package.json`) porque é a versão do Chromium que já vem instalado na nuvem
  (`/opt/pw-browsers`). **Não rodar `npx playwright install`** aqui. Se um dia mudar a versão, lançar com
  `executablePath` apontando para `/opt/pw-browsers/chromium-*/chrome-linux/chrome`.
- **Skills e plugin** (código de terceiros, revisado antes de instalar — só chamam ffmpeg/ffprobe/node/npx/uvx,
  sem hooks; as cópias instaladas são idênticas ao código revisado):
  - **Remotion** (`remotion-dev/skills`, 12 skills: `remotion-best-practices` é o roteador, `remotion-create`,
    `remotion-render`, `remotion-studio`, `remotion-captions`…) e **HyperFrames** (`heygen-com/hyperframes`, 21 skills:
    `hyperframes` é a porta de entrada obrigatória, `hyperframes-animation` com GSAP, `hyperframes-core`, `motion-graphics`…)
    → copiadas em `motion-studio/.claude/skills/` (versionadas no git; `skills-lock.json` guarda origem e hash).
    Instaladas com `DO_NOT_TRACK=1 npx skills@1.7.2 add <repo> -a claude-code -s '*' -y --copy`; para atualizar: `npx skills update -p`.
  - **claude-animation** (desenho à mão em canvas + som sintetizado) → plugin no **escopo do projeto**:
    `.claude/settings.json` declara o marketplace `buildwithhanif/claude-animation-skill` e ativa
    `claude-animation@claude-animation-skill`. Em máquina/contêiner novo, o Claude Code baixa o plugin ao abrir o projeto;
    depois rodar **uma vez**: `cd ~/.claude/plugins/marketplaces/claude-animation-skill/plugins/claude-animation/skills/claude-animation && npm install`
    (dependência `@napi-rs/canvas`).
  - Skills e plugin valem quando o Claude Code roda com `motion-studio/` como pasta do projeto (`cd motion-studio && claude`).
- **Testado em 2026-10-16**: canvas → ffmpeg H.264 yuv420p CRF 16 (30 quadros 540×960) ok; `librosa.beat.beat_track`
  numa faixa sintética de 120 BPM mediu 120,2 BPM ok.
- A rede da sessão na nuvem libera npm, PyPI e `git clone` do GitHub, mas bloqueia sites em geral
  (inclusive github.com no navegador e a API do GitHub).
