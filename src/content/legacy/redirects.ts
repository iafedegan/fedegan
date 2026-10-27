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

export function buildLegacyRedirects(data: LegacyData, served: ReadonlySet<string>): Redirect[] {
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
  return out;
}
