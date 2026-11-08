import "server-only";
import { getLegacyPage, legacyHref, legacySections, type NavNode } from "@/content/legacy";
import type { ArbolNodo } from "./arbol-tipos";
import { footerLinks } from "@/content/site";
import { mergeTree, type SiteNode } from "./nodos";

// Arma el árbol completo del sitio para /admin/arbol: barra de navegación → secciones → subsecciones → páginas,
// hasta el último nivel, con lo copiado del portal actual y lo creado en el panel.

export type NavRow = { id: string; label: string; href: string; published: boolean };
export type PortalRow = { id?: string; nombre: string; href: string };
export type PreguntaRow = { id: string; texto: string };

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

// Rutas fijas cuyo contenido se maneja desde un editor del panel (antes tenían su propia entrada en el menú lateral).
const EDITORES: Record<string, string> = {
  "/publicaciones": "/admin/publicaciones",
  "/eventos": "/admin/eventos",
  "/preguntas-frecuentes": "/admin/preguntas",
};

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

// Lo que está en la portada y en el pie de página: cada elemento lleva al editor que lo maneja (o dice que es fijo del diseño).
const ficha = (id: string, label: string, href: string | undefined, extra: Partial<ArbolNodo> = {}): ArbolNodo => ({ id: `x:${id}`, label, kind: "elemento", href, total: 0, children: [], ...extra });
const FIJO = "Fijo en el diseño";

// Las preguntas frecuentes llegan hasta cada pregunta: bajo la ruta «/preguntas-frecuentes» (en la barra, en la portada y en las rutas fijas)
// se listan todas, cada una con su lápiz, y un acceso para agregar una nueva.
const RUTA_FAQ = "/preguntas-frecuentes";
function hijosFaq(prefijo: string, preguntas: PreguntaRow[]): ArbolNodo[] {
  return [
    ficha(`${prefijo}-faq-nueva`, "Agregar una pregunta", RUTA_FAQ, { editHref: "/admin/preguntas/nuevo" }),
    ...preguntas.map((p) => ficha(`${prefijo}-faq-${p.id}`, p.texto, RUTA_FAQ, { editHref: `/admin/preguntas/${p.id}` })),
  ];
}
function conFaq(n: ArbolNodo, prefijo: string, preguntas: PreguntaRow[]): ArbolNodo {
  if (n.href !== RUTA_FAQ) return n;
  const extra = hijosFaq(prefijo, preguntas);
  return { ...n, children: [...n.children, ...extra], total: n.total + sumar(extra) };
}

function grupoCabecera(): ArbolNodo {
  const kids = [
    ficha("head-mercado", "Cintillo de mercado", undefined, { nota: "Automático: dólar, petróleo, bolsas, oro y ganado" }),
    ficha("head-logo", "Logo, fecha y cintillo de colores", "/", { nota: FIJO }),
    ficha("head-buscador", "Buscador", "/buscador", { nota: FIJO }),
    ficha("head-cuenta", "Cuenta («Equipo» o «Ingresar»)", "/ingresar", { nota: FIJO }),
    ficha("head-titulares", "Cintillo de titulares", "/", { editHref: "/admin/diseno", nota: "Diseño → Cintillo" }),
    ficha("head-banner", "Banner bajo el encabezado", "/", { editHref: "/admin/diseno", nota: "Diseño → Publicidad" }),
    ficha("head-popup", "Ventana emergente", "/", { editHref: "/admin/diseno", nota: "Diseño → Ventana emergente" }),
    ficha("head-estilo", "Plantilla, colores y fuentes de la cabecera", "/", { editHref: "/admin/diseno", nota: "Diseño del sitio" }),
  ];
  return { id: "g:head", label: "Cabecera", kind: "grupo-raiz", total: sumar(kids), children: kids };
}

function grupoPortada(preguntas: PreguntaRow[]): ArbolNodo {
  const kids = [
    ficha("home-carrusel", "Carrusel de portada (banners)", "/", { editHref: "/admin/diseno", nota: "Diseño → Publicidad" }),
    ficha("home-accesos", "Accesos rápidos y tarjetas de inicio", "/", { nota: FIJO }),
    ficha("home-noticias", "Noticias destacadas (CONtexto)", "/noticias", { editHref: "/admin/apis", nota: "Vienen de CONtexto" }),
    ficha("home-publicaciones", "Publicaciones", "/publicaciones", { editHref: "/admin/publicaciones" }),
    ficha("home-eventos", "Eventos y agenda", "/eventos", { editHref: "/admin/eventos" }),
    conFaq(ficha("home-preguntas", "Preguntas frecuentes", RUTA_FAQ, { editHref: "/admin/preguntas" }), "home", preguntas),
    ficha("home-locales", "Locales del gremio", "/", { editHref: "/admin/locales" }),
    ficha("home-cifras", "Cifras del sector (inicio)", "/", { editHref: "/admin/cifras" }),
  ];
  return { id: "g:home", label: "Portada (inicio)", kind: "grupo-raiz", total: sumar(kids), children: kids };
}

function grupoPie(portales: PortalRow[]): ArbolNodo {
  const aliados: ArbolNodo[] = portales.map((p, i) => ({
    id: `x:pie-aliado-${p.id ?? i}`,
    label: p.nombre,
    kind: "enlace",
    href: p.href,
    external: externa(p.href),
    editHref: p.id ? `/admin/portales/${p.id}` : undefined,
    total: 0,
    children: [],
  }));
  const lista = (id: string, label: string, links: { label: string; href: string }[], extra: Partial<ArbolNodo> = {}): ArbolNodo => {
    const hijos = links.map((l, i) => ficha(`${id}-${i}`, l.label, l.href, { external: externa(l.href) }));
    return ficha(id, label, undefined, { children: hijos, total: hijos.length, ...extra });
  };
  const kids = [
    ficha("pie-aliados", "Portales aliados (logos)", undefined, { editHref: "/admin/portales", children: aliados, total: aliados.length }),
    lista("pie-enlaces", "Enlaces rápidos", [...footerLinks.enlaces, { label: "Pagos, trámites y avisos", href: "/accesos" }], { nota: FIJO }),
    lista("pie-servicios", "Servicios destacados", footerLinks.servicios, { nota: FIJO }),
    ficha("pie-contacto", "Contacto y correos institucionales", "/contacto", { nota: FIJO }),
    ficha("pie-boletin", "Suscripción al boletín", undefined, { nota: FIJO }),
    lista("pie-legal", "Enlaces legales", [
      { label: "Mapa del sitio", href: "/mapa-del-sitio" },
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Transparencia", href: "/transparencia" },
      { label: "Contacto", href: "/contacto" },
    ], { nota: FIJO }),
  ];
  return { id: "g:pie", label: "Pie de página (footer)", kind: "grupo-raiz", total: sumar(kids), children: kids };
}

export function construirArbol({ nav, nodes, editadas, portales = [], preguntas = [] }: { nav: NavRow[]; nodes: SiteNode[]; editadas: Set<string>; portales?: PortalRow[]; preguntas?: PreguntaRow[] }): ArbolNodo[] {
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
  }).map((n) => conFaq(n, "nav", preguntas));

  const otras = [...todas.values()].filter((s) => !usadas.has(s.slug)).map((s) => nodoSeccion(s, ctx));
  const fijas: ArbolNodo[] = FIJAS.map(([label, href]) => conFaq({ id: `ruta:${href}`, label, kind: "ruta", href, editHref: EDITORES[href], total: 0, children: [] }, "fija", preguntas));

  return [
    grupoCabecera(),
    { id: "g:nav", label: "Barra de navegación", kind: "grupo-raiz", total: sumar(barra), children: barra },
    grupoPortada(preguntas),
    grupoPie(portales),
    { id: "g:sec", label: "Otras secciones del portal", kind: "grupo-raiz", total: sumar(otras), children: otras },
    { id: "g:fijas", label: "Páginas fijas del portal", kind: "grupo-raiz", total: fijas.length, children: fijas },
  ];
}
