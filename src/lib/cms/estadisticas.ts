import "server-only";
import { cache } from "react";
import { adminDb } from "./client";
import { parseIndicadores, type IndicadorFedegan } from "@/lib/estadisticas/parse";

// Conjuntos de cifras de FEDEGÁN: el equipo pega el HTML del sistema de estadísticas y el portal lo muestra con su diseño.
// Se guardan en site_settings (clave «estadisticas:<id>»), tabla que ya existe; solo el servidor la lee y escribe.

export type ConjuntoCifras = {
  id: string;
  titulo: string;
  orden: number;
  origen?: string;
  actualizado: string;
  actualizadoPor?: string;
  indicadores: IndicadorFedegan[];
};

const KEY = "estadisticas:";
export const slugConjunto = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

// Las celdas vacías (NaN) viajan como null en el JSON.
const aJson = (i: IndicadorFedegan) => ({ ...i, series: i.series.map((s) => ({ ...s, valores: s.valores.map((v) => (Number.isFinite(v) ? v : null)) })) });
const deJson = (i: IndicadorFedegan): IndicadorFedegan => ({ ...i, series: i.series.map((s) => ({ ...s, valores: (s.valores as (number | null)[]).map((v) => (v === null ? NaN : v)) })) });

export const getConjuntos = cache(async (): Promise<ConjuntoCifras[]> => {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("site_settings").select("key,value,updated_at,updated_by").like("key", `${KEY}%`);
  return ((data ?? []) as { key: string; value: Omit<ConjuntoCifras, "id" | "actualizado">; updated_at: string; updated_by: string | null }[])
    .map((r) => ({
      ...r.value,
      id: r.key.slice(KEY.length),
      actualizado: r.updated_at,
      actualizadoPor: r.updated_by ?? undefined,
      indicadores: (r.value.indicadores ?? []).map(deJson),
    }))
    .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99) || a.titulo.localeCompare(b.titulo, "es"));
});

export type ResultadoGuardar = { error: string } | { ok: true; total: number; conDatos: number };
export async function guardarConjunto(opts: { id: string; titulo: string; orden: number; origen?: string; html: string; actor: string }): Promise<ResultadoGuardar> {
  const db = adminDb();
  if (!db) return { error: "El servidor no tiene la clave de servicio de Supabase." };
  const indicadores = parseIndicadores(opts.html);
  if (!indicadores.length) return { error: "No encontramos indicadores en ese HTML. Copie el código completo de la página del sistema de estadísticas." };
  const { error } = await db.from("site_settings").upsert({
    key: `${KEY}${opts.id}`,
    value: { titulo: opts.titulo, orden: opts.orden, origen: opts.origen, indicadores: indicadores.map(aJson) },
    updated_at: new Date().toISOString(),
    updated_by: opts.actor,
  });
  if (error) return { error: `No se pudo guardar: ${error.message}` };
  return { ok: true, total: indicadores.length, conDatos: indicadores.filter((i) => i.series.length).length };
}

export async function borrarConjunto(id: string) {
  const db = adminDb();
  if (!db) return;
  await db.from("site_settings").delete().eq("key", `${KEY}${id}`);
}

/** Descarga la página del sistema de estadísticas (solo ese sitio; el HTML viene en ISO-8859-1). */
export async function traerHtml(url: string): Promise<{ html: string } | { error: string }> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { error: "La dirección no es válida." };
  }
  if (u.protocol !== "https:" || u.hostname !== "estadisticas.fedegan.org.co") return { error: "Solo se pueden traer páginas de estadisticas.fedegan.org.co." };
  try {
    const res = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!res.ok) return { error: `El sistema de estadísticas respondió ${res.status}.` };
    return { html: new TextDecoder("windows-1252").decode(await res.arrayBuffer()) };
  } catch {
    return { error: "No pudimos conectar con el sistema de estadísticas." };
  }
}
