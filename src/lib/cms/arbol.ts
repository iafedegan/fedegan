import "server-only";
import { getLegacyPage, legacyHref, legacySections, type NavNode } from "@/content/legacy";
import type { ArbolNodo } from "./arbol-tipos";
import { mergeTree, type SiteNode } from "./nodos";

// Arma el árbol completo del sitio para /admin/arbol: barra de navegación → secciones → subsecciones → páginas,
// hasta el último nivel, con lo copiado del portal actual y lo creado en el panel.

export type NavRow = { id: string; label: string; href: string; published: boolean };

const SECCION_RE = /^\/seccion\/([^/?#]+)\/?$/;
const PENDIENTES: Record<string, string> = { "seguridad-ganadera": "Sección en preparación" };
const FIJAS: [string, string][] = [
  ["Inicio", "/"],
  ["Quiénes somos", "/quienes-somos"],
  ["Noticias (CONtexto Ganadero)", "/noticias"],
  ["Publicaciones", "/publicaciones"],
  ["Eventos", "/eventos"],
  ["Servicios", "/servicios"],
  ["Contacto y PQRSD", "/contacto"],
  ["Preguntas frecuentes", "/preguntas-frecuentes"],
  ["Escuela Virtual", "/escuela-virtual"],
  ["TvGan", "/tvgan"],
  ["Directorio", "/directorio"],
  ["Programas", "/programas"],
  ["Normatividad", "/normatividad"],
  ["Accesos, pagos y avisos", "/accesos"],
  ["Zona de pagos", "/pagos"],
  ["Transparencia", "/transparencia"],
  ["Mapa del sitio", "/mapa-del-sitio"],
  ["Privacidad", "/privacidad"],
  ["Términos", "/terminos"],
];

const externa = (href?: string) => /^https?:\/\//.test(href ?? "");
const editarLegacy = (key: string) => `/admin/paginas/editar/${key.split("/").map(encodeURIComponent).join("/")}`;
const sumar = (list: ArbolNodo[]): number => list.reduce((a, n) => a + 1 + n.total, 0);

type Ctx = { porId: Map<string, SiteNode>; editadas: Set<string> };

function mapear(lista: NavNode[], estaticos: NavNode[], slug: string, landing: string | null, ruta: number[], ctx: Ctx): ArbolNodo[] {
  const out: ArbolNodo[] = [];
  lista.forEach((n, i) => {
    // Los nodos nuevos van siempre al final de sus hermanos: los primeros son los copiados, con su camino original.
    const original = i < estaticos.length ? estaticos[i] : null;
    const camino = [...ruta, i];
    if (landing && n.key === landing) return; // la portada ya es la propia sección
    const nodo = n.nid ? ctx.porId.get(n.nid) : undefined;
    const kids = mapear(n.children ?? [], original?.children ?? [], slug, null, camino, ctx);
    const kind = n.key ? "pagina" : n.href ? "enlace" : "grupo";
    out.push({
      id: n.nid ? `n:${n.nid}` : `p:${slug}:${camino.join(".")}`,
      label: n.label,
      kind,
      href: n.key ? legacyHref(slug, n.key) : n.href,
      external: !n.key && externa(n.href),
      origen: n.nid ? "nueva" : undefined,
      editada: Boolean(n.key && ctx.editadas.has(n.key)),
      oculta: nodo ? !nodo.published : undefined,
      add: kind === "pagina" ? { section: slug, parent: n.key! } : kind === "grupo" ? { section: slug, parent: `~${camino.join(".")}` } : undefined,
      editHref: n.nid ? `/admin/arbol/${n.nid}` : n.key ? editarLegacy(n.key) : undefined,
      nodeId: n.nid,
      total: sumar(kids),
      children: kids,
    });
  });
  return out;
}

type Seccion = { slug: string; label: string; landing: string; estatico: NavNode[]; cabeza?: SiteNode; propios: SiteNode[] };

function secciones(nodes: SiteNode[]): Map<string, Seccion> {
  const out = new Map<string, Seccion>();
  for (const [slug, s] of Object.entries(legacySections)) out.set(slug, { slug, label: s.label, landing: s.landing, estatico: s.tree, propios: nodes.filter((n) => n.section === slug && !n.is_section) });
  for (const cabeza of nodes.filter((n) => n.is_section)) {
    out.set(cabeza.section, { slug: cabeza.section, label: cabeza.label, landing: cabeza.key, estatico: [], cabeza, propios: nodes.filter((n) => n.section === cabeza.section && !n.is_section) });
  }
  return out;
}

function hijosDeSeccion(s: Seccion, ctx: Ctx): ArbolNodo[] {
  const fusionado = mergeTree(s.estatico, s.propios);
  return mapear(fusionado, s.estatico, s.slug, s.landing, [], ctx);
}

function nodoSeccion(s: Seccion, ctx: Ctx): ArbolNodo {
  const kids = hijosDeSeccion(s, ctx);
  return {
    id: `s:${s.slug}`,
    label: s.label,
    kind: "seccion",
    href: `/seccion/${s.slug}`,
    origen: s.cabeza ? "nueva" : undefined,
    editada: !s.cabeza && ctx.editadas.has(s.landing),
    oculta: s.cabeza ? !s.cabeza.published : undefined,
    add: { section: s.slug, parent: null },
    editHref: s.cabeza ? `/admin/arbol/${s.cabeza.id}` : getLegacyPage(s.landing) ? editarLegacy(s.landing) : undefined,
    nodeId: s.cabeza?.id,
    total: sumar(kids),
    children: kids,
  };
}

export function construirArbol({ nav, nodes, editadas }: { nav: NavRow[]; nodes: SiteNode[]; editadas: Set<string> }): ArbolNodo[] {
  const ctx: Ctx = { porId: new Map(nodes.map((n) => [n.id, n])), editadas };
  const todas = secciones(nodes);
  const usadas = new Set<string>();

  const barra: ArbolNodo[] = nav.map((it) => {
    const slug = SECCION_RE.exec(it.href)?.[1];
    const s = slug ? todas.get(slug) : undefined;
    const base: ArbolNodo = {
      id: `nav:${it.id}`,
      label: it.label,
      kind: "nav",
      href: it.href,
      external: externa(it.href),
      oculta: !it.published || undefined,
      navId: it.id,
      editHref: `/admin/menu/${it.id}`,
      nota: slug && !s ? PENDIENTES[slug] : undefined,
      total: 0,
      children: [],
    };
    if (!s) return base;
    usadas.add(s.slug);
    const sec = nodoSeccion(s, ctx);
    // La portada de la sección se edita como una página más, dentro de la opción de la barra.
    const portada: ArbolNodo[] = sec.editHref
      ? [{ id: `portada:${s.slug}`, label: "Portada de la sección", kind: "pagina", href: sec.href, editada: sec.editada, origen: sec.origen, nodeId: undefined, editHref: sec.editHref, total: 0, children: [] }]
      : [];
    const hijos = [...portada, ...sec.children];
    return { ...base, add: sec.add, nodeId: undefined, origen: undefined, children: hijos, total: sumar(hijos) };
  });

  const otras = [...todas.values()].filter((s) => !usadas.has(s.slug)).map((s) => nodoSeccion(s, ctx));
  const fijas: ArbolNodo[] = FIJAS.map(([label, href]) => ({ id: `ruta:${href}`, label, kind: "ruta", href, total: 0, children: [] }));

  return [
    { id: "g:nav", label: "Barra de navegación", kind: "grupo-raiz", total: sumar(barra), children: barra },
    { id: "g:sec", label: "Otras secciones del portal", kind: "grupo-raiz", total: sumar(otras), children: otras },
    { id: "g:fijas", label: "Páginas fijas del portal", kind: "grupo-raiz", total: fijas.length, children: fijas },
  ];
}
