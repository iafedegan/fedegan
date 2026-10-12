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
  { id: "top", label: "Bajo el encabezado", size: "Banner ancho (1200×150 aprox.)" },
  { id: "mid", label: "Entre secciones del inicio", size: "Banner ancho (1200×200 aprox.)" },
  { id: "bottom", label: "Sobre el pie de página", size: "Banner ancho (1200×150 aprox.)" },
] as const;
export type AdZoneId = (typeof AD_ZONES)[number]["id"];
export type AdConfig = { on?: boolean; image?: string; href?: string; alt?: string };

export type DesignConfig = {
  v: 1;
  regions: Partial<Record<RegionId, RegionStyle>>;
  parts: Parts;
  order: string[];
  locals: Record<string, LocalStyle>;
  ticker: TickerConfig;
  popup: PopupConfig;
  ads: Partial<Record<AdZoneId, AdConfig>>;
};

export const EMPTY_DESIGN: DesignConfig = { v: 1, regions: {}, parts: {}, order: [], locals: {}, ticker: {}, popup: {}, ads: {} };

// ---- validación -----------------------------------------------------------------------
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9-]{1,40}$/;
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
  const d: DesignConfig = { v: 1, regions: {}, parts: {}, order: [], locals: {}, ticker: {}, popup: {}, ads: {} };

  const regions = obj(src.regions);
  for (const id of REGION_IDS) {
    const s = sanitizeRegion(regions[id]);
    if (Object.keys(s).length) d.regions[id] = s;
  }

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
    if (a.on === true || image) d.ads[z.id] = { on: a.on === true, image, href: href(a.href), alt: str(a.alt, 120) };
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
