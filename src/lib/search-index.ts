import type { Evento, Publication } from "@/lib/cms/content";

export type SearchResult = {
  title: string;
  excerpt: string;
  href: string;
  type: "Noticia" | "Publicación" | "Evento" | "Página";
};

const staticPages: SearchResult[] = [
  { title: "Quiénes somos", excerpt: "Misión, visión y valores de FEDEGÁN–FNG.", href: "/quienes-somos", type: "Página" },
  { title: "Programas", excerpt: "Programas y proyectos del gremio ganadero.", href: "/seccion/programas", type: "Página" },
  { title: "Normatividad", excerpt: "Leyes, decretos y resoluciones del sector.", href: "/seccion/normatividad", type: "Página" },
  { title: "Servicios en línea", excerpt: "Trámites, PQRS, RUV y recaudo biológico.", href: "/servicios", type: "Página" },
  { title: "Preguntas frecuentes", excerpt: "Dudas comunes sobre trámites y servicios.", href: "/preguntas-frecuentes", type: "Página" },
  { title: "Contacto", excerpt: "Canales de atención y formulario de contacto.", href: "/contacto", type: "Página" },
];

export function buildSearchIndex(
  news: { slug: string; title: string; dek: string }[],
  publications: Publication[],
  events: Evento[],
  extra: SearchResult[] = [],
): SearchResult[] {
  return [
    ...news.map((n) => ({ title: n.title, excerpt: n.dek, href: `/noticias/${n.slug}`, type: "Noticia" as const })),
    ...publications.map((p) => ({ title: p.title, excerpt: p.dek, href: `/publicaciones/${p.slug}`, type: "Publicación" as const })),
    ...events.map((e) => ({ title: e.title, excerpt: `${e.kind} · ${e.place}`, href: `/eventos/${e.slug}`, type: "Evento" as const })),
    ...staticPages,
    ...extra,
  ];
}

// Minúsculas y sin tildes, para que «ganaderia» encuentre «ganadería».
function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const PESO_TIPO: Record<SearchResult["type"], number> = { Página: 3, Noticia: 2, Publicación: 2, Evento: 1 };

// Relevancia: cada palabra de la consulta debe aparecer (título o resumen). El título pesa más, más aún si la
// coincidencia es de palabra completa o al inicio; la frase exacta suma, y a igual puntaje gana el tipo de contenido.
export function search(index: SearchResult[], query: string): SearchResult[] {
  const q = normalizar(query).trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { r: SearchResult; score: number }[] = [];
  for (const r of index) {
    const title = normalizar(r.title);
    const excerpt = normalizar(r.excerpt);
    let score = 0;
    let all = true;
    for (const t of terms) {
      const inTitle = title.indexOf(t);
      const inExcerpt = excerpt.indexOf(t);
      if (inTitle < 0 && inExcerpt < 0) {
        all = false;
        break;
      }
      if (inTitle >= 0) {
        score += 10;
        if (inTitle === 0 || title[inTitle - 1] === " ") score += 5;
        if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(title)) score += 3;
      }
      if (inExcerpt >= 0) score += 3;
    }
    if (!all) continue;
    if (title.includes(q)) score += 15;
    else if (excerpt.includes(q)) score += 5;
    scored.push({ r, score: score + PESO_TIPO[r.type] });
  }
  return scored.sort((a, b) => b.score - a.score).map((x) => x.r);
}
