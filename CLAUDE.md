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

## Observações técnicas (estado em 2026-10-16)

- O campo `loop` dos projetos existe em `dados.js` mas **não é usado** pelo `app.js` hoje.
- Arquivos presentes mas não referenciados: `img/itau-loop.jpg`, `img/starbucks-loop.jpg`,
  `img/frames/e2-5.jpg`, `img/frames/starbucks-7.jpg`, `img/frames/starbucks-8.jpg`.
- Os `starbucks-still-*.jpg` são cópias de frames de `frames/starbucks-*` (mesmos tamanhos).
- O vídeo `reel.mp4` (e `reel-capa.jpg`) é usado só na tela "Todas as telas" do Arsenal.
- `og-image.jpg` usa URL absoluta `https://kronografx.com/assets/img/og-image.jpg`.
- Tamanho total ≈ 6,5 MB (maior arquivo: `e2.mp4`, ~1,9 MB).

## Histórico

- **2026-10-16** — Site (versão "v5") enviado pelo Rafael como `Site_Oficial.rar` e salvo neste repositório
  em `kronografx/`, junto com este arquivo de memória. O Rafael mantém o site atualizado constantemente;
  quando ele mandar uma versão nova, substituir `kronografx/` e atualizar este arquivo.
