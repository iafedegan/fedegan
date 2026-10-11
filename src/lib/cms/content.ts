import "server-only";
import { cache } from "react";
import { publicDb } from "./client";
import * as seed from "@/content/site";
import type { Local, Piso } from "@/content/site";

// Lectura del contenido editable. Si el CMS no está configurado o falla la consulta,
// se usa el contenido de respaldo del código para que el portal nunca quede vacío.

type Row = Record<string, unknown>;
let warned = false;

async function rows(table: string, order: { column: string; ascending?: boolean }): Promise<Row[] | null> {
  const db = publicDb();
  if (!db) {
    if (!warned) {
      warned = true;
      console.warn("[cms] sin configurar (SUPABASE_URL / clave pública): se usa el contenido de respaldo");
    }
    return null;
  }
  try {
    const { data, error } = await db.from(table).select("*").order(order.column, { ascending: order.ascending ?? true });
    if (error) {
      console.error(`[cms] ${table}: ${error.message}`);
      return null;
    }
    return data as Row[];
  } catch (e) {
    console.error(`[cms] ${table}: ${(e as Error).message}`);
    return null;
  }
}

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

// ---------- Locales (directorio / cinta 3D) ----------
export const getLocales = cache(async (): Promise<Local[]> => {
  const data = await rows("locales", { column: "sort_order" });
  if (!data) return seed.pisos.flatMap((p) => p.locales);
  return data.map((r) => ({
    id: str(r.slug),
    numero: str(r.numero),
    nombre: str(r.nombre),
    rubro: str(r.rubro),
    descripcion: str(r.descripcion),
    href: str(r.href),
    icon: str(r.icon, "building"),
    status: r.status === "proximamente" ? "proximamente" : "abierto",
    ancla: Boolean(r.ancla),
    external: Boolean(r.external),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    accent: str(r.accent, "216,181,88"),
    imagen: typeof r.imagen === "string" ? r.imagen : undefined,
    imagenPos: str(r.imagen_pos, "50% 50%"),
  }));
});

export async function getPisos(): Promise<Piso[]> {
  const locales = await getLocales();
  const base = seed.pisos[0];
  return [{ id: base.id, nombre: base.nombre, descripcion: base.descripcion, locales }];
}

// ---------- Cifras ----------
export type Stat = { label: string; value: string; unit: string; delta: string };
export const getStats = cache(async (): Promise<Stat[]> => {
  const data = await rows("stats", { column: "sort_order" });
  if (!data) return seed.stats;
  return data.map((r) => ({ label: str(r.label), value: str(r.value), unit: str(r.unit), delta: str(r.delta) }));
});

// ---------- Publicaciones ----------
export type Publication = { slug: string; type: string; title: string; dek: string; fileUrl?: string; coverImage?: string };
export const getPublications = cache(async (): Promise<Publication[]> => {
  const data = await rows("publications", { column: "sort_order" });
  if (!data) return seed.publications;
  return data.map((r) => ({
    slug: str(r.slug),
    type: str(r.type, "Informe"),
    title: str(r.title),
    dek: str(r.dek),
    fileUrl: typeof r.file_url === "string" && r.file_url ? r.file_url : undefined,
    coverImage: typeof r.cover_image === "string" && r.cover_image ? r.cover_image : undefined,
  }));
});
export async function getPublication(slug: string) {
  return (await getPublications()).find((p) => p.slug === slug) ?? null;
}

// ---------- Eventos ----------
export type Evento = { slug: string; kind: string; title: string; month: string; day: string; startsOn: string; time: string; place: string; description: string };
const eventDescription =
  "Espacio organizado por FEDEGÁN–FNG dirigido a productores, técnicos y aliados del sector ganadero. Cupos limitados; se recomienda inscripción previa.";
export const getEvents = cache(async (): Promise<Evento[]> => {
  const data = await rows("events", { column: "starts_on" });
  if (!data) {
    return seed.events.map((e) => ({ ...e, startsOn: "", description: eventDescription }));
  }
  return data.map((r) => {
    const startsOn = str(r.starts_on);
    const [, m, d] = startsOn.split("-");
    return {
      slug: str(r.slug),
      kind: str(r.kind, "Webinar"),
      title: str(r.title),
      month: MONTHS[Number(m) - 1] ?? "",
      day: d ?? "",
      startsOn,
      time: str(r.time_text),
      place: str(r.place),
      description: str(r.description) || eventDescription,
    };
  });
});
export async function getEvent(slug: string) {
  return (await getEvents()).find((e) => e.slug === slug) ?? null;
}

// ---------- Preguntas frecuentes ----------
export type Faq = { q: string; a: string };
export const getFaqs = cache(async (): Promise<Faq[]> => {
  const data = await rows("faqs", { column: "sort_order" });
  if (!data) return seed.faqs;
  return data.map((r) => ({ q: str(r.question), a: str(r.answer) }));
});

// ---------- Portales aliados ----------
export type Partner = { nombre: string; detalle: string; href: string; logo: string };
export const getPartners = cache(async (): Promise<Partner[]> => {
  const data = await rows("partners", { column: "sort_order" });
  if (!data) return seed.partners;
  return data.map((r) => ({ nombre: str(r.name), detalle: str(r.detail), href: str(r.href), logo: str(r.logo) }));
});

// ---------- Menú principal ----------
export type NavItem = { label: string; href: string };
export const getNav = cache(async (): Promise<NavItem[]> => {
  const data = await rows("nav_items", { column: "sort_order" });
  if (!data) return seed.mainNav;
  return data.map((r) => ({ label: str(r.label), href: str(r.href) }));
});
