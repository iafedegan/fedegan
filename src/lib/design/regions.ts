// Motor de ajustes de diseño: tipos, validación y generación de CSS.
// Es puro (sin acceso a datos) para poder usarlo en el servidor y en la vista previa del editor.

export const REGION_IDS = ["navbar", "hero", "news", "cards", "body", "footer"] as const;
export type RegionId = (typeof REGION_IDS)[number];

export const REGIONS: { id: RegionId; label: string; hint: string; controls: (keyof RegionStyle)[] }[] = [
  { id: "navbar", label: "Encabezado", hint: "Logo, buscador y menú principal.", controls: ["bg", "fg", "accent", "titleFont", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "hero", label: "Recorrido", hint: "El recorrido a pantalla completa del inicio.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "news", label: "Noticias de portada", hint: "El bloque principal de noticias del inicio.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "cards", label: "Tarjetas", hint: "Noticias, publicaciones y eventos del inicio.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "body", label: "Cuerpo", hint: "Contenido general de todas las páginas.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth"] },
  { id: "footer", label: "Pie de página", hint: "Enlaces, contacto y boletín.", controls: ["bg", "fg", "accent", "titleFont", "textScale", "padY", "maxWidth", "hidden"] },
];

export const FONTS = [
  { value: "display", label: "Serif elegante (Playfair)", css: "var(--font-display)" },
  { value: "body", label: "Sans de lectura (Inter Tight)", css: "var(--font-body)" },
  { value: "georgia", label: "Serif clásica (Georgia)", css: "Georgia, 'Times New Roman', serif" },
  { value: "system", label: "Sistema", css: "system-ui, 'Segoe UI', sans-serif" },
] as const;
export type FontId = (typeof FONTS)[number]["value"];

export type RegionStyle = {
  bg?: string;
  fg?: string;
  accent?: string;
  titleFont?: FontId;
  titleScale?: number; // %
  textScale?: number; // %
  padY?: number; // rem
  maxWidth?: number; // px
  hidden?: boolean;
};

// ---- piezas intercambiables -----------------------------------------------------
export const NAVBARS = [
  { id: "clasico", label: "Clásico", description: "Logo, buscador y menú en una franja aparte." },
  { id: "compacta", label: "Compacta", description: "Sin buscador y más baja: más espacio para el contenido." },
  { id: "centrada", label: "Centrada", description: "Logo y menú centrados, estilo editorial." },
] as const;
export const FOOTERS = [
  { id: "completo", label: "Completo", description: "Enlaces, servicios, contacto y boletín." },
  { id: "central", label: "Sin contacto", description: "Marca y dos columnas de enlaces." },
  { id: "minimo", label: "Mínimo", description: "Marca centrada y enlaces legales." },
] as const;
export const HEROES = [
  { id: "izquierda", label: "Texto a la izquierda", description: "Composición actual del recorrido." },
  { id: "centro", label: "Texto centrado", description: "Títulos y botones al centro de la foto." },
] as const;

// ---- plantillas completas ----------------------------------------------------------
// Cada plantilla es un diseño distinto del sitio: cambia la forma de la barra, las cabeceras de página, las tarjetas,
// el pie, la composición de la portada, la tipografía y los colores. Lo que el equipo ajuste en el editor (colores y
// tipografías por zona, textos, imágenes, orden, piezas) se aplica encima de la plantilla elegida.
// La plantilla fija el tono (claro u oscuro): el botón de tono se oculta mientras haya una activa.
const GF = "https://fonts.googleapis.com/css2?family=";
export const TEMPLATES = [
  {
    id: "bento",
    label: "Bento",
    description: "Barra flotante en píldora de vidrio, módulos redondeados en mosaico y tipografía geométrica. Estilo SaaS moderno.",
    traits: ["Barra flotante", "Mosaico de módulos", "Sans geométrica"],
    mode: "claro",
    fonts: `${GF}Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`,
    parts: { navbar: "clasico", footer: "completo", hero: "izquierda" },
    swatch: ["#ecebe4", "#ffffff", "#27a06b", "#16201a"],
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Cabecera de periódico con filetes, titulares serif grandes, páginas centradas y noticias en filas con filete.",
    traits: ["Cabecera de periódico", "Filas con filetes", "Serif"],
    mode: "claro",
    fonts: "",
    parts: { navbar: "clasico", footer: "central", hero: "izquierda" },
    swatch: ["#fbf8f1", "#ffffff", "#1b1b1b", "#8a2b2b"],
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Menú lateral fijo, fondo oscuro con brillos de color, tarjetas de vidrio y titulares con degradado.",
    traits: ["Menú lateral", "Vidrio sobre oscuro", "Titulares con degradado"],
    mode: "oscuro",
    fonts: `${GF}Sora:wght@300;400;600;700&display=swap`,
    parts: { navbar: "clasico", footer: "completo", hero: "izquierda" },
    swatch: ["#0b1210", "#16211c", "#5eead4", "#a78bfa"],
  },
  {
    id: "brutalista",
    label: "Brutalista",
    description: "Bordes gruesos, sombras duras, bloques de color plano que giran y tipografía mono. Crudo y de alto contraste.",
    traits: ["Bordes y sombras duras", "Bloques de color", "Mono"],
    mode: "claro",
    fonts: `${GF}Space+Mono:wght@400;700&family=Archivo+Black&display=swap`,
    parts: { navbar: "clasico", footer: "minimo", hero: "izquierda" },
    swatch: ["#f4f4ef", "#ffe600", "#ff6fae", "#111111"],
  },
  {
    id: "campo",
    label: "Campo",
    description: "Formas orgánicas: fotos en arco, ondas, tarjetas escalonadas y serif suave en tonos de tierra y pasto.",
    traits: ["Fotos en arco", "Ondas", "Serif suave"],
    mode: "claro",
    fonts: `${GF}Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito:wght@400;600;700&display=swap`,
    parts: { navbar: "clasico", footer: "completo", hero: "izquierda" },
    swatch: ["#f3ead9", "#fffaf0", "#4d6b3a", "#c2693a"],
  },
] as const;
export type TemplateId = (typeof TEMPLATES)[number]["id"];
export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t])) as Record<TemplateId, (typeof TEMPLATES)[number]>;

export type Parts = {
  navbar?: (typeof NAVBARS)[number]["id"];
  footer?: (typeof FOOTERS)[number]["id"];
  hero?: (typeof HEROES)[number]["id"];
};

// ---- estilo por local del recorrido ----------------------------------------------
export type LocalStyle = { titleFont?: FontId; titleScale?: number; color?: string; accent?: string };

// ---- cintillo, ventana emergente y publicidad --------------------------------------
export type TickerConfig = { on?: boolean; messages?: string[]; speed?: number };
export type PopupConfig = { on?: boolean; title?: string; text?: string; ctaLabel?: string; ctaHref?: string; delay?: number };
export const AD_ZONES = [
  { id: "portada", label: "Banner de portada (imagen con botón)", size: "Imagen ancha (1920×700 aprox.). Se ve arriba del inicio y el botón lleva al enlace." },
  { id: "top", label: "Bajo el encabezado", size: "Banner ancho (1200×150 aprox.)" },
  { id: "mid", label: "Entre secciones del inicio", size: "Banner ancho (1200×200 aprox.)" },
  { id: "bottom", label: "Sobre el pie de página", size: "Banner ancho (1200×150 aprox.)" },
] as const;
export type AdZoneId = (typeof AD_ZONES)[number]["id"];
export type AdConfig = { on?: boolean; image?: string; href?: string; alt?: string; label?: string; /** Texto de la sección del banner (solo «Banner de portada») */ titulo?: string; subtitulo?: string; texto?: string; boton1?: string; enlace1?: string; boton2?: string; enlace2?: string; /** % del ancho (por defecto 100) */ width?: number; /** alto fijo en px (vacío = automático) */ height?: number };

// ---- edición de cualquier elemento de cualquier página --------------------------------
// La clave es «ruta::selector» (la ruta es «*» para todo el sitio). El selector lo calcula el editor al hacer clic en la vista previa.
export type ElementEdit = { text?: string; image?: string; href?: string; bg?: string; color?: string; scale?: number; hidden?: boolean };

export type DesignConfig = {
  v: 1;
  template?: TemplateId;
  regions: Partial<Record<RegionId, RegionStyle>>;
  parts: Parts;
  order: string[];
  locals: Record<string, LocalStyle>;
  ticker: TickerConfig;
  popup: PopupConfig;
  ads: Partial<Record<AdZoneId, AdConfig>>;
  /** Banners adicionales del hero de la portada: se alternan con el banner de portada. */
  banners?: AdConfig[];
  elements: Record<string, ElementEdit>;
};

export const EMPTY_DESIGN: DesignConfig = { v: 1, regions: {}, parts: {}, order: [], locals: {}, ticker: {}, popup: {}, ads: {}, elements: {} };

export const ELEMENT_KEY_SEP = "::";
const PATH_OK = /^(\*|\/[A-Za-z0-9_\-/.]{0,120})$/;
// Solo caracteres de selector inofensivos: nada que pueda cerrar la regla CSS o la etiqueta <style>.
const SELECTOR_OK = /^[A-Za-z0-9_\-.#:>()[\]="' *~+]{1,240}$/;
const URL_OK = /^[^"'()\s<>\\]+$/;
export const elementKey = (path: string, selector: string) => `${path}${ELEMENT_KEY_SEP}${selector}`;
export function splitElementKey(key: string): { path: string; selector: string } | null {
  const i = key.indexOf(ELEMENT_KEY_SEP);
  if (i < 0) return null;
  const path = key.slice(0, i);
  const selector = key.slice(i + ELEMENT_KEY_SEP.length);
  return PATH_OK.test(path) && SELECTOR_OK.test(selector) ? { path, selector } : null;
}

// ---- validación -----------------------------------------------------------------------
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9-]{1,40}$/;

// Id estable de un elemento del menú principal (para ordenarlo desde Diseño).
export function navId(label: string): string {
  return label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
}

// Ordena el menú según el orden guardado en el diseño; lo que no esté en la lista conserva su posición al final.
export function sortNav<T extends { label: string }>(items: T[], order: string[]): T[] {
  const rank = (x: T) => { const i = order.indexOf(navId(x.label)); return i === -1 ? 999 : i; };
  return items.map((x, i) => ({ x, i })).sort((a, b) => rank(a.x) - rank(b.x) || a.i - b.i).map((o) => o.x);
}
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n * 100) / 100)) : undefined;
};
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "");
const hex = (v: unknown) => (typeof v === "string" && HEX.test(v) ? v.toLowerCase() : undefined);
const font = (v: unknown) => (FONTS.some((f) => f.value === v) ? (v as FontId) : undefined);
const href = (v: unknown) => {
  const s = str(v, 300);
  return /^(\/(?!\/)|https:\/\/)/.test(s) ? s : "";
};

export function sanitizeRegion(raw: unknown): RegionStyle {
  const r = obj(raw);
  const out: RegionStyle = {};
  for (const k of ["bg", "fg", "accent"] as const) {
    const v = hex(r[k]);
    if (v) out[k] = v;
  }
  const f = font(r.titleFont);
  if (f) out.titleFont = f;
  const ts = num(r.titleScale, 70, 160);
  if (ts !== undefined && ts !== 100) out.titleScale = ts;
  const xs = num(r.textScale, 80, 140);
  if (xs !== undefined && xs !== 100) out.textScale = xs;
  const py = num(r.padY, 0, 8);
  if (py !== undefined) out.padY = py;
  const mw = num(r.maxWidth, 720, 1920);
  if (mw !== undefined) out.maxWidth = Math.round(mw);
  if (r.hidden === true) out.hidden = true;
  return out;
}

function sanitizeLocal(raw: unknown): LocalStyle {
  const r = obj(raw);
  const out: LocalStyle = {};
  const f = font(r.titleFont);
  if (f) out.titleFont = f;
  const ts = num(r.titleScale, 70, 160);
  if (ts !== undefined && ts !== 100) out.titleScale = ts;
  const c = hex(r.color);
  if (c) out.color = c;
  const a = hex(r.accent);
  if (a) out.accent = a;
  return out;
}

/** Valida cualquier valor guardado: lo desconocido o inválido se descarta, nunca rompe la página. */
export function normalizeDesign(raw: unknown): DesignConfig {
  const src = obj(raw);
  const d: DesignConfig = { v: 1, regions: {}, parts: {}, order: [], locals: {}, ticker: {}, popup: {}, ads: {}, elements: {} };

  const regions = obj(src.regions);
  for (const id of REGION_IDS) {
    const s = sanitizeRegion(regions[id]);
    if (Object.keys(s).length) d.regions[id] = s;
  }

  if (TEMPLATES.some((t) => t.id === src.template)) d.template = src.template as TemplateId;

  const p = obj(src.parts);
  if (NAVBARS.some((n) => n.id === p.navbar) && p.navbar !== "clasico") d.parts.navbar = p.navbar as Parts["navbar"];
  if (FOOTERS.some((n) => n.id === p.footer) && p.footer !== "completo") d.parts.footer = p.footer as Parts["footer"];
  if (HEROES.some((n) => n.id === p.hero) && p.hero !== "izquierda") d.parts.hero = p.hero as Parts["hero"];

  if (Array.isArray(src.order)) {
    const seen = new Set<string>();
    for (const v of src.order.slice(0, 24)) {
      if (typeof v === "string" && ID.test(v) && !seen.has(v)) {
        seen.add(v);
        d.order.push(v);
      }
    }
  }

  const locals = obj(src.locals);
  for (const [k, v] of Object.entries(locals).slice(0, 24)) {
    if (!ID.test(k)) continue;
    const s = sanitizeLocal(v);
    if (Object.keys(s).length) d.locals[k] = s;
  }

  const t = obj(src.ticker);
  const msgs = Array.isArray(t.messages) ? t.messages.map((m) => str(m, 160)).filter(Boolean).slice(0, 12) : [];
  if (t.on === true || msgs.length) {
    d.ticker = { on: t.on === true, messages: msgs, speed: num(t.speed, 1, 10) ?? 5 };
  }

  const po = obj(src.popup);
  const title = str(po.title, 90);
  if (po.on === true || title || str(po.text, 400)) {
    d.popup = {
      on: po.on === true,
      title,
      text: str(po.text, 400),
      ctaLabel: str(po.ctaLabel, 40),
      ctaHref: href(po.ctaHref),
      delay: num(po.delay, 0, 60) ?? 3,
    };
  }

  const ads = obj(src.ads);
  for (const z of AD_ZONES) {
    const a = obj(ads[z.id]);
    const image = href(a.image);
    if (a.on === true || image) d.ads[z.id] = { on: a.on === true, image, href: href(a.href), alt: str(a.alt, 120), label: str(a.label, 40), titulo: str(a.titulo, 120), subtitulo: str(a.subtitulo, 160), texto: str(a.texto, 400), boton1: str(a.boton1, 50), enlace1: href(a.enlace1), boton2: str(a.boton2, 50), enlace2: href(a.enlace2), ...(Number(a.width) >= 20 && Number(a.width) < 100 ? { width: Math.round(Number(a.width)) } : {}), ...(Number(a.height) >= 80 ? { height: Math.min(1200, Math.round(Number(a.height))) } : {}) };
  }

  if (Array.isArray(src.banners)) {
    const lista: AdConfig[] = [];
    for (const raw of src.banners.slice(0, 8)) {
      const a = obj(raw);
      const image = href(a.image);
      if (!image) continue;
      lista.push({ on: a.on !== false, image, href: href(a.href), alt: str(a.alt, 120), label: str(a.label, 40) });
    }
    if (lista.length) d.banners = lista;
  }

  const els = obj(src.elements);
  for (const [k, v] of Object.entries(els).slice(0, 300)) {
    if (!splitElementKey(k)) continue;
    const e = obj(v);
    const out: ElementEdit = {};
    const text = typeof e.text === "string" ? e.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 3000) : undefined;
    if (text !== undefined) out.text = text;
    const image = href(e.image);
    if (image && URL_OK.test(image)) out.image = image;
    const link = href(e.href);
    if (link) out.href = link;
    const bg = hex(e.bg);
    if (bg) out.bg = bg;
    const color = hex(e.color);
    if (color) out.color = color;
    const sc = num(e.scale, 40, 250);
    if (sc !== undefined && sc !== 100) out.scale = sc;
    if (e.hidden === true) out.hidden = true;
    if (Object.keys(out).length) d.elements[k] = out;
  }
  return d;
}

export function isEmptyDesign(d: DesignConfig) {
  return JSON.stringify(normalizeDesign(d)) === JSON.stringify(EMPTY_DESIGN);
}

const SEL = (id: RegionId) => `[data-region="${id}"]`;
const rgb = (h: string) => `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`;

/** CSS acotado por región y por local; todos los valores ya pasaron por la validación. */
export function designCss(design: DesignConfig): string {
  const rules: string[] = [];
  for (const id of REGION_IDS) {
    const s = design.regions[id];
    if (!s) continue;
    const sel = SEL(id);
    if (s.hidden) {
      rules.push(`${sel}{display:none !important}`);
      continue;
    }
    const decl: string[] = [];
    if (s.bg) decl.push(`--bg:${s.bg}`, `--surface-solid:${s.bg}`, `background-color:${s.bg} !important`);
    if (s.fg) decl.push(`--text:${s.fg}`, `color:${s.fg}`);
    if (s.accent) decl.push(`--accent:${s.accent}`, `--fg-lime-500:${s.accent}`, `--fg-lime-400:${s.accent}`, `--link:${s.accent}`);
    if (s.padY !== undefined) decl.push(`padding-block:${s.padY}rem !important`);
    if (decl.length) rules.push(`${sel}{${decl.join(";")}}`);
    if (s.maxWidth) rules.push(`${sel} [class*="max-w-[86rem]"]{max-width:${s.maxWidth}px !important}`);
    if (s.titleFont) {
      const css = FONTS.find((f) => f.value === s.titleFont)!.css;
      rules.push(`${sel} :is(h1,h2,h3,h4){font-family:${css} !important}`);
    }
    if (s.titleScale) rules.push(`${sel} :is(h1,h2,h3){zoom:${s.titleScale / 100}}`);
    if (s.textScale) rules.push(`${sel} :is(p,li,label,a,button){zoom:${s.textScale / 100}}`);
  }
  for (const [id, l] of Object.entries(design.locals)) {
    const sel = `[data-local="${id}"]`;
    if (l.accent) rules.push(`${sel}{--acc:${rgb(l.accent)} !important}`);
    const t: string[] = [];
    if (l.titleFont) t.push(`font-family:${FONTS.find((f) => f.value === l.titleFont)!.css} !important`);
    if (l.titleScale) t.push(`zoom:${l.titleScale / 100}`);
    if (l.color) t.push(`color:${l.color} !important`);
    if (t.length) rules.push(`${sel} .sw-title{${t.join(";")}}`);
  }
  return rules.join("\n");
}
