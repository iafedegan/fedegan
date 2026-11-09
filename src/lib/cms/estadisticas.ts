import "server-only";
import { cache } from "react";
import { adminDb } from "./client";
import { parseIndicadores, type IndicadorFedegan } from "@/lib/estadisticas/parse";
import { urlPermitida } from "@/lib/estadisticas/url";
import { leerObservatorioContexto, normalizarCopia } from "@/lib/estadisticas/contexto";
import type { Observatorio } from "@/lib/estadisticas/tipos";

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

/** Descarga una página con cifras (el sistema de estadísticas de FEDEGÁN o la dirección de un iframe que envíen). Solo https y sitios públicos. */
export async function traerHtml(url: string): Promise<{ html: string } | { error: string }> {
  const u = urlPermitida(url);
  if (!u) return { error: "La dirección debe ser https y de un sitio público (sin números IP ni direcciones internas)." };
  try {
    const res = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(50000), redirect: "follow" });
    if (!res.ok) return { error: `El sitio respondió ${res.status}.` };
    const buf = await res.arrayBuffer();
    // La codificación sale del encabezado o de la etiqueta meta; el sistema de estadísticas anterior usa ISO-8859-1 (windows-1252).
    const cabecera = /charset=([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1] ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(new TextDecoder("latin1").decode(buf.slice(0, 4096)))?.[1] ?? "windows-1252";
    let decoder: TextDecoder;
    try {
      decoder = new TextDecoder(cabecera);
    } catch {
      decoder = new TextDecoder("utf-8");
    }
    return { html: decoder.decode(buf) };
  } catch {
    return { error: "No pudimos conectar con ese sitio." };
  }
}

// ---------- Copia única de CONtexto ----------
// El Observatorio de CONtexto trae el historial desde 2021 y el inventario por departamento, que el sistema de estadísticas de FEDEGÁN
// no entrega de una vez. Se copia UNA sola vez a la base de datos del portal; después el portal ya no consulta a CONtexto.

/** Página pública del Observatorio de CONtexto (de donde se hace la copia única). */
export const URL_CONTEXTO = "https://contexto-olive.vercel.app/observatorio";
const KEY_COPIA = "copia:observatorio-contexto";

export type CopiaContexto = { observatorio: Observatorio; origen: string; copiado: string; copiadoPor?: string };

export const getCopiaContexto = cache(async (): Promise<CopiaContexto | null> => {
  const db = adminDb();
  if (!db) return null;
  const { data } = await db.from("site_settings").select("value,updated_at,updated_by").eq("key", KEY_COPIA).maybeSingle();
  const v = data?.value as { observatorio?: Observatorio; origen?: string } | undefined;
  if (!data || !v?.observatorio) return null;
  return { observatorio: normalizarCopia(v.observatorio), origen: v.origen ?? URL_CONTEXTO, copiado: data.updated_at, copiadoPor: data.updated_by ?? undefined };
});

export type ResultadoCopia = { error: string } | { ok: true; indicadores: number; periodos: number; departamentos: number };
export async function guardarCopiaContexto(opts: { html: string; origen: string; actor: string }): Promise<ResultadoCopia> {
  const db = adminDb();
  if (!db) return { error: "El servidor no tiene la clave de servicio de Supabase." };
  const obs = leerObservatorioContexto(opts.html);
  if (!obs) return { error: "Esa página no trae las cifras del Observatorio (no se encontraron indicadores). No se cambió nada." };
  const { error } = await db.from("site_settings").upsert({ key: KEY_COPIA, value: { origen: opts.origen, observatorio: obs }, updated_at: new Date().toISOString(), updated_by: opts.actor });
  if (error) return { error: `No se pudo guardar: ${error.message}` };
  const n = Object.values(obs.indicadores);
  return { ok: true, indicadores: n.length, periodos: Math.max(0, ...n.map((i) => i.periodos.length)), departamentos: obs.bovinos?.departamentos.length ?? 0 };
}

export async function borrarCopiaContexto() {
  const db = adminDb();
  if (!db) return;
  await db.from("site_settings").delete().eq("key", KEY_COPIA);
}
