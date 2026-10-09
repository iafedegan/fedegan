import "server-only";
import { cache } from "react";

// Cliente de la API pública de CONtexto Ganadero (solo lectura).
// Documentación: https://contexto-olive.vercel.app/api-docs
// La clave vive solo en el servidor (CONTEXTO_API_KEY); nunca se envía al navegador.

const BASE = process.env.CONTEXTO_API_URL;
const KEY = process.env.CONTEXTO_API_KEY;
const REVALIDATE_SECONDS = 300;

export const contextoConfigured = Boolean(BASE && KEY);

type ApiUbicacion = {
  portada?: { esta: boolean; zona: string | null; posicion: number | null; fijadaPorEditor: boolean };
  seccion?: { slug: string; nombre: string; padre: { slug: string; nombre: string } | null } | null;
  ultimaHora?: { marcada: boolean; enBarra: boolean };
  enVivo?: boolean;
  masLeidas?: { esta: boolean; posicion: number | null };
};

type ApiArticulo = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  categoria: string | null;
  autor: string | null;
  publicadoEn: string | null;
  actualizadoEn: string;
  ubicacion?: ApiUbicacion;
};

type ApiArticuloDetalle = ApiArticulo & {
  body: string;
  coverImageAlt: string | null;
  etiquetas?: string[];
};

type ApiCategoria = { slug: string; nombre: string; descripcion: string | null; categoriaPadre: string | null };

export type Noticia = {
  slug: string;
  title: string;
  dek: string;
  image: string | null;
  imageAlt: string | null;
  section: string;
  sectionSlug: string | null;
  author: string;
  date: string;
  publishedAt: string | null;
  updatedAt: string | null;
  ultimaHora: boolean;
  enVivo: boolean;
  tags: string[];
  bodyHtml: string | null;
};

export type Seccion = { slug: string; nombre: string };

// El panel de CONtexto firma con usuarios genéricos (p. ej. «Administrador»); en el portal se muestra la redacción.
const GENERIC_AUTHOR = /^(admin(istrador)?|editor|usuario|redacci[oó]n)$/i;

const formatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });

function formatDate(iso: string | null) {
  return iso ? formatter.format(new Date(iso)) : "";
}

// Las portadas pueden venir como ruta relativa (/fotos/...) respecto al dominio de la API.
function absoluteUrl(url: string | null) {
  if (!url || !url.startsWith("/") || !BASE) return url;
  return new URL(url, BASE).toString();
}

function fromApi(a: ApiArticulo): Noticia {
  const u = a.ubicacion;
  return {
    slug: a.slug,
    title: a.title,
    dek: a.excerpt,
    image: absoluteUrl(a.coverImageUrl),
    imageAlt: null,
    section: u?.seccion?.nombre ?? a.categoria ?? "Noticias",
    sectionSlug: u?.seccion?.slug ?? null,
    author: a.autor && !GENERIC_AUTHOR.test(a.autor.trim()) ? a.autor : "Redacción CONtexto Ganadero",
    date: formatDate(a.publicadoEn),
    publishedAt: a.publicadoEn,
    updatedAt: a.actualizadoEn ?? null,
    ultimaHora: Boolean(u?.ultimaHora?.marcada),
    enVivo: Boolean(u?.enVivo),
    tags: [],
    bodyHtml: null,
  };
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number | null };

// Última respuesta buena por ruta: si la API falla un momento (429, 5xx, red) se sigue mostrando lo último que llegó.
const lastGood = new Map<string, unknown>();

async function api<T>(path: string): Promise<ApiResult<T>> {
  if (!BASE || !KEY) return { ok: false, status: null };
  const route = path.split("?")[0];
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.ok) {
      const data = (await res.json()) as T;
      lastGood.set(path, data);
      return { ok: true, data };
    }
    if (res.status !== 404) console.error(`[contexto] respuesta ${res.status} en ${route}`);
    const stale = lastGood.get(path);
    if (stale && res.status !== 404) return { ok: true, data: stale as T };
    return { ok: false, status: res.status };
  } catch {
    console.error(`[contexto] sin conexión con la API en ${route}`);
    const stale = lastGood.get(path);
    if (stale) return { ok: true, data: stale as T };
    return { ok: false, status: null };
  }
}

/** Notas que hoy están en la portada de CONtexto, en el orden de la portada. */
export async function getPortada(): Promise<Noticia[]> {
  const r = await api<{ items: ApiArticulo[] }>("/articulos?portada=1");
  return r.ok ? r.data.items.map(fromApi) : [];
}

/** Notas publicadas, de la más reciente a la más antigua, con paginación por cursor. */
export async function getNoticias(opts: { limit?: number; categoria?: string; cursor?: string } = {}) {
  const { limit = 12, categoria, cursor } = opts;
  const qs = new URLSearchParams({ limite: String(Math.min(Math.max(limit, 1), 50)) });
  if (categoria) qs.set("categoria", categoria);
  if (cursor) qs.set("cursor", cursor);
  const r = await api<{ items: ApiArticulo[]; siguienteCursor: string | null }>(`/articulos?${qs}`);
  if (!r.ok) return { ok: false as const, items: [] as Noticia[], nextCursor: null as string | null };
  return { ok: true as const, items: r.data.items.map(fromApi), nextCursor: r.data.siguienteCursor ?? null };
}

export async function getNoticia(slug: string): Promise<Noticia | null> {
  const r = await api<ApiArticuloDetalle>(`/articulos/${encodeURIComponent(slug)}`);
  if (!r.ok) return null;
  return { ...fromApi(r.data), imageAlt: r.data.coverImageAlt, tags: r.data.etiquetas ?? [], bodyHtml: r.data.body };
}

/** Secciones principales (las que no cuelgan de otra) para filtrar el listado. */
export async function getSecciones(): Promise<Seccion[]> {
  const r = await api<{ items: ApiCategoria[] }>("/categorias");
  if (!r.ok) return [];
  return r.data.items.filter((c) => !c.categoriaPadre).map((c) => ({ slug: c.slug, nombre: c.nombre }));
}

/**
 * Noticias de la home: el carrusel es la portada de CONtexto tal cual (hasta 5);
 * solo si la portada está vacía se usan las últimas con imagen. El resto son las últimas notas que no están en el carrusel.
 */
export const getHomeNews = cache(async () => {
  const [portada, latest] = await Promise.all([getPortada(), getNoticias({ limit: 12 })]);
  const carousel = portada.length
    ? portada.slice(0, 5)
    : [...latest.items].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).slice(0, 5);
  const used = new Set(carousel.map((n) => n.slug));
  return {
    carousel,
    latest: latest.items.filter((n) => !used.has(n.slug)).slice(0, 6),
    available: carousel.length > 0 || latest.items.length > 0,
  };
});
