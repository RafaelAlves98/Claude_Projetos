"""Gera termos.html e privacidade.html em 4 idiomas (pt original + traduções), com nav/rodapé iguais aos da home.
Uso (na raiz do repositório):
  python3 docs/kronografx/ferramentas/gerar_legal.py kronografx docs/kronografx/textos-legais/pt.json \
          docs/kronografx/textos-legais/en.json docs/kronografx/textos-legais/es.json docs/kronografx/textos-legais/fr.json
O menu (nav), o rodapé e o script do <head> são copiados do index.html: rode de novo sempre que eles mudarem."""
import sys, json, re, html
from html.parser import HTMLParser

SITE = sys.argv[1]
docs = {"pt": json.load(open(sys.argv[2], encoding="utf-8"))}
for f in sys.argv[3:]:
    lang = re.search(r"(?:legal-)?(\w\w)\.json$", f).group(1)
    docs[lang] = json.load(open(f, encoding="utf-8"))
ORDEM = [l for l in ["pt", "en", "es", "fr"] if l in docs]
HTML_LANG = {"pt": "pt-BR", "en": "en", "es": "es", "fr": "fr"}

LINKS_OK = {"mailto:contato@kronografx.com", "https://wa.me/5516991220381", "https://instagram.com/kronografx",
            "privacidade.html", "termos.html", "https://www.gov.br/anpd"}
class Checa(HTMLParser):
    def __init__(s): super().__init__(); s.pilha = []; s.erros = []
    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if tag not in {"p", "ul", "li", "b", "a"}: s.erros.append(f"tag proibida <{tag}>")
        if tag == "a":
            if a.get("href") not in LINKS_OK: s.erros.append(f"link fora da lista: {a.get('href')}")
            if set(a) - {"href"}: s.erros.append(f"atributos extras em <a>: {a}")
        elif attrs: s.erros.append(f"atributos em <{tag}>")
        s.pilha.append(tag)
    def handle_endtag(s, tag):
        if not s.pilha or s.pilha[-1] != tag: s.erros.append(f"fechamento errado </{tag}>")
        else: s.pilha.pop()
def checa(frag, onde):
    c = Checa(); c.feed(frag); c.close()
    if c.pilha: c.erros.append(f"não fechadas: {c.pilha}")
    if c.erros: raise SystemExit(f"[{onde}] " + "; ".join(c.erros))

def bonito(frag, ind):
    frag = re.sub(r"\s*(<p>|<ul>|</ul>|<li>)", lambda m: "\n" + ind + ("  " if m.group(1) == "<li>" else "") + m.group(1), frag.strip())
    return frag.replace('<a href="https://', '<a target="_blank" rel="noopener" href="https://').lstrip("\n")

idx = open(f"{SITE}/index.html", encoding="utf-8").read().replace("\r\n", "\n")
def bloco(ini, fim):
    i = idx.index(ini); j = idx.index(fim, i) + len(fim); return idx[i:j]
para_home = lambda s: s.replace('href="#/', 'href="index.html#/')
HEAD_SCRIPT = bloco("<script>\n(function(){", "</script>")
NAV = para_home(bloco('<nav class="pill-nav"', "</nav>"))
FOOTER = para_home(bloco('<footer class="footer">', "</footer>"))
assert "kg-theme" in HEAD_SCRIPT and "langMenu" in NAV and "footer__cnpj" in FOOTER

CFG = {
    "privacidade": dict(arquivo="privacidade.html", doc="privacy", outro=("termos.html", "legal.terms", "Termos de Uso"),
                        titulo_aba="Política de Privacidade · Kronografx", h1_key="legal.privacy",
                        descricao="Como a Kronografx trata dados pessoais, em conformidade com a LGPD."),
    "termos": dict(arquivo="termos.html", doc="terms", outro=("privacidade.html", "legal.privacy", "Política de Privacidade"),
                   titulo_aba="Termos de Uso · Kronografx", h1_key="legal.terms",
                   descricao="Regras de uso do site da Kronografx, estúdio de motion design, VFX e pós-produção."),
}

def bloco_idioma(chave, lang):
    src = docs[lang]; d = src[chave]; pre = "" if lang == "pt" else lang + "-"
    checa(d["intro_html"], f"{lang}/{chave}/intro")
    ids_pt = [s["id"] for s in docs["pt"][chave]["secoes"]]
    assert [s["id"] for s in d["secoes"]] == ids_pt, f"{lang}/{chave}: ids/ordem das seções diferentes do original"
    for s in d["secoes"]: checa(s["corpo_html"], f"{lang}/{chave}/{s['id']}")
    nota = ""
    if lang != "pt":
        checa(src["nota_traducao_html"], f"{lang}/nota")
        nota = '      <div class="legal__transl">\n' + bonito(src["nota_traducao_html"], "        ") + "\n      </div>\n\n"
    toc = "\n".join(f'        <li><a href="#{pre}{s["id"]}">{html.escape(s["titulo"])}</a></li>' for s in d["secoes"])
    secoes = "\n\n".join(f'      <section id="{pre}{s["id"]}">\n        <h2>{html.escape(s["titulo"])}</h2>\n{bonito(s["corpo_html"], "        ")}\n      </section>' for s in d["secoes"])
    return f'''  <div class="wrap legal" data-l="{lang}" lang="{HTML_LANG[lang]}">
    <details class="legal__toc" open>
      <summary data-i18n="legal.toc">NESTA PÁGINA</summary>
      <ol>
{toc}
      </ol>
    </details>

    <article class="legal__doc">
{nota}      <div class="legal__intro">
{bonito(d["intro_html"], "        ")}
      </div>

{secoes}
    </article>
  </div>'''

def pagina(chave):
    c = CFG[chave]; url = "https://kronografx.com/" + c["arquivo"]
    corpo = "\n\n".join(f"  <!-- ===== {lang.upper()} ===== -->\n" + bloco_idioma(chave, lang) for lang in ORDEM)
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{c["titulo_aba"]}</title>
<meta name="description" content="{c["descricao"]}">
<meta name="theme-color" content="#ffffff">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kronografx">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{c["titulo_aba"]}">
<meta property="og:description" content="{c["descricao"]}">
<meta property="og:image" content="https://kronografx.com/assets/img/og-image.jpg">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/calsans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
{HEAD_SCRIPT}
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-doc="{c["doc"]}">

<a class="skip" href="#conteudo" data-i18n="skip">Pular para o conteúdo</a>

<!-- Navegação: a mesma da página principal (links voltam para index.html) -->
{NAV}

<main id="conteudo" tabindex="-1">
  <div class="wrap page-head">
    <p class="label" data-i18n="legal.label">LEGAL</p>
    <h1 class="h1" data-i18n="{c["h1_key"]}">{html.escape(docs["pt"][chave]["titulo"])}</h1>
    <p class="lede" data-i18n="legal.updated">Última atualização: 16 de outubro de 2026</p>
  </div>

  <!-- O texto existe nos 4 idiomas; o CSS mostra só o do idioma escolhido (atributo data-lang do <html>). -->
{corpo}

  <div class="wrap legal-end">
    <div class="legal__more">
      <p><span class="legal__more-t" data-i18n="legal.more">Ficou alguma dúvida?</span><span><span data-i18n="legal.see">Veja também:</span> <a href="{c["outro"][0]}" data-i18n="{c["outro"][1]}">{c["outro"][2]}</a></span></p>
      <div>
        <a class="btn btn--dark" data-wa href="#" target="_blank" rel="noopener" data-i18n="legal.wa">Chamar no WhatsApp</a>
        <a class="btn btn--light" href="mailto:contato@kronografx.com" data-i18n="legal.mail">Enviar e-mail</a>
      </div>
    </div>
  </div>
</main>

{FOOTER}

<script src="assets/js/i18n.js"></script>
<script src="assets/js/dados.js"></script>
<script src="assets/js/legal.js"></script>
</body>
</html>
'''

for chave, c in CFG.items():
    open(f"{SITE}/{c['arquivo']}", "w", encoding="utf-8").write(pagina(chave))
    print("gerado:", c["arquivo"], "| idiomas:", ", ".join(ORDEM))
