# Memória do projeto — Site Kronografx

> Este arquivo é a "memória" do Claude sobre o site oficial do Rafael.
> Ele é lido automaticamente em toda sessão neste repositório.
> **Sempre que o site mudar, atualize este arquivo também.**

## Quem e o quê

- **Dono:** Rafael (rafa.saopaulino1998@gmail.com). Fala português (pt-BR); responda em português.
- **Marca:** **Kronografx**, estúdio de **motion design, VFX e pós-produção**.
  Nome vem de *khrónos* (χρόνος), "tempo" em grego.
- **CNPJ:** 69.317.795/0001-62 (dígitos verificadores conferidos). Aparece no rodapé, na linha do copyright
  ("© 2026 Kronografx · CNPJ …", com `.footer__cnpj { white-space: nowrap }` para o número não quebrar),
  e como `taxID` no JSON-LD do `index.html`.
- **Domínio:** https://kronografx.com/
- **Slogan:** "Cada frame pensado pra prender o olhar."
- **Atendimento:** 100% online, para todo o Brasil.
- **Contatos (ficam em `kronografx/assets/js/dados.js`):**
  - WhatsApp: `5516991220381` (link `wa.me` com texto pronto: "Olá, Kronografx! Vi o site e quero conversar sobre um projeto.")
  - E-mail: `contato@kronografx.com`
  - Instagram: `@kronografx`
- **Máquina do estúdio (aparece no site):** Ryzen 7 5700X (8n/16t), Radeon RX 7600, 32 GB DDR4 3200 MHz, water cooler.
- **Ferramenta principal:** After Effects.

## Onde está o código

O site completo está em `kronografx/` (veio do `Site_Oficial.rar` enviado em 2026-10-16, versão "v5",
com as correções de 2026-10-16 aplicadas — ver Histórico).
É um site **estático, sem build, sem frameworks**: HTML + CSS + JS puro (ES5, IIFE).
Basta abrir `kronografx/index.html` ou subir a pasta inteira para qualquer hospedagem.

```
kronografx/
├── index.html            # todas as páginas (SPA com rotas por hash) + JSON-LD da organização
├── robots.txt            # libera tudo e aponta o sitemap
├── sitemap.xml           # só a home (as rotas são por #)
└── assets/
    ├── css/style.css     # todo o visual
    ├── js/dados.js       # ← CONTEÚDO EDITÁVEL: projetos, carrossel, FAQ, contatos
    ├── js/app.js         # lógica: rotas, carrossel, páginas de projeto, animações
    ├── fonts/            # calsans.woff2, calsans-ext.woff2 (títulos), inter.woff2 (texto)
    ├── img/              # capas, stills, frames/ (carrossel), marca, favicon, og-image
    └── video/            # vídeos completos + e2-loop.mp4 + reel.mp4
```

Referências visuais da análise (capturas e pranchas de quadros) ficam em `docs/kronografx/` — **fora** da pasta
do site, não sobem para a hospedagem. As capturas são de **antes** das correções de 2026-10-16.

## Arquitetura

- **SPA por hash.** Rotas: `#/` (home), `#/projetos`, `#/projeto/<id>`, `#/faq`, `#/contato`.
  Cada página é uma `<section class="page" data-page="...">`; `route()` em `app.js` mostra/esconde
  com `hidden`, troca o `document.title` e marca o link ativo (`data-nav`). Hash desconhecido → home.
- **Conteúdo vem de `window.KRONO`** (definido em `dados.js`, carregado antes de `app.js`).
- **Links de WhatsApp:** qualquer elemento com atributo `data-wa` recebe o link `wa.me` automaticamente.
- **Ano do rodapé:** `#year` é preenchido via JS.
- `esc()` escapa todo texto vindo de `dados.js` antes de ir para o HTML.

### Seções da home (em ordem)
1. **Nav em pílula** fixa (`.pill-nav`), fica escura (`.on-dark`) sobre `#arsenal`, `#confianca` e o hero de projeto. No celular (≤860px) vira menu hambúrguer.
2. **Hero** — anúncio "NOVO" (link pro projeto mais recente; no celular quebra em 2 linhas), status "Agenda aberta para novos projetos", título com gradiente, 2 botões.
3. **Reel** — carrossel inclinado (-3°) com frames 9:16, rolagem infinita (lista duplicada), pausa no hover; cada card leva ao projeto.
4. **Sobre** — "Kronografx, o estúdio do Rafael."
5. **Arsenal** — seção *sticky* de 330vh com 3 telas que trocam conforme o scroll:
   01 After Effects (janela fake de AE com timecode e agulha sincronizados ao `e2-loop.mp4`),
   02 Máquina dedicada (ficha + barra de render animada),
   03 Todas as telas (16:9 e 1:1 com `reel.mp4`, 9:16 com `e2-loop.mp4`). Em celular deitado vira lista normal.
6. **Processo** — 4 cards: Roteiro, Direção de arte, Animação e VFX, Finalização.
7. **Confiança** (fundo escuro) — Proposta por escrito, Estação dedicada, Fala direto com quem faz, Formato certo.
8. **Showcase** — até 4 primeiros projetos (`P.slice(0, 4)`) em grade de 2 colunas.
   **Se o número for ímpar, o 1º card ocupa a linha inteira** (formato 21:9) — regra CSS
   `.pgrid:not(.pgrid--all) > .pcard:first-child:nth-last-child(odd)`.
9. **CTA final** — "Bora tirar sua ideia do papel?"

### Outras páginas
- **Projetos:** grade de 3 colunas com todos + filtros gerados automaticamente a partir do campo `formato`.
- **Projeto:** hero com gradiente `cor`→`cor2`, chips (Cliente/Ano/Formato/Duração), "Como esse projeto nasceu" (`historia`), `nota`, player (botão play ativa som/controles), specbar, faixa de frames arrastável, CTA e "Próximo projeto" (circular; no celular empilha).
  `vertical: true` deixa o player em 9:16. `audio: false` esconde o aviso "🎧 Assista com som" e o botão vira "Assistir ao vídeo".
- **FAQ:** `<details>` gerados de `faq` (o primeiro vem aberto).
- **Contato:** card WhatsApp + card e-mail/Instagram.

### Comportamentos
- Elementos `.rv` aparecem com fade ao entrar na tela (IntersectionObserver).
- `video[data-loop]` só carregam/tocam quando visíveis.
- Respeita `prefers-reduced-motion`.
- Breakpoints: 960px, 860px, 600px e celular deitado (`landscape` + `max-height: 520px`).

## Design

- **Fontes:** Cal Sans (títulos, `--display`) e Inter variável (texto, `--sans`), auto-hospedadas.
- **Cores (`:root` em style.css):** fundo branco `#fff`, tinta `#0a0a0b`, cinza `#f5f5f7`,
  roxo `--v1 #7c3aed`, `--v2 #b44bff`, azul `--v3 #3b82f6`,
  gradiente `--grad`: azul `#3b82f6` → roxo `#7c3aed` → rosa `#d946ef`.
- Estilo: clean/Apple-like, cantos bem arredondados (`--r: 20px`, botões em pílula), sombras suaves, easing `cubic-bezier(.22,1,.36,1)`.
- Cada projeto tem cores próprias (`cor`, `cor2`) usadas nos cards, no hero e no CTA da página do projeto.
  **Texto é sempre branco sobre esse gradiente → `cor2` precisa ser escura o bastante** (por isso a do Starbucks virou `#1e3932`).
- **Marca:** PNG transparente, letra **K** prateada com haste em gradiente roxo, dentro de um arco de cronômetro
  (anel com "pino" no topo). Arquivos: `mark.png` 512², `mark-lg.png` 1024², `apple-touch-icon.png` 180², `favicon-32.png`.
  No site aparece sobre círculo `#141414`.
- **og-image.jpg** (1200×630): fundo branco, logo + "Kronografx", "Cada frame pensado **pra prender o olhar.**".

## Projetos atuais (em `dados.js`)

| id | Título | Cliente | Formato | Duração | Cores (`cor` / `cor2`) | Observação |
|---|---|---|---|---|---|---|
| `e2-3-sinais` | 3 Sinais | E2 Finanças | Reels 9:16 | 0:36 | `#2a1f07` / `#b8892a` (preto e dourado) | Projeto real; chamada final para o "Método Viva". Destaque "NOVO" do hero e card largo da home. |
| `itau-um-unico-app` | Um único app | Itaú | Filme 16:9 | 0:13 | `#d9530a` / `#0b1f8f` | Conceitual, sem vínculo com o Itaú Unibanco. **Vídeo sem áudio** (`audio: false`). |
| `starbucks-seu-nome` | Seu nome no café | Starbucks | Reels 9:16 | 0:35 | `#00704a` / `#1e3932` (verdes Starbucks) | Conceitual, sem vínculo com a Starbucks. |

Todos de 2026, disciplina "Motion Design".

## Como adicionar um projeto novo (passo a passo)

1. Colocar os arquivos seguindo o padrão de nomes:
   - `assets/video/<slug>.mp4` (vídeo completo)
   - `assets/img/<slug>-capa.jpg` (poster do player — escolher um quadro **com texto/visual completo**, nunca de transição)
   - `assets/img/<slug>-still-1..6.jpg` (frames da página do projeto, em ordem narrativa)
   - `assets/img/frames/<slug>-1..6.jpg` (frames 9:16 do carrossel da home, **420×746**)
2. Adicionar um objeto em `projetos` no `dados.js` com os campos:
   `id, titulo, cliente, subtitulo, categoria, disciplina, ano, formato, duracao, cor, cor2, vertical, video, capa, fundo, specs[], historia[], frames[], nota`
   e, se o vídeo não tiver som, `audio: false`.
   A **ordem** do array define a ordem nos cards (os 4 primeiros vão para a home; com 1 ou 3, o 1º fica largo).
   `fundo` é a imagem apagada atrás do card — use uma de boa resolução se o projeto for o 1º (card largo).
3. Adicionar entradas `["assets/img/frames/<slug>-N.jpg", "<id>"]` em `carrossel` (intercalar os projetos).
4. Se for o lançamento mais recente, atualizar o anúncio "NOVO" no hero de `index.html` (texto e `href="#/projeto/<id>"`).
5. Projeto conceitual (marca sem vínculo) → preencher `nota` com o aviso "Projeto conceitual de portfólio, sem vínculo com ...".
6. Cuidado com vírgulas e aspas no `dados.js` — um erro quebra o site inteiro.
7. Atualizar o `lastmod` do `sitemap.xml`.

Dica: para escolher quadros, gerar uma prancha com `ffmpeg -i video.mp4 -vf "fps=2,scale=160:-1,drawtext=text='%{pts\:hms}':...,tile=12x6"`
e extrair o escolhido com `ffmpeg -ss <t> -i video.mp4 -frames:v 1 -q:v 2 saida.jpg`.

## Conteúdo dos vídeos (assistidos quadro a quadro em 2026-10-16)

Pranchas com os quadros de cada vídeo: `docs/kronografx/videos/`.

| Arquivo | Resolução | fps | Duração | Áudio | Peso |
|---|---|---|---|---|---|
| `e2.mp4` | 720×1280 | 30 | 36,0 s | sim (AAC 48 kHz) | 1,9 MB |
| `starbucks.mp4` | 720×1280 | 30 | 35,3 s | sim (AAC 44,1 kHz) | 1,3 MB |
| `itau.mp4` | 1920×1080 | 29,97 | 13,3 s (era 15,9 s) | **não tem faixa de áudio** | 0,74 MB |
| `reel.mp4` | 1280×720 | 30 | 16,0 s | não | 0,56 MB |
| `e2-loop.mp4` | 540×960 | 30 | 9,0 s | não | 0,17 MB |

- **E2 "3 Sinais"**: fundo preto com moedas douradas. Roteiro: "Você não tem um problema de ~~DINHEIRO~~"
  → fundo dourado "Você tem um problema de **SISTEMA.** E isso aparece em 3 sinais" →
  **01** "Você não sabe pra onde seu dinheiro vai" (card de extrato, saldo cai de R$ 5.000 para R$ 12,40, selo "PRA ONDE FOI?") →
  **02** "Toda emergência vira um problema" (reserva de emergência R$ 3.200 → R$ 0,00, "Imprevisto: conserto do carro") →
  **03** "Trabalha mais. Ganha mais. Nunca sobra mais." (gráfico de 12 meses: renda +100%, sobra = R$ 0) →
  logo E2 em fundo verde-escuro: "Isso tem nome. E tem saída: **MÉTODO VIVA** tira você do piloto automático" →
  CTA "Comenta **DIAGNÓSTICO**" com simulação de comentário sendo digitado e respondido pela E2.
  Tipografia: sans pesada + serifada itálica; paleta preto/dourado.
- **Starbucks "Seu nome no café"** (tempos aproximados): 0–3 s "Pedir um café" (cursores "Rafa", "Josi") →
  3–4,5 s fundo vermelho "⚠ Não é fácil!" → 5–8,5 s "+170 mil jeitos de pedir a mesma bebida" (contador, bolhas
  Gelado/Venti/Descaf/Tall/Duplo/Aveia; rodapé "Fonte: Starbucks") → espiral verde → "Mas…" →
  12–15 s "E se o seu café já soubesse o **seu nome**?" → 15,5–18 s copo com "Você" → "feito pra você." →
  "Aqui você escolhe" → pílulas Leite/Tamanho/Cobertura/Temperatura → "+Muito mais." → "Também tem um app" →
  celular "Pra iOS e Android" / "Pedido pronto!" → "Tá esperando o quê?" → 33–35 s "Seu nome já está no copo.
  @starbucksbrasil" com rodapé "Vídeo não oficial · peça conceito para portfólio · Kronografx".
- **Itaú "Um único app"**: "Inicie uma nova jornada com o [itaú]" + botão "Conheça o App" com cursor →
  tela do app (Meu Itaú, Pix, Pagar, Crédito, Cartão virtual) sobre fundo laranja, em perspectiva 3D →
  fundo azul-marinho "Todas as suas finanças" → "Em um único app." → cartela final com logo Itaú, QR code,
  Google Play e App Store (entra ~9–10 s; agora fica ~3 s parada até o fim).
- **reel.mp4** (usado só no Arsenal "Todas as telas"): montagem 16:9 — app Itaú → "Sistema" da E2 (vertical
  com laterais desfocadas) → "Todas as suas finanças / Em um único app" → sinais 01 e 03 da E2 → logo E2 →
  termina no **logo K da Kronografx**.
- **e2-loop.mp4**: abertura até o Sinal 01.

## Imagens

Pranchas: `docs/kronografx/imagens/` (de antes das correções no caso do Starbucks e do carrossel).

- **Capas** (poster do player): `e2-capa.jpg` 900×1600 ("SISTEMA." dourado; também é o `fundo` do card da E2),
  `itau-capa.jpg` 1600×900 (app sobre laranja), `starbucks-capa.jpg` 720×1280 ("E se o seu café já soubesse o seu nome?", 14,6 s).
- **reel-capa.jpg** (1280×720): quadro do app Itaú sobre laranja.
- **Stills** (página do projeto): e2 720×1280, itaú 1280×720, um por cena-chave.
  Starbucks (720×1280, extraídos do vídeo): 1 "Não é fácil!" (4,0 s), 2 "+170 mil" (7,5 s), 3 copo "Você" (17,3 s),
  4 pílulas (24,8 s), 5 celular "Pedido pronto" (29,9 s), 6 "Seu nome já está no copo" (34,7 s).
- **Carrossel** (`frames/`, 9:16, 420×746): e2-1,3,4,5,6,8; itau-1..6 (recortes verticais do vídeo 16:9);
  starbucks-1 "Não é fácil!", 2 "+170 mil" (também é o `fundo` do card), 3 "E se o seu café…", 4 copo "Você",
  5 pílulas, 6 "Seu nome já está no copo".

## Como o site aparece no navegador (testado em 2026-10-16)

Capturas em `docs/kronografx/capturas/` (computador 1440×900, celular 390×844, celular deitado 844×390).

- **Sem erros de JavaScript**, sem links/arquivos quebrados, **sem rolagem horizontal** em nenhuma largura testada.
- Títulos das abas corretos em todas as rotas (ex.: "3 Sinais · E2 Finanças · Kronografx").
- Menu hambúrguer no celular abre/fecha bem; nav fica escura sobre as seções escuras.
- Arsenal: as 3 telas trocam certinho com a rolagem (computador e celular); no celular deitado viram blocos normais.
- Para testar: servir a pasta (`python3 -m http.server --directory kronografx`) e usar Playwright
  (`/opt/node-tools/node_modules/playwright`). O Chromium de teste **não toca H.264** → vídeos aparecem só com o poster.
  Desligar `scroll-behavior: smooth` antes de capturar, senão o print sai no meio da rolagem.

## Pendências / decisões em aberto

- **Specs "1080×1920" da E2 e do Starbucks**: os arquivos no site são 720×1280 (provavelmente comprimidos para web).
  Mantido como está, assumindo que a entrega original foi 1080×1920 — **confirmar com o Rafael**.
- **SEO das páginas de projeto**: como as rotas são por `#`, Google e redes sociais só enxergam a home
  (mesmo título/og-image para todo link). Resolver exigiria gerar um HTML por projeto (ex.: `projeto/e2-3-sinais/index.html`)
  — mudança maior, não feita.
- `.pcard__bg video` no CSS sobrou de uma versão antiga (cards com vídeo); hoje os cards usam só imagem.

## Histórico

- **2026-10-16** — Site (versão "v5") enviado pelo Rafael como `Site_Oficial.rar` e salvo neste repositório
  em `kronografx/`, junto com este arquivo de memória. O Rafael mantém o site atualizado constantemente;
  quando ele mandar uma versão nova, substituir `kronografx/` e atualizar este arquivo.
- **2026-10-16** — Análise completa: todos os vídeos assistidos, todas as imagens vistas, site aberto no navegador
  em computador/celular/celular deitado. Referências salvas em `docs/kronografx/`.
- **2026-10-16** — Correções aplicadas a pedido do Rafael:
  1. Itaú: `audio: false` → some o "🎧 Assista com som" e o botão vira "Assistir ao vídeo" (o vídeo não tem áudio).
  2. Itaú: vídeo cortado de 15,9 s para 13,3 s (cartela final ficava 5,7 s parada; agora 3 s). Corte sem recodificar. Duração 0:16 → 0:13.
  3. Starbucks: nova capa do player, 6 stills e 6 frames do carrossel extraídos de cenas completas (antes eram quadros vazios/de transição).
  4. Starbucks: `cor2` `#f2f0eb` (creme) → `#1e3932` (verde-escuro) para o texto branco ter contraste; `fundo` do card trocado (sem a mancha).
  5. Carrossel: `frames/e2-7.jpg` (bege vazio) trocado por `frames/e2-5.jpg` (Sinal 02).
  6. Home: com número ímpar de projetos, o 1º card ocupa a linha toda (sem buraco); `fundo` da E2 → `e2-capa.jpg` (resolução maior).
  7. Cards de projeto com margem interna e subtítulo equilibrado com sombra (não encostam mais nas bordas).
  8. Celular: anúncio "NOVO" quebra em 2 linhas em vez de cortar com "…"; "Próximo projeto" empilha e a seta não quebra sozinha.
  9. Removidos arquivos sem uso: `video/itau-loop.mp4`, `video/starbucks-loop.mp4`, `img/itau-loop.jpg`, `img/starbucks-loop.jpg`,
     `img/frames/e2-2.jpg`, `img/frames/e2-7.jpg`, `img/frames/starbucks-7.jpg`, `img/frames/starbucks-8.jpg`; e o campo `loop` (não era usado).
  10. SEO: `robots.txt`, `sitemap.xml`, `<link rel="canonical">` e JSON-LD (`Organization`) no `index.html`.
- **2026-10-16** — CNPJ 69.317.795/0001-62 adicionado ao rodapé e ao JSON-LD (`taxID`), a pedido do Rafael.
  Testado em 1440, 390 e 320 px: sem erros, sem rolagem lateral; em 320 px o CNPJ desce inteiro para a 2ª linha.
