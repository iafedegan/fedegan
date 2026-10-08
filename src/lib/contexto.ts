import "server-only";
import { featuredNews } from "@/content/site";

export type Noticia = {
  slug: string;
  section: string;
  date: string;
  title: string;
  dek: string;
  author: string;
  image: string | null;
  imageAlt: string | null;
  bodyHtml: string | null;
  body: string[] | null;
};

type ApiArticulo = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  categoria: string | null;
  autor: string | null;
  publicadoEn: string | null;
};

type ApiArticuloDetalle = ApiArticulo & { body: string; coverImageAlt: string | null };

const BASE = process.env.CONTEXTO_API_URL;
const KEY = process.env.CONTEXTO_API_KEY;
const REVALIDATE_SECONDS = 300;

const formatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });

function formatDate(iso: string | null) {
  return iso ? formatter.format(new Date(iso)) : "";
}

function fromApi(a: ApiArticulo): Noticia {
  return {
    slug: a.slug,
    section: a.categoria ?? "Noticias",
    date: formatDate(a.publicadoEn),
    title: a.title,
    dek: a.excerpt,
    author: a.autor ?? "Redacción CONtexto Ganadero",
    image: a.coverImageUrl,
    imageAlt: null,
    bodyHtml: null,
    body: null,
  };
}

const fallback: Noticia[] = featuredNews.map((n) => ({
  slug: n.slug,
  section: n.section,
  date: n.date,
  title: n.title,
  dek: n.dek,
  author: n.author,
  image: null,
  imageAlt: null,
  bodyHtml: null,
  body: n.body ?? null,
}));

async function api<T>(path: string): Promise<T | null> {
  if (!BASE || !KEY) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getNoticias(limit = 12): Promise<{ items: Noticia[]; live: boolean }> {
  const data = await api<{ items: ApiArticulo[] }>(`/articulos?limite=${limit}`);
  if (data?.items?.length) return { items: data.items.map(fromApi), live: true };
  return { items: fallback.slice(0, limit), live: false };
}

export async function getNoticia(slug: string): Promise<Noticia | null> {
  const data = await api<ApiArticuloDetalle>(`/articulos/${encodeURIComponent(slug)}`);
  if (data) return { ...fromApi(data), bodyHtml: data.body, imageAlt: data.coverImageAlt };
  return fallback.find((n) => n.slug === slug) ?? null;
}
