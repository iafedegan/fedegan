import { featuredNews, publications, events } from "@/content/site";

export type SearchResult = {
  title: string;
  excerpt: string;
  href: string;
  type: "Noticia" | "Publicación" | "Evento" | "Página";
};

const staticPages: SearchResult[] = [
  { title: "Quiénes somos", excerpt: "Misión, visión y valores de FEDEGÁN–FNG.", href: "/quienes-somos", type: "Página" },
  { title: "Programas", excerpt: "Programas y proyectos del gremio ganadero.", href: "/programas", type: "Página" },
  { title: "Normatividad", excerpt: "Leyes, decretos y resoluciones del sector.", href: "/normatividad", type: "Página" },
  { title: "Servicios en línea", excerpt: "Trámites, PQRS, RUV y recaudo biológico.", href: "/servicios", type: "Página" },
  { title: "Preguntas frecuentes", excerpt: "Dudas comunes sobre trámites y servicios.", href: "/preguntas-frecuentes", type: "Página" },
  { title: "Contacto", excerpt: "Canales de atención y formulario de contacto.", href: "/contacto", type: "Página" },
];

export function buildSearchIndex(): SearchResult[] {
  return [
    ...featuredNews.map((n) => ({ title: n.title, excerpt: n.dek, href: `/noticias/${n.slug}`, type: "Noticia" as const })),
    ...publications.map((p) => ({ title: p.title, excerpt: p.dek, href: `/publicaciones/${p.slug}`, type: "Publicación" as const })),
    ...events.map((e) => ({ title: e.title, excerpt: `${e.kind} · ${e.place}`, href: `/eventos/${e.slug}`, type: "Evento" as const })),
    ...staticPages,
  ];
}

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildSearchIndex().filter(
    (r) => r.title.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q)
  );
}
