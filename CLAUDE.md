# Memória do projeto — Site Kronografx

> Este arquivo é a "memória" do Claude sobre o site oficial do Rafael.
> Ele é lido automaticamente em toda sessão neste repositório.
> **Sempre que o site mudar, atualize este arquivo também.**

## Quem e o quê

- **Dono:** Rafael (rafa.saopaulino1998@gmail.com). Fala português (pt-BR); responda em português.
- **Marca:** **Kronografx**, estúdio de **motion design, VFX e pós-produção**.
  Nome vem de *khrónos* (χρόνος), "tempo" em grego.
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

O site completo está em `kronografx/` (cópia do `Site_Oficial.rar` enviado em 2026-10-16).
É um site **estático, sem build, sem frameworks**: HTML + CSS + JS puro (ES5, IIFE).
Basta abrir `kronografx/index.html` ou subir a pasta inteira para qualquer hospedagem.

```
kronografx/
├── index.html            # todas as páginas (SPA com rotas por hash)
└── assets/
    ├── css/style.css     # todo o visual (versão "v5")
    ├── js/dados.js       # ← CONTEÚDO EDITÁVEL: projetos, carrossel, FAQ, contatos
    ├── js/app.js         # lógica: rotas, carrossel, páginas de projeto, animações
    ├── fonts/            # calsans.woff2, calsans-ext.woff2 (títulos), inter.woff2 (texto)
    ├── img/              # capas, stills, frames/ (carrossel), marca, favicon, og-image
    └── video/            # vídeos completos + loops curtos
```

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
2. **Hero** — anúncio "NOVO" (link pro projeto mais recente), status "Agenda aberta para novos projetos", título com gradiente, 2 botões.
3. **Reel** — carrossel inclinado (-3°) com frames 9:16, rolagem infinita (lista duplicada), pausa no hover; cada card leva ao projeto.
4. **Sobre** — "Kronografx, o estúdio do Rafael."
5. **Arsenal** — seção *sticky* de 330vh com 3 telas que trocam conforme o scroll:
   01 After Effects (janela fake de AE com timecode e agulha sincronizados ao vídeo),
   02 Máquina dedicada (ficha + barra de render animada),
   03 Todas as telas (16:9, 1:1, 9:16). Em celular deitado vira lista normal.
6. **Processo** — 4 cards: Roteiro, Direção de arte, Animação e VFX, Finalização.
7. **Confiança** (fundo escuro) — Proposta por escrito, Estação dedicada, Fala direto com quem faz, Formato certo.
8. **Showcase** — até 4 primeiros projetos (`P.slice(0, 4)`).
9. **CTA final** — "Bora tirar sua ideia do papel?"

### Outras páginas
- **Projetos:** grade com todos + filtros gerados automaticamente a partir do campo `formato`.
- **Projeto:** hero com gradiente `cor`→`cor2`, chips (Cliente/Ano/Formato/Duração), "Como esse projeto nasceu" (`historia`), `nota`, player (botão play ativa som/controles), specbar, faixa de frames arrastável, CTA e "Próximo projeto" (circular).
  `vertical: true` deixa o player em 9:16.
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
- Cada projeto tem cores próprias (`cor`, `cor2`) usadas nos cards e na página do projeto.

## Projetos atuais (em `dados.js`)

| id | Título | Cliente | Formato | Duração | Cores | Observação |
|---|---|---|---|---|---|---|
| `e2-3-sinais` | 3 Sinais | E2 Finanças | Reels 9:16 | 0:36 | `#2a1f07` / `#b8892a` (preto e dourado) | Projeto real; chamada final para o "Método Viva". É o destaque "NOVO" do hero. |
| `itau-um-unico-app` | Um único app | Itaú | Filme 16:9 | 0:16 | `#d9530a` / `#0b1f8f` | Conceitual de portfólio, sem vínculo com o Itaú Unibanco. |
| `starbucks-seu-nome` | Seu nome no café | Starbucks | Reels 9:16 | 0:35 | `#00704a` / `#f2f0eb` | Conceitual de portfólio, sem vínculo com a Starbucks. |

Todos de 2026, disciplina "Motion Design".

## Como adicionar um projeto novo (passo a passo)

1. Colocar os arquivos seguindo o padrão de nomes:
   - `assets/video/<slug>.mp4` (vídeo completo) e `assets/video/<slug>-loop.mp4` (loop curto)
   - `assets/img/<slug>-capa.jpg` (poster do player)
   - `assets/img/<slug>-still-1..6.jpg` (frames da página do projeto)
   - `assets/img/frames/<slug>-N.jpg` (frames 9:16 para o carrossel da home)
2. Adicionar um objeto em `projetos` no `dados.js` com os campos:
   `id, titulo, cliente, subtitulo, categoria, disciplina, ano, formato, duracao, cor, cor2, vertical, video, loop, capa, fundo, specs[], historia[], frames[], nota`.
   A **ordem** do array define a ordem nos cards (os 4 primeiros vão para a home).
3. Adicionar entradas `["assets/img/frames/<slug>-N.jpg", "<id>"]` em `carrossel`.
4. Se for o lançamento mais recente, atualizar o anúncio "NOVO" no hero de `index.html` (texto e `href="#/projeto/<id>"`).
5. Projeto conceitual (marca sem vínculo) → preencher `nota` com o aviso "Projeto conceitual de portfólio, sem vínculo com ...".
6. Cuidado com vírgulas e aspas no `dados.js` — um erro quebra o site inteiro.

## Conteúdo dos vídeos (assistidos quadro a quadro em 2026-10-16)

Pranchas com os quadros de cada vídeo: `docs/kronografx/videos/`.

| Arquivo | Resolução | fps | Duração | Áudio | Peso |
|---|---|---|---|---|---|
| `e2.mp4` | 720×1280 | 30 | 36,0 s | sim (AAC 48 kHz) | 1,9 MB |
| `starbucks.mp4` | 720×1280 | 30 | 35,3 s | sim (AAC 44,1 kHz) | 1,3 MB |
| `itau.mp4` | 1920×1080 | 29,97 | 15,9 s | **não tem faixa de áudio** | 0,76 MB |
| `reel.mp4` | 1280×720 | 30 | 16,0 s | não | 0,56 MB |
| `e2-loop.mp4` | 540×960 | 30 | 9,0 s | não | 0,17 MB |
| `starbucks-loop.mp4` | 540×960 | 30 | 9,0 s | não | 0,08 MB |
| `itau-loop.mp4` | 960×540 | 29,97 | 6,6 s | não | 0,18 MB |

- **E2 "3 Sinais"**: fundo preto com moedas douradas. Roteiro: "Você não tem um problema de ~~DINHEIRO~~"
  → fundo dourado "Você tem um problema de **SISTEMA.** E isso aparece em 3 sinais" →
  **01** "Você não sabe pra onde seu dinheiro vai" (card de extrato, saldo cai de R$ 5.000 para R$ 12,40, selo "PRA ONDE FOI?") →
  **02** "Toda emergência vira um problema" (reserva de emergência R$ 3.200 → R$ 0,00, "Imprevisto: conserto do carro") →
  **03** "Trabalha mais. Ganha mais. Nunca sobra mais." (gráfico de 12 meses: renda +100%, sobra = R$ 0) →
  logo E2 em fundo verde-escuro: "Isso tem nome. E tem saída: **MÉTODO VIVA** tira você do piloto automático" →
  CTA "Comenta **DIAGNÓSTICO**" com simulação de comentário sendo digitado e respondido pela E2.
  Tipografia: sans pesada + serifada itálica; paleta preto/dourado.
- **Starbucks "Seu nome no café"**: fundo creme/verde Starbucks. "Pedir um café" (cursores com nomes "Rafa", "Josi") →
  "+170 mil jeitos de pedir a mesma bebida" (contador animado, bolhas Gelado/Venti/Descaf/Tall/Duplo/Aveia) →
  mancha verde transiciona para "Mas…" → "E se o seu café já soubesse o seu nome?" → copo com "Você" escrito →
  "feito pra você" → "Aqui… Também…" → pílulas Leite/Tamanho/Cobertura/Temperatura → celular "Pra iOS e Android",
  "Pedido pronto!" → "Tá esperando o quê?" → final "Seu nome já está no copo. @starbucksbrasil".
- **Itaú "Um único app"**: "Inicie uma nova jornada com o [itaú]" + botão "Conheça o App" com cursor →
  tela do app (Meu Itaú, Pix, Pagar, Crédito, Cartão virtual) sobre fundo laranja, em perspectiva 3D →
  fundo azul-marinho "Todas as suas finanças" → "Em um único app." → cartela final com logo Itaú, QR code,
  Google Play e App Store. **A cartela final fica parada de ~9 s até o fim (≈7 s estáticos).**
- **reel.mp4** (usado só no Arsenal "Todas as telas"): montagem 16:9 — app Itaú → "Sistema" da E2 (vertical
  com laterais desfocadas) → "Todas as suas finanças / Em um único app" → sinais 01 e 03 da E2 → logo E2 →
  termina no **logo K da Kronografx**.
- **Loops**: `e2-loop` = abertura até o Sinal 01; `starbucks-loop` = "E se o seu café…" até "feito pra você";
  `itau-loop` = tela do app → "Todas as suas finanças" → "Em um único app.".

## Imagens (vistas uma a uma em 2026-10-16)

Pranchas: `docs/kronografx/imagens/`.

- **Marca** (`mark.png` 512², `mark-lg.png` 1024², `apple-touch-icon.png` 180², `favicon-32.png`): PNG transparente,
  letra **K** prateada com haste em gradiente roxo, dentro de um arco de cronômetro (anel com "pino" no topo),
  arco em roxo/branco. No site aparece sobre círculo `#141414`.
- **og-image.jpg** (1200×630): fundo branco, logo + "Kronografx", "Cada frame pensado **pra prender o olhar.**" (gradiente azul→roxo).
- **reel-capa.jpg** (1280×720): quadro do app Itaú sobre laranja.
- **Capas** (poster do player): `e2-capa.jpg` 900×1600 ("SISTEMA." dourado), `itau-capa.jpg` 1600×900 (app sobre laranja),
  `starbucks-capa.jpg` 720×1280 (**quase vazia: fundo verde com um traço branco**).
- **Stills** (página do projeto): e2 e itaú 720×1280 / 1280×720, bem escolhidos (um por cena-chave).
  Os 6 `starbucks-still-*` são **cópias idênticas** de `frames/starbucks-2,4,5,7,8,3`; vários são quadros de
  transição (`still-2` verde quase vazio, `still-4` "Também" no meio da transição, `still-6` mancha verde cobrindo o "+170 mil").
- **Carrossel** (`frames/`, 9:16): e2 e itaú em 420×746, starbucks em 720×1280. Os de itaú são recortes verticais do vídeo 16:9.
  Fracos visualmente: `frames/e2-7.jpg` (**bege totalmente vazio, e está no carrossel**), `frames/starbucks-4.jpg`
  (verde com um traço), `frames/starbucks-6.jpg` ("Aqui" quase vazio), `frames/starbucks-1.jpg` (desbotado, transição),
  `frames/itau-4/5.jpg` (azul liso com uma frase pequena).
- `fundo` do Starbucks (`frames/starbucks-3.jpg`) é a mancha verde de transição — no card aparece como um borrão.

## Como o site aparece no navegador (testado em 2026-10-16)

Capturas em `docs/kronografx/capturas/` (computador 1440×900, celular 390×844, celular deitado 844×390).

- **Sem erros de JavaScript**, sem links quebrados, **sem rolagem horizontal** em nenhuma largura testada.
- Títulos das abas corretos em todas as rotas (ex.: "3 Sinais · E2 Finanças · Kronografx").
- Menu hambúrguer no celular abre/fecha bem; nav fica escura sobre as seções escuras.
- Arsenal: as 3 telas trocam certinho com a rolagem (computador e celular); no celular deitado viram blocos normais.
- Obs.: o navegador de teste não toca H.264, então nas capturas os vídeos aparecem só com o poster
  (o timecode do "After Effects" fica em 0:00:00:00). Em navegadores reais eles tocam.

## Pontos de atenção encontrados (ainda NÃO corrigidos — perguntar ao Rafael antes)

1. **Itaú sem áudio**: `itau.mp4` não tem faixa de som, mas a página diz "🎧 Assista com som" e o botão é "Assistir com som".
2. **Specs erradas**: E2 e Starbucks mostram "1080×1920", mas os arquivos são 720×1280.
3. **Poster do Starbucks fraco**: `starbucks-capa.jpg` é um quadro verde quase vazio — primeira impressão ruim no player.
4. **Frames vazios no carrossel da home**: `frames/e2-7.jpg` (bege vazio), `frames/starbucks-4.jpg`, `frames/starbucks-6.jpg`.
5. **Stills do Starbucks**: vários são quadros de transição; seria melhor escolher quadros com o texto completo.
6. **Destaques da home**: 3 projetos numa grade de 2 colunas → o 3º card fica sozinho com um buraco ao lado.
7. **Cards de projeto sem margem interna**: o título/subtítulo encostam nas bordas; em ~1000px o subtítulo do Starbucks
   quebra em 2 linhas. Texto branco no lado creme do card/hero/CTA do Starbucks tem pouco contraste.
8. **Vídeo do Itaú**: ~7 s finais parados na cartela (de 16 s).
9. **Celular**: anúncio "NOVO" do hero é cortado com "…" em 390px; em "Próximo projeto" a seta quebra para outra linha.
10. **Arquivos sem uso** (podem ser apagados ou aproveitados): `img/itau-loop.jpg`, `img/starbucks-loop.jpg`,
    `img/frames/e2-5.jpg`, `img/frames/starbucks-7.jpg`, `img/frames/starbucks-8.jpg`, e na prática também
    `video/itau-loop.mp4` e `video/starbucks-loop.mp4` (só citados no campo `loop`, que o `app.js` não usa).
11. **SEO**: as rotas são por `#`, então os projetos não viram páginas indexáveis separadas e todos compartilham
    o mesmo título/og-image ao compartilhar link. Não há `robots.txt`, `sitemap.xml`, canonical nem dados estruturados.
12. Projetos conceituais usam marcas reais (logo Itaú, QR code, "@starbucksbrasil" no fim do vídeo) — o aviso
    "sem vínculo" está no site, mas vale ter em mente.

## Outras observações técnicas

- O campo `loop` dos projetos existe em `dados.js` mas **não é usado** pelo `app.js` hoje.
- Vídeos com `data-loop` na home: só `e2-loop.mp4` (janela do After Effects e 9:16) e `reel.mp4` (16:9 e 1:1).
- `og-image.jpg` usa URL absoluta `https://kronografx.com/assets/img/og-image.jpg`.
- `html { scroll-behavior: smooth }` — ao automatizar capturas, desligar isso (senão o print sai no meio da rolagem).
- Alturas das páginas (computador): home ≈ 8.500 px, projeto ≈ 2.400–2.700 px.
- Tamanho total ≈ 6,5 MB (maior arquivo: `e2.mp4`, ~1,9 MB).

## Histórico

- **2026-10-16** — Site (versão "v5") enviado pelo Rafael como `Site_Oficial.rar` e salvo neste repositório
  em `kronografx/`, junto com este arquivo de memória. O Rafael mantém o site atualizado constantemente;
  quando ele mandar uma versão nova, substituir `kronografx/` e atualizar este arquivo.
- **2026-10-16** — Análise completa: todos os vídeos assistidos (pranchas de quadros), todas as imagens vistas,
  site aberto no navegador em computador/celular/celular deitado. Referências salvas em `docs/kronografx/`
  (fora da pasta do site, não precisa subir para a hospedagem). Lista de pontos de atenção acima.
