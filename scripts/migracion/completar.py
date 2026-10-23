#!/usr/bin/env python3
"""Completa src/content/legacy/portal.json con las páginas del portal Drupal que los textos migrados enlazan
y que la copia inicial no trajo. Sigue los enlaces internos de las páginas ya migradas (hasta MAX_RONDAS
rondas), convierte el cuerpo a los mismos bloques (p, h2-h4, li, table, embed), asigna la sección y el padre
de quien la enlazó y reescribe los enlaces absolutos que ya tienen página propia.

Uso: python3 scripts/migracion/completar.py   (requiere beautifulsoup4 y lxml)
"""
import json, re, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

RAIZ = Path(__file__).resolve().parents[2]
PORTAL = RAIZ / "src/content/legacy/portal.json"
BASE = "https://www.fedegan.org.co"
MAX_RONDAS = 4
MAX_NUEVAS = 700
ARCHIVO = re.compile(r"\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|mp3|mp4)$", re.I)
# Rutas del Drupal que no son contenido de sección (portada, noticias, buscador, usuario, etc.).
EXCLUIR = re.compile(r"^(|quienes-somos|noticias?(/.*)?|user(/.*)?|search(/.*)?|contacto|eventos?(/.*)?|taxonomy/.*|node/.*|sites/.*|tvgan.*|servicios-en-linea.*)$")

def get(url):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (migracion-fedegan)"})
            with urllib.request.urlopen(req, timeout=40) as r:
                if r.status == 200 and "text/html" in r.headers.get("Content-Type", ""):
                    return r.read().decode("utf-8", "replace")
                return None
        except Exception:
            time.sleep(1 + i)
    return None

def ruta_de(url):
    u = urllib.parse.urlparse(url)
    if u.netloc not in ("www.fedegan.org.co", "fedegan.org.co", ""):
        return None
    return urllib.parse.unquote(u.path).strip("/")

def inline(el, claves):
    out = []
    for c in el.children:
        if isinstance(c, NavigableString):
            out.append(str(c))
        elif isinstance(c, Tag):
            if c.name in ("script", "style"):
                continue
            if c.name == "br":
                out.append(" "); continue
            t = inline(c, claves)
            if c.name in ("strong", "b") and t.strip():
                out.append(f"**{t.strip()}**")
            elif c.name == "a" and c.get("href"):
                href = enlace(c["href"], claves)
                out.append(f"[{t.strip() or href}]({href})" if t.strip() or href else t)
            else:
                out.append(t)
    return re.sub(r"\s+", " ", "".join(out).replace("\xa0", " "))

def enlace(href, claves):
    href = href.strip()
    if href.startswith(("mailto:", "tel:", "#", "javascript:")):
        return href
    absoluta = urllib.parse.urljoin(BASE + "/", href)
    r = ruta_de(absoluta)
    if r is not None and r in claves and not ARCHIVO.search(r):
        return None_if_vacia(r)
    return absoluta

def None_if_vacia(r):
    return f"@@{r}@@"  # se resuelve a /seccion/<slug>/<clave> al final, cuando se conoce la sección

def bloques(raiz, claves):
    out = []
    def txt(el):
        t = inline(el, claves).strip()
        return t if re.search(r"\w", t) else ""
    def visita(el):
        for c in el.children:
            if isinstance(c, NavigableString):
                t = re.sub(r"\s+", " ", str(c)).strip()
                if t: out.append({"t": "p", "text": t})
                continue
            if not isinstance(c, Tag) or c.name in ("script", "style"):
                continue
            n = c.name
            if n in ("h1", "h2", "h3", "h4", "h5", "h6"):
                t = txt(c)
                if t: out.append({"t": {"h1": "h2", "h5": "h4", "h6": "h4"}.get(n, n), "text": t})
            elif n in ("ul", "ol"):
                for li in c.find_all("li", recursive=False):
                    t = txt(li)
                    if t: out.append({"t": "li", "text": t})
            elif n == "table":
                rows = [[txt(td) for td in tr.find_all(["td", "th"])] for tr in c.find_all("tr")]
                rows = [r for r in rows if any(r)]
                if rows: out.append({"t": "table", "rows": rows})
            elif n in ("iframe", "embed") and c.get("src"):
                out.append({"t": "embed", "text": urllib.parse.urljoin(BASE, c["src"])})
            elif n == "object" and "tableauViz" in (c.get("class") or []):
                nombre = next((p.get("value") for p in c.find_all("param") if p.get("name") == "name"), None)
                ruta_t = next((p.get("value") for p in c.find_all("param") if p.get("name") == "path"), None)
                if nombre: out.append({"t": "embed", "text": f"https://public.tableau.com/views/{nombre}?:showVizHome=no&:embed=true"})
                elif ruta_t: out.append({"t": "embed", "text": f"https://public.tableau.com/{ruta_t.lstrip('/')}"})
            elif n in ("p", "blockquote"):
                if c.find(["iframe", "embed", "object"]): visita(c)
                else:
                    t = txt(c)
                    if t: out.append({"t": "p", "text": t})
            elif n == "div" or n in ("section", "article", "span", "center", "font"):
                hijos_bloque = c.find(["div", "p", "ul", "ol", "table", "h1", "h2", "h3", "h4", "h5", "h6", "iframe", "embed", "object"])
                if hijos_bloque: visita(c)
                else:
                    t = txt(c)
                    if t: out.append({"t": "p", "text": t})
            else:
                t = txt(c)
                if t: out.append({"t": "p", "text": t})
    visita(raiz)
    return out

def convierte(html, ruta, claves):
    s = BeautifulSoup(html, "lxml")
    art = s.select_one("#content-wrap article") or s.select_one("#content article")
    if not art:
        return None
    titulo = (art.select_one("h2.title, h1.title, .title") or s.title)
    titulo = re.sub(r"\s*\|\s*Fedeg[aá]n\s*$", "", titulo.get_text(" ", strip=True))
    cuerpo = art.select_one(".field-name-body .field-item")
    bl = bloques(cuerpo, claves) if cuerpo else []
    # Otros campos con archivos o enlaces (documentos adjuntos), fuera del cuerpo.
    for campo in art.select("[class*='field-name-field-']"):
        if "field-name-field-image" in campo.get("class", []) or campo.find_parent(class_="field-name-body"):
            continue
        for a in campo.select("a[href]"):
            t = a.get_text(" ", strip=True)
            h = enlace(a["href"], claves)
            if t and h: bl.append({"t": "li", "text": f"[{t}]({h})"})
    return {"title": titulo, "source": f"{BASE}/{urllib.parse.quote(ruta)}", "blocks": bl}

def enlaces_de(pagina):
    vistos = []
    def mira(t):
        for m in re.finditer(r"\]\(([^)]+)\)", t):
            vistos.append(m.group(1))
    for b in pagina["blocks"]:
        if b.get("text"): mira(b["text"])
        for fila in b.get("rows", []):
            for c in fila: mira(c)
    return vistos

def reparar(datos):
    """Páginas migradas sin texto ni incrustados: vuelve a leerlas y agrega los tableros (Tableau) y PDF que la
    primera copia no reconocía."""
    paginas = datos["pages"]
    def debil(p):
        return not any(b["t"] in ("embed", "table") for b in p["blocks"]) and sum(len(b.get("text", "")) for b in p["blocks"] if not b.get("text", "").startswith("Publicado por")) < 80
    lote = [k for k, p in paginas.items() if debil(p)]
    claves = set(paginas)
    with ThreadPoolExecutor(8) as ex:
        htmls = list(ex.map(lambda k: get(f"{BASE}/{urllib.parse.quote(k)}"), lote))
    n = 0
    for k, html in zip(lote, htmls):
        if not html: continue
        pg = convierte(html, k, claves)
        if not pg: continue
        previos = {json.dumps(b, sort_keys=True) for b in paginas[k]["blocks"]}
        nuevos = [b for b in pg["blocks"] if json.dumps(b, sort_keys=True) not in previos]
        if nuevos:
            paginas[k]["blocks"] += nuevos; n += 1
    print(f"páginas reparadas: {n} de {len(lote)}", file=sys.stderr)
    PORTAL.write_text(json.dumps(datos, ensure_ascii=False, indent=1))

def main():
    datos = json.loads(PORTAL.read_text())
    if "--reparar" in sys.argv:
        return reparar(datos)
    paginas = datos["pages"]
    pendiente = {}
    # 1) Todo enlace a una ruta del Drupal que no es archivo ni excluida y no tiene página aún.
    def candidatos(k, p, claves):
        for u in enlaces_de(p):
            if u.startswith("@@"): continue
            r = ruta_de(u) if u.startswith("http") else None
            if r is None or ARCHIVO.search(r) or EXCLUIR.match(r) or r in claves or r in pendiente: continue
            pendiente[r] = k
    for k, p in list(paginas.items()):
        candidatos(k, p, set(paginas))
    nuevas = 0
    for ronda in range(1, MAX_RONDAS + 1):
        lote = list(pendiente.items())[: max(0, MAX_NUEVAS - nuevas)]
        if not lote: break
        pendiente = {r: k for r, k in pendiente.items() if (r, k) not in lote}
        print(f"ronda {ronda}: {len(lote)} páginas", file=sys.stderr)
        claves = set(paginas) | {r for r, _ in lote}
        with ThreadPoolExecutor(8) as ex:
            htmls = list(ex.map(lambda rk: get(f"{BASE}/{urllib.parse.quote(rk[0])}"), lote))
        for (ruta, ref), html in zip(lote, htmls):
            if not html: print("  sin respuesta:", ruta, file=sys.stderr); continue
            pg = convierte(html, ruta, claves)
            if not pg: print("  sin artículo:", ruta, file=sys.stderr); continue
            padre = paginas[ref]
            pg["sections"] = list(padre["sections"])
            pg["parent"] = ref
            paginas[ruta] = pg
            nuevas += 1
            candidatos(ruta, pg, set(paginas))
    # 2) Resolver marcadores @@ruta@@ y los enlaces absolutos a páginas con página propia.
    def resuelve(t, sec):
        def sub_marca(m):
            r = m.group(1)
            if r not in paginas: return f"{BASE}/{urllib.parse.quote(r)}"
            slug = sec[0] if sec else None
            slug = slug if slug and r in paginas and slug in paginas[r]["sections"] else (paginas[r]["sections"][0] if paginas[r]["sections"] else None)
            if not slug: return f"{BASE}/{urllib.parse.quote(r)}"
            return f"/seccion/{slug}" if datos["sections"][slug]["landing"] == r else f"/seccion/{slug}/{r}"
        t = re.sub(r"@@(.+?)@@", sub_marca, t)
        def sub_abs(m):
            u = m.group(1); r = ruta_de(u) if u.startswith("http") else None
            if r is not None and r in paginas and not ARCHIVO.search(r) and paginas[r]["sections"]:
                return "](" + sub_marca(re.match(r"@@(.+?)@@", f"@@{r}@@")) + ")"
            return m.group(0)
        return re.sub(r"\]\((https?://[^)]+)\)", sub_abs, t)
    for k, p in paginas.items():
        for b in p["blocks"]:
            if b.get("text"): b["text"] = resuelve(b["text"], p["sections"])
            if b.get("rows"): b["rows"] = [[resuelve(c, p["sections"]) for c in f] for f in b["rows"]]
    # 3) Árbol: las páginas nuevas cuelgan del nodo de su padre.
    def nodo(arbol, clave):
        for n in arbol:
            if n.get("key") == clave: return n
            if n.get("children"):
                r = nodo(n["children"], clave)
                if r: return r
    def en_arbol(arbol, clave):
        return nodo(arbol, clave) is not None
    for k, p in paginas.items():
        if not p.get("parent") or not p["sections"]: continue
        for slug in p["sections"]:
            arbol = datos["sections"][slug]["tree"]
            if en_arbol(arbol, k): continue
            padre = nodo(arbol, p["parent"])
            if padre is not None and k != datos["sections"][slug]["landing"]:
                padre.setdefault("children", []).append({"label": p["title"], "key": k})
    PORTAL.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
    print(f"páginas nuevas: {nuevas}; total {len(paginas)}", file=sys.stderr)

if __name__ == "__main__":
    main()
