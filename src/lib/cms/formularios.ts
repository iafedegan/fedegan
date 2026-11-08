import "server-only";
import { adminDb } from "./client";
import { ESQUEMAS, limpiarDatos, opcionesDe, type Datos } from "./elementos";

// Formularios del constructor: dónde está la definición de uno (la que publicó el editor) y las respuestas recibidas.

export type Pregunta = { etiqueta: string; tipo: string; opciones: string[]; requerido: boolean };
export type Formulario = { clave: string; titulo: string; webhook: string; gracias: string; preguntas: Pregunta[] };
export type Respuesta = { e: string; v: string | string[] };
export type Recibida = { id: string; form_key: string; form_title: string; page: string; answers: Respuesta[]; webhook: string | null; created_at: string };

const str = (v: unknown) => (typeof v === "string" ? v : "");

function deBloque(raw: unknown): Formulario | null {
  const d = limpiarDatos(ESQUEMAS.formulario, raw) as Datos | null;
  if (!d || !str(d.clave)) return null;
  const preguntas = (Array.isArray(d.campos) ? (d.campos as Datos[]) : []).map((c) => ({
    etiqueta: str(c.etiqueta), tipo: str(c.tipo) || "texto", opciones: opcionesDe(str(c.opciones)), requerido: c.requerido === true,
  }));
  return { clave: str(d.clave), titulo: str(d.titulo), webhook: str(d.webhook), gracias: str(d.gracias) || "¡Gracias! Recibimos su respuesta.", preguntas };
}

/** La definición publicada del formulario `clave`, buscada en las páginas nuevas y en las migradas. null si no existe. */
export async function buscarFormulario(clave: string): Promise<Formulario | null> {
  const db = adminDb();
  if (!db) return null;
  const [nodos, paginas] = await Promise.all([db.from("site_nodes").select("blocks"), db.from("legacy_pages").select("blocks")]);
  for (const fila of [...(nodos.data ?? []), ...(paginas.data ?? [])] as { blocks: unknown }[]) {
    if (!Array.isArray(fila.blocks)) continue;
    for (const b of fila.blocks as { t?: string; data?: unknown }[]) {
      if (b?.t !== "formulario") continue;
      const f = deBloque(b.data);
      if (f?.clave === clave) return f;
    }
  }
  return null;
}

export async function respuestasDe(clave: string): Promise<Recibida[]> {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("form_responses").select("*").eq("form_key", clave).order("created_at", { ascending: false }).limit(2000);
  return (data ?? []) as Recibida[];
}

/** Un resumen por formulario: cuántas respuestas y cuándo llegó la última. `disponible` es false si falta la tabla. */
export async function resumenFormularios(): Promise<{ disponible: boolean; items: { clave: string; titulo: string; total: number; ultima: string }[] }> {
  const db = adminDb();
  if (!db) return { disponible: false, items: [] };
  const { data, error } = await db.from("form_responses").select("form_key,form_title,created_at").order("created_at", { ascending: false }).limit(5000);
  if (error) return { disponible: false, items: [] };
  const mapa = new Map<string, { clave: string; titulo: string; total: number; ultima: string }>();
  for (const r of (data ?? []) as { form_key: string; form_title: string; created_at: string }[]) {
    const x = mapa.get(r.form_key);
    if (x) x.total++;
    else mapa.set(r.form_key, { clave: r.form_key, titulo: r.form_title, total: 1, ultima: r.created_at });
  }
  return { disponible: true, items: [...mapa.values()] };
}

export const textoRespuesta = (v: string | string[]) => (Array.isArray(v) ? v.join(", ") : v);
