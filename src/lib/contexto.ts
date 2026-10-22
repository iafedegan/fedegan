import "server-only";
import { cache } from "react";
import { getStoredSecret } from "@/lib/cms/integrations";

// Cliente de la API pública de CONtexto Ganadero (solo lectura).
// Documentación: https://contexto-olive.vercel.app/api-docs
// La clave vive solo en el servidor (CONTEXTO_API_KEY); nunca se envía al navegador.

const DEFAULT_BASE = "https://contexto-olive.vercel.app/api/v1";
const BASE = process.env.CONTEXTO_API_URL ?? DEFAULT_BASE;
const ENV_KEY = process.env.CONTEXTO_API_KEY;
const REVALIDATE_SECONDS = 300;

/** La clave guardada desde el panel (/admin/apis) tiene prioridad sobre la variable de entorno. */
export async function contextoCredentials(): Promise<{ base: string; key: string | undefined; source: "panel" | "env" | "none" }> {
  const stored = await getStoredSecret("contexto");
  if (stored) return { base: BASE, key: stored, source: "panel" };
  if (ENV_KEY) return { base: BASE, key: ENV_KEY, source: "env" };
  return { base: BASE, key: undefined, source: "none" };
}

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

async function call(base: string, key: string, path: string) {
  return fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
}

async function api<T>(path: string): Promise<ApiResult<T>> {
  const { base, key } = await contextoCredentials();
  if (!key) return { ok: false, status: null };
  const route = path.split("?")[0];
  try {
    let res = await call(base, key, path);
    // Si la clave guardada en el panel quedó vieja y la de las variables de entorno es otra, se prueba con esa.
    if (res.status === 401 && ENV_KEY && ENV_KEY !== key) res = await call(base, ENV_KEY, path);
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

// La API filtra por la categoría exacta de cada nota; una sección con subcategorías (p. ej. TV → Video) no devuelve
// nada si se pide por su nombre. Estas son las subcategorías de cada sección principal de CONtexto.
const HIJAS: Record<string, string[]> = {
  ganaderia: ["sostenible", "produccion", "sistemas-silvopastoriles", "nutricion", "salud-animal", "razas"],
  "sistemas-pecuarios": ["porcicola", "equino", "avicola", "ovino-caprino", "otros-sistemas-pecuarios"],
  colombia: ["politica", "gremialidad", "regiones", "seguridad"],
  economia: ["nacional", "internacional", "precio-del-ganado", "agricultura", "agroindustria"],
  mundo: ["argentina", "eeuu", "espana", "mexico", "peru", "otros-mundo"],
  tendencias: ["medioambiente", "gastronomia", "innovacion", "mascotas", "redes-sociales"],
  opinion: ["columnas", "editorial", "blogs", "columnistas"],
  agenda: ["congresos", "ferias", "tauromaquia", "otros-eventos"],
  especiales: ["cronica", "reportaje", "informes", "gobierno-petro", "galeria"],
  tv: ["video"],
  radio: ["audio"],
};

/** Notas publicadas, de la más reciente a la más antigua, con paginación por cursor. */
export async function getNoticias(opts: { limit?: number; categoria?: string; cursor?: string } = {}) {
  const { limit = 12, categoria, cursor } = opts;
  const size = Math.min(Math.max(limit, 1), 50);
  const page = async (cat?: string, cur?: string) => {
    const qs = new URLSearchParams({ limite: String(size) });
    if (cat) qs.set("categoria", cat);
    if (cur) qs.set("cursor", cur);
    return api<{ items: ApiArticulo[]; siguienteCursor: string | null }>(`/articulos?${qs}`);
  };

  const hijas = categoria ? HIJAS[categoria] : undefined;
  if (categoria && hijas) {
    // Sección con subcategorías: se juntan las notas de la sección y de cada subcategoría, de la más reciente a la más antigua.
    const results = await Promise.all([categoria, ...hijas].map((c) => page(c)));
    if (!results.some((r) => r.ok)) return { ok: false as const, items: [] as Noticia[], nextCursor: null as string | null };
    const seen = new Set<string>();
    const items = results
      .flatMap((r) => (r.ok ? r.data.items.map(fromApi) : []))
      .filter((n) => (seen.has(n.slug) ? false : (seen.add(n.slug), true)))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, size);
    return { ok: true as const, items, nextCursor: null as string | null };
  }

  const r = await page(categoria, cursor);
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
