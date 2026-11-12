import "server-only";
import { adminDb } from "./client";
import { leerEsquema, type EsquemaForm, type RespuestaForm } from "./formulario-esquema";

export type Estado = "borrador" | "publicado" | "cerrado";
export type Formulario = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: Estado;
  schema: EsquemaForm;
  published: EsquemaForm | null;
  version: number;
  created_at: string;
  updated_at: string;
  respuestas?: number;
};
export type RespuestaFila = { id: string; version: number; answers: RespuestaForm[]; created_at: string };

const COLS = "id,slug,title,description,status,schema,published,version,created_at,updated_at";

function aFormulario(r: Record<string, unknown>): Formulario {
  return {
    id: String(r.id), slug: String(r.slug), title: String(r.title), description: String(r.description ?? ""),
    status: (r.status === "publicado" || r.status === "cerrado" ? r.status : "borrador") as Estado,
    schema: leerEsquema(r.schema), published: r.published ? leerEsquema(r.published) : null,
    version: Number(r.version ?? 0), created_at: String(r.created_at), updated_at: String(r.updated_at),
  };
}

/** Todos los formularios con su número de respuestas (más recientes primero). */
export async function listarFormularios(): Promise<Formulario[]> {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("forms").select(COLS).order("updated_at", { ascending: false });
  const filas = (data ?? []).map((r) => aFormulario(r as Record<string, unknown>));
  if (filas.length === 0) return filas;
  const { data: rs } = await db.from("form_submissions").select("form_id").in("form_id", filas.map((f) => f.id)).limit(20000);
  const cuenta = new Map<string, number>();
  for (const r of rs ?? []) cuenta.set(String(r.form_id), (cuenta.get(String(r.form_id)) ?? 0) + 1);
  return filas.map((f) => ({ ...f, respuestas: cuenta.get(f.id) ?? 0 }));
}

export async function formularioPorId(id: string): Promise<Formulario | null> {
  const db = adminDb();
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db.from("forms").select(COLS).eq("id", id).maybeSingle();
  return data ? aFormulario(data as Record<string, unknown>) : null;
}

/** El formulario visible al público: publicado o cerrado (cerrado se muestra, pero ya no recibe respuestas). */
export async function formularioPublico(slug: string): Promise<Formulario | null> {
  const db = adminDb();
  if (!db) return null;
  const { data } = await db.from("forms").select(COLS).eq("slug", slug).in("status", ["publicado", "cerrado"]).maybeSingle();
  const f = data ? aFormulario(data as Record<string, unknown>) : null;
  return f && f.published ? f : null;
}

export async function respuestasDe(formId: string): Promise<RespuestaFila[]> {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("form_submissions").select("id,version,answers,created_at").eq("form_id", formId).order("created_at", { ascending: false }).limit(5000);
  return (data ?? []).map((r) => ({
    id: String(r.id), version: Number(r.version ?? 1), created_at: String(r.created_at),
    answers: Array.isArray(r.answers) ? (r.answers as RespuestaForm[]) : [],
  }));
}
