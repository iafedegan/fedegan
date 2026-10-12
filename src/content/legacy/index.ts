import raw from "./portal.json";

// Texto copiado del portal actual (fedegan.org.co) para las secciones Programas, Normatividad,
// Publicaciones, Cifras del sector, FNG, FEP y Sistema Integrado de Gestión.
// Se generó con una copia única; el contenido nuevo se gestiona en el CMS.

export type LegacyBlock = { t: string; text?: string; rows?: string[][] };
export type NavNode = { label: string; key?: string; href?: string; children?: NavNode[] };
export type LegacyPage = { title: string; source: string; blocks: LegacyBlock[]; sections: string[]; parent?: string };
export type LegacySection = { label: string; landing: string; tree: NavNode[] };

const data = raw as unknown as { sections: Record<string, LegacySection>; pages: Record<string, LegacyPage> };

export const legacySections = data.sections;
export const legacySlugs = Object.keys(data.sections);

export function getLegacySection(slug: string): LegacySection | null {
  return data.sections[slug] ?? null;
}

export function getLegacyPage(key: string): LegacyPage | null {
  return data.pages[key] ?? null;
}

/** Ruta pública de una página dentro de una sección. */
export function legacyHref(slug: string, key: string): string {
  const s = data.sections[slug];
  return s && s.landing === key ? `/seccion/${slug}` : `/seccion/${slug}/${key}`;
}

/** Camino de nodos del menú hasta la página (para migas de pan y el menú lateral). */
export function findTrail(tree: NavNode[], key: string): NavNode[] | null {
  for (const n of tree) {
    if (n.key === key) return [n];
    if (n.children) {
      const inner = findTrail(n.children, key);
      if (inner) return [n, ...inner];
    }
  }
  return null;
}

/** Todas las rutas estáticas (sección + ruta de la página) para generateStaticParams. */
export function legacyParams(): { slug: string; ruta: string[] }[] {
  const out: { slug: string; ruta: string[] }[] = [];
  for (const [key, page] of Object.entries(data.pages)) {
    for (const slug of page.sections) {
      out.push({ slug, ruta: data.sections[slug].landing === key ? [] : key.split("/") });
    }
  }
  return out;
}

/** Primer párrafo útil de la página, para resúmenes y buscador. */
export function excerptOf(page: LegacyPage, max = 180): string {
  const p = page.blocks.find((b) => b.t === "p" && (b.text ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").length > 40);
  const text = (p?.text ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function allLegacyPages(): { key: string; page: LegacyPage; slug: string }[] {
  return Object.entries(data.pages)
    .filter(([, p]) => p.sections.length > 0)
    .map(([key, page]) => ({ key, page, slug: page.sections[0] }));
}
