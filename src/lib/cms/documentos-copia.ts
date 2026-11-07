import "server-only";
import { cache } from "react";
import { allLegacyPages } from "@/content/legacy";
import { adminDb, publicDb } from "./client";
import { MAX_COPIA, normalizarOrigen, origenesEnBloques, rutaDeCopia, tipoMime } from "./documentos-copia-util";

// Copia de los documentos migrados (hoy en el almacenamiento de Google del sitio anterior) al depósito «documentos» de Supabase.
// La tabla `documentos_copias` (docs/migraciones/013) dice qué ya está copiado; el portal cambia en el texto cada enlace
// original por su copia, y si un documento no se copió, deja el enlace original.

export const DOCS_BUCKET = "documentos";
const URL_BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

export const urlPublica = (ruta: string) => `${URL_BASE}/storage/v1/object/public/${DOCS_BUCKET}/${ruta}`;

/** Documentos propios de FEDEGÁN enlazados en las páginas migradas. */
export const documentosDelPortal = cache((): string[] => {
  const set = new Set<string>();
  for (const { page } of allLegacyPages()) origenesEnBloques(page.blocks, set);
  return [...set].sort();
});

/** origen → dirección pública de la copia (solo los copiados). Vacío si la tabla aún no existe. */
export const getCopias = cache(async (): Promise<ReadonlyMap<string, string>> => {
  const db = publicDb();
  const map = new Map<string, string>();
  if (!db) return map;
  try {
    const { data, error } = await db.from("documentos_copias").select("origen,ruta").eq("estado", "copiado").limit(5000);
    if (error) return map;
    for (const r of data ?? []) if (r.ruta) map.set(String(r.origen), urlPublica(String(r.ruta)));
  } catch {}
  return map;
});

export type EstadoCopia = { tablaLista: boolean; total: number; copiados: number; omitidos: number; pendientes: number; bytes: number };

export async function estadoCopia(): Promise<EstadoCopia> {
  const todos = documentosDelPortal();
  const db = adminDb() ?? publicDb();
  const vacio = { tablaLista: false, total: todos.length, copiados: 0, omitidos: 0, pendientes: todos.length, bytes: 0 };
  if (!db) return vacio;
  const { data, error } = await db.from("documentos_copias").select("origen,estado,bytes").limit(5000);
  if (error) return vacio;
  const hechos = new Map((data ?? []).map((r) => [String(r.origen), r]));
  let copiados = 0;
  let omitidos = 0;
  let bytes = 0;
  for (const o of todos) {
    const r = hechos.get(o);
    if (!r) continue;
    if (r.estado === "copiado") {
      copiados++;
      bytes += Number(r.bytes ?? 0);
    } else omitidos++;
  }
  return { tablaLista: true, total: todos.length, copiados, omitidos, pendientes: todos.length - copiados - omitidos, bytes };
}

export type ResultadoLote = { ok: boolean; message?: string; copiados: number; omitidos: number; errores: string[]; pendientes: number };

const UA = { "User-Agent": "Mozilla/5.0 (copia de documentos FEDEGAN-FNG)" };

async function copiarUno(origen: string): Promise<{ estado: "copiado" | "omitido" | "reintentar"; bytes?: number; detalle?: string }> {
  const db = adminDb()!;
  let res: Response;
  try {
    res = await fetch(origen, { headers: UA, redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(50_000) });
  } catch {
    return { estado: "reintentar", detalle: "sin conexión o demasiado lento" };
  }
  if (res.status === 404 || res.status === 403 || res.status === 410) return { estado: "omitido", detalle: `el original ya no está disponible (${res.status})` };
  if (!res.ok) return { estado: "reintentar", detalle: `el original respondió ${res.status}` };
  const largo = Number(res.headers.get("content-length") ?? 0);
  if (largo > MAX_COPIA) return { estado: "omitido", bytes: largo, detalle: `pesa ${(largo / 1048576).toFixed(0)} MB y el depósito admite 50 MB` };
  let cuerpo: ArrayBuffer;
  try {
    cuerpo = await res.arrayBuffer();
  } catch {
    return { estado: "reintentar", detalle: "se cortó la descarga" };
  }
  if (cuerpo.byteLength > MAX_COPIA) return { estado: "omitido", bytes: cuerpo.byteLength, detalle: "supera 50 MB" };
  if (cuerpo.byteLength === 0) return { estado: "omitido", detalle: "el archivo está vacío" };
  const ruta = rutaDeCopia(origen);
  const { error } = await db.storage.from(DOCS_BUCKET).upload(ruta, cuerpo, { contentType: tipoMime(origen), upsert: true, cacheControl: "31536000" });
  if (error) return { estado: "reintentar", detalle: `no se pudo guardar (${error.message})` };
  const { error: e2 } = await db.from("documentos_copias").upsert({ origen, ruta, bytes: cuerpo.byteLength, estado: "copiado", detalle: null, actualizado: new Date().toISOString() });
  if (e2) return { estado: "reintentar", detalle: `no se registró la copia (${e2.message})` };
  return { estado: "copiado", bytes: cuerpo.byteLength };
}

/** Copia documentos pendientes durante unos segundos (para caber en el tiempo de una petición) y devuelve el avance. */
export async function copiarLote(presupuestoMs = 40_000, paralelo = 3): Promise<ResultadoLote> {
  const db = adminDb();
  if (!db) return { ok: false, message: "El servidor no tiene la clave de servicio de Supabase.", copiados: 0, omitidos: 0, errores: [], pendientes: 0 };
  const { data, error } = await db.from("documentos_copias").select("origen").limit(5000);
  if (error) {
    const falta = /does not exist|relation|schema cache/i.test(error.message);
    return { ok: false, message: falta ? "Falta crear la tabla de copias: ejecute docs/migraciones/013-documentos-copias.sql en Supabase." : `No se pudo leer el avance (${error.message}).`, copiados: 0, omitidos: 0, errores: [], pendientes: 0 };
  }
  const hechos = new Set((data ?? []).map((r) => String(r.origen)));
  const cola = documentosDelPortal().filter((o) => !hechos.has(o));
  const inicio = Date.now();
  let copiados = 0;
  let omitidos = 0;
  const errores: string[] = [];
  const fallidos = new Set<string>();

  async function trabajador() {
    while (Date.now() - inicio < presupuestoMs) {
      const o = cola.shift();
      if (!o) return;
      const r = await copiarUno(o);
      if (r.estado === "copiado") copiados++;
      else if (r.estado === "omitido") {
        omitidos++;
        await db!.from("documentos_copias").upsert({ origen: o, ruta: null, bytes: r.bytes ?? null, estado: "omitido", detalle: r.detalle ?? null, actualizado: new Date().toISOString() });
      } else {
        fallidos.add(o);
        errores.push(`${decodeURIComponent(o.split("/").pop() ?? o)}: ${r.detalle}`);
      }
    }
  }
  await Promise.all(Array.from({ length: paralelo }, trabajador));
  // Los que fallaron por red quedan pendientes para el siguiente intento; si todo el lote falló, se avisa para no repetir sin fin.
  const pendientes = cola.length + fallidos.size;
  return { ok: true, copiados, omitidos, errores: errores.slice(0, 5), pendientes };
}

export { normalizarOrigen };
