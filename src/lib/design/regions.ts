// Motor de ajustes de diseño: tipos, validación y generación de CSS.
// Es puro (sin acceso a datos) para poder usarlo en el servidor y en la vista previa del editor.

export const REGION_IDS = ["navbar", "hero", "body", "footer"] as const;
export type RegionId = (typeof REGION_IDS)[number];

export const REGIONS: { id: RegionId; label: string; hint: string; controls: (keyof RegionStyle)[] }[] = [
  { id: "navbar", label: "Encabezado y menú", hint: "Logo, buscador y menú principal.", controls: ["bg", "fg", "accent", "titleFont", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "hero", label: "Recorrido de portada", hint: "El recorrido a pantalla completa del inicio.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth", "hidden"] },
  { id: "body", label: "Cuerpo de las páginas", hint: "Noticias, directorio, secciones y demás contenido.", controls: ["bg", "fg", "accent", "titleFont", "titleScale", "textScale", "padY", "maxWidth"] },
  { id: "footer", label: "Pie de página", hint: "Enlaces, contacto y boletín.", controls: ["bg", "fg", "accent", "titleFont", "textScale", "padY", "maxWidth", "hidden"] },
];

export const FONTS = [
  { value: "display", label: "Serif elegante (Playfair)", css: "var(--font-display)" },
  { value: "body", label: "Sans de lectura (Inter Tight)", css: "var(--font-body)" },
  { value: "georgia", label: "Serif clásica (Georgia)", css: "Georgia, 'Times New Roman', serif" },
  { value: "system", label: "Sistema", css: "system-ui, 'Segoe UI', sans-serif" },
] as const;

export type RegionStyle = {
  bg?: string; // #rrggbb
  fg?: string;
  accent?: string;
  titleFont?: (typeof FONTS)[number]["value"];
  titleScale?: number; // %
  textScale?: number; // %
  padY?: number; // rem
  maxWidth?: number; // px
  hidden?: boolean;
};

export type DesignConfig = { v: 1; regions: Partial<Record<RegionId, RegionStyle>> };

export const EMPTY_DESIGN: DesignConfig = { v: 1, regions: {} };

const HEX = /^#[0-9a-f]{6}$/i;
const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n * 100) / 100)) : undefined;
};

export function sanitizeRegion(raw: unknown): RegionStyle {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: RegionStyle = {};
  for (const k of ["bg", "fg", "accent"] as const) {
    const v = r[k];
    if (typeof v === "string" && HEX.test(v)) out[k] = v.toLowerCase();
  }
  if (typeof r.titleFont === "string" && FONTS.some((f) => f.value === r.titleFont)) out.titleFont = r.titleFont as RegionStyle["titleFont"];
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

/** Valida cualquier valor guardado: lo desconocido o inválido se descarta, nunca rompe la página. */
export function normalizeDesign(raw: unknown): DesignConfig {
  const regions: DesignConfig["regions"] = {};
  const src = raw && typeof raw === "object" ? ((raw as { regions?: unknown }).regions as Record<string, unknown> | undefined) : undefined;
  if (src && typeof src === "object") {
    for (const id of REGION_IDS) {
      const s = sanitizeRegion(src[id]);
      if (Object.keys(s).length) regions[id] = s;
    }
  }
  return { v: 1, regions };
}

export function isEmptyDesign(d: DesignConfig) {
  return Object.keys(d.regions).length === 0;
}

const SEL = (id: RegionId) => `[data-region="${id}"]`;

/** CSS acotado por región; todos los valores ya pasaron por sanitizeRegion. */
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
  return rules.join("\n");
}
