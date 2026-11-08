import { readdirSync } from "node:fs";
import { join } from "node:path";

// Tabla de equivalencias de URLs (TDR §5.3): cada página migrada del portal actual (fedegan.org.co)
// redirige con 301 a su nueva ruta. Se genera a partir de la misma copia (portal.json), así que
// cualquier página migrada queda cubierta sin mantener la lista a mano.

type LegacyData = {
  sections: Record<string, { landing: string }>;
  pages: Record<string, { source: string; sections: string[] }>;
};

// statusCode 301 (en lugar de `permanent`, que Next resuelve como 308) para cumplir literalmente el TDR.
export type Redirect = { source: string; destination: string; statusCode: 301 };

// Caracteres con significado especial en las reglas de redirección de Next (path-to-regexp).
const SPECIAL = /[:()*?+{}[\]]/;

/** Rutas estáticas que el portal nuevo sirve por sí mismo (esas no se redirigen para no pisarlas). */
export function servedPaths(appDir: string): Set<string> {
  const served = new Set<string>();
  const walk = (dir: string, segs: string[]) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      if (!segs.some((s) => s.startsWith("["))) served.add(segs.length ? `/${segs.join("/")}` : "/");
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const isGroup = e.name.startsWith("(") && e.name.endsWith(")");
      walk(join(dir, e.name), isGroup ? segs : [...segs, e.name]);
    }
  };
  walk(appDir, []);
  return served;
}

function pathOf(source: string): string | null {
  try {
    const p = decodeURI(new URL(source).pathname).replace(/\/+$/, "");
    return p || null;
  } catch {
    return null;
  }
}

/** Nueva ruta pública de una página migrada (misma regla que `legacyHref`). */
function destinationOf(data: LegacyData, key: string, slug: string) {
  return data.sections[slug]?.landing === key ? `/seccion/${slug}` : `/seccion/${slug}/${key}`;
}

/** Carpetas con al menos tantas páginas se redirigen con una sola regla (`/<carpeta>/:path+`) en vez de una por página. */
const MIN_GRUPO = 20;

export type OpcionesRedirecciones = {
  /** Reúne en una regla las carpetas grandes (la lista completa pasaría de 1.000 reglas y Next avisa que penaliza el rendimiento). */
  compactar?: boolean;
  /** Carpetas de primer nivel de src/app: nunca se agrupan para no tapar una ruta del portal nuevo. */
  reservadas?: ReadonlySet<string>;
};

export function buildLegacyRedirects(data: LegacyData, served: ReadonlySet<string>, opciones: OpcionesRedirecciones = {}): Redirect[] {
  const seen = new Set<string>();
  const out: Redirect[] = [];
  for (const [key, page] of Object.entries(data.pages)) {
    const slug = page.sections[0];
    const source = pathOf(page.source);
    if (!slug || !source || served.has(source) || SPECIAL.test(source) || /[^\x00-\x7f%]/.test(source)) continue;
    const destination = destinationOf(data, key, slug);
    if (source === destination || seen.has(source)) continue;
    seen.add(source);
    out.push({ source, destination, statusCode: 301 });
  }
  return opciones.compactar ? compactar(out, served, opciones.reservadas ?? new Set()) : out;
}

/**
 * Una carpeta se agrupa solo si TODAS sus páginas van a la misma sección y su clave es la propia ruta antigua
 * (`/carpeta/x` → `/seccion/<sección>/carpeta/x`): así la regla única da el mismo destino que las individuales.
 */
function compactar(reglas: Redirect[], served: ReadonlySet<string>, reservadas: ReadonlySet<string>): Redirect[] {
  const carpetas = new Map<string, { slug: string; n: number; valida: boolean }>();
  for (const r of reglas) {
    const partes = r.source.split("/");
    if (partes.length < 3) continue; // «/pagina» (un solo nivel) no es de una carpeta
    const carpeta = partes[1];
    const m = /^\/seccion\/([^/]+)\/(.+)$/.exec(r.destination);
    const g = carpetas.get(carpeta) ?? { slug: m?.[1] ?? "", n: 0, valida: true };
    g.n++;
    if (!m || m[1] !== g.slug || m[2] !== r.source.slice(1)) g.valida = false;
    carpetas.set(carpeta, g);
  }
  const agrupadas = new Map<string, string>();
  for (const [carpeta, g] of carpetas) {
    const tapa = reservadas.has(carpeta) || [...served].some((x) => x === `/${carpeta}` || x.startsWith(`/${carpeta}/`));
    if (g.valida && g.n >= MIN_GRUPO && !tapa) agrupadas.set(carpeta, g.slug);
  }
  const sueltas = reglas.filter((r) => {
    const partes = r.source.split("/");
    return !(partes.length >= 3 && agrupadas.has(partes[1]));
  });
  const grupos: Redirect[] = [...agrupadas].map(([carpeta, slug]) => ({
    source: `/${carpeta}/:path+`,
    destination: `/seccion/${slug}/${carpeta}/:path+`,
    statusCode: 301 as const,
  }));
  return [...sueltas, ...grupos];
}
