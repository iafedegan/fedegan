"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminDb, MEDIA_BUCKET } from "./client";
import { requireEditorActor } from "./guard";
import {
  SLUG_VALIDO, TIPOS_ARCHIVO_FORM, leerEsquema, problemaEsquema, slugDe, validarRespuestas, visibles, type Valor,
} from "./formulario-esquema";

export type GuardarFormularioEstado = { ok?: boolean; message?: string };
export type EnvioEstado = { ok?: boolean; error?: string };

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const FALTA_MIGRACION = "Falta ejecutar docs/migraciones/022-formularios.sql en Supabase.";
const sinTabla = (m: string) => /forms|form_submissions|schema cache|does not exist/i.test(m);

/** Crea un formulario vacío (borrador) y abre el constructor. Solo el equipo del portal. */
export async function crearFormulario(_prev: GuardarFormularioEstado, fd: FormData): Promise<GuardarFormularioEstado> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: "No hay conexión con la base de datos." };
  const title = clean(fd.get("title"), 120);
  if (title.length < 3) return { ok: false, message: "Escriba un nombre para el formulario (mínimo 3 letras)." };
  const base = slugDe(title);
  let id = "";
  for (let i = 0; i < 5 && !id; i++) {
    const slug = i === 0 ? base : `${base.slice(0, 44)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await db.from("forms").insert({ slug, title, updated_by: actor }).select("id").single();
    if (!error) id = String(data.id);
    else if (error.code !== "23505") return { ok: false, message: sinTabla(error.message) ? FALTA_MIGRACION : "No se pudo crear el formulario." };
  }
  if (!id) return { ok: false, message: "No se pudo crear el formulario. Intente de nuevo." };
  await db.from("audit_log").insert({ actor, action: "crear", entity: "formularios", entity_id: id, summary: title });
  redirect(`/admin/formularios/${id}`);
}

/** Guarda el borrador del formulario o, con intent «publicar», lo deja visible al público con una versión nueva. */
export async function guardarFormulario(_prev: GuardarFormularioEstado, fd: FormData): Promise<GuardarFormularioEstado> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: "No hay conexión con la base de datos." };
  const id = clean(fd.get("id"), 60);
  const publicar = fd.get("intent") === "publicar";
  const title = clean(fd.get("title"), 120);
  const description = String(fd.get("description") ?? "").trim().slice(0, 600);
  const slug = clean(fd.get("slug"), 60).toLowerCase();
  if (title.length < 3) return { ok: false, message: "Escriba un nombre para el formulario (mínimo 3 letras)." };
  if (!SLUG_VALIDO.test(slug) || slug.length < 3) return { ok: false, message: "La dirección solo admite letras minúsculas, números y guiones (mínimo 3 caracteres)." };
  let raw: unknown = null;
  try {
    raw = JSON.parse(String(fd.get("schema") ?? "null"));
  } catch {
    return { ok: false, message: "No se entendió el formulario. Recargue la página." };
  }
  const schema = leerEsquema(raw);
  if (publicar) {
    const problema = problemaEsquema(schema);
    if (problema) return { ok: false, message: problema };
  }
  const { data: actual } = await db.from("forms").select("version,status").eq("id", id).maybeSingle();
  if (!actual) return { ok: false, message: "No encontramos el formulario." };

  const cambios: Record<string, unknown> = { title, description, slug, schema, updated_by: actor, updated_at: new Date().toISOString() };
  if (publicar) {
    cambios.published = schema;
    cambios.version = Number(actual.version ?? 0) + 1;
    cambios.status = "publicado";
  }
  const { error } = await db.from("forms").update(cambios).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Esa dirección ya la usa otro formulario. Elija otra." };
    return { ok: false, message: sinTabla(error.message) ? FALTA_MIGRACION : "No se pudo guardar. Intente de nuevo." };
  }
  await db.from("audit_log").insert({ actor, action: publicar ? "publicar" : "editar", entity: "formularios", entity_id: id, summary: title });
  revalidatePath("/formularios/[slug]", "page");
  revalidatePath("/admin/formularios");
  return { ok: true, message: publicar ? "Formulario publicado. Ya está disponible en su dirección pública." : "Borrador guardado." };
}

/** Cierra (deja de recibir respuestas), reabre o retira del público un formulario. */
export async function cambiarEstadoFormulario(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = clean(fd.get("id"), 60);
  const estado = clean(fd.get("estado"), 20);
  if (!db || !id || !["borrador", "publicado", "cerrado"].includes(estado)) return;
  // Solo se puede publicar/reabrir si ya hubo una publicación.
  if (estado !== "borrador") {
    const { data } = await db.from("forms").select("published").eq("id", id).maybeSingle();
    if (!data?.published) return;
  }
  await db.from("forms").update({ status: estado, updated_by: actor, updated_at: new Date().toISOString() }).eq("id", id);
  await db.from("audit_log").insert({ actor, action: "editar", entity: "formularios", entity_id: id, summary: `Estado: ${estado}` });
  revalidatePath("/formularios/[slug]", "page");
  revalidatePath("/admin/formularios");
  revalidatePath(`/admin/formularios/${id}`);
}

/** Copia un formulario (como borrador, sin respuestas). */
export async function duplicarFormulario(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = clean(fd.get("id"), 60);
  if (!db || !id) return;
  const { data: f } = await db.from("forms").select("title,description,schema").eq("id", id).maybeSingle();
  if (!f) return;
  const title = `${String(f.title)} (copia)`.slice(0, 120);
  const { data } = await db.from("forms").insert({ slug: `${slugDe(String(f.title)).slice(0, 44)}-${Math.random().toString(36).slice(2, 6)}`, title, description: f.description, schema: f.schema, updated_by: actor }).select("id").single();
  if (data) await db.from("audit_log").insert({ actor, action: "crear", entity: "formularios", entity_id: String(data.id), summary: title });
  revalidatePath("/admin/formularios");
}

/** Elimina el formulario y todas sus respuestas. */
export async function eliminarFormulario(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = clean(fd.get("id"), 60);
  if (!db || !id) return;
  const { data: f } = await db.from("forms").select("title").eq("id", id).maybeSingle();
  await db.from("forms").delete().eq("id", id);
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: "formularios", entity_id: id, summary: String(f?.title ?? "") });
  revalidatePath("/formularios/[slug]", "page");
  redirect("/admin/formularios");
}

/** Elimina una respuesta. */
export async function eliminarRespuesta(fd: FormData) {
  await requireEditorActor();
  const db = adminDb();
  const id = clean(fd.get("id"), 60);
  const form = clean(fd.get("form"), 60);
  if (db && id) await db.from("form_submissions").delete().eq("id", id).eq("form_id", form);
  revalidatePath(`/admin/formularios/${form}/respuestas`);
}

/** Respuesta pública a un formulario: valida con la versión publicada, sube los archivos y guarda. */
export async function enviarFormulario(fd: FormData): Promise<EnvioEstado> {
  // Campo trampa: los robots lo llenan, las personas no lo ven.
  if (clean(fd.get("sitio_web"), 80)) return { ok: true };
  const db = adminDb();
  if (!db) return { error: "El formulario aún no está habilitado. Intente más tarde." };
  const slug = clean(fd.get("slug"), 80);
  const { data: f } = await db.from("forms").select("id,status,published,version").eq("slug", slug).in("status", ["publicado", "cerrado"]).maybeSingle();
  if (!f || !f.published) return { error: "No encontramos el formulario." };
  if (f.status === "cerrado") return { error: "Este formulario ya no recibe respuestas." };

  const esquema = leerEsquema(f.published);
  const valores: Record<string, Valor> = {};
  const archivos = new Map<string, File>();
  for (const c of esquema.campos) {
    const nombre = `c_${c.id}`;
    if (c.tipo === "seccion") continue;
    if (c.tipo === "tabla") {
      // Las filas llegan como JSON en un campo oculto; validarRespuestas descarta lo que no tenga la forma esperada.
      try {
        const v = JSON.parse(String(fd.get(nombre) ?? "[]").slice(0, 200_000));
        valores[c.id] = Array.isArray(v) ? v : [];
      } catch {
        valores[c.id] = [];
      }
    } else if (c.tipo === "casillas") valores[c.id] = fd.getAll(nombre).map((x) => String(x));
    else if (c.tipo === "archivo") {
      const a = fd.get(nombre);
      if (a instanceof File && a.size > 0) {
        valores[c.id] = a.name || "archivo";
        archivos.set(c.id, a);
      } else valores[c.id] = "";
    } else valores[c.id] = String(fd.get(nombre) ?? "");
  }
  const r = validarRespuestas(esquema, valores);
  if ("error" in r) return { error: r.error };

  const ver = visibles(esquema.campos, valores);
  const subidas: { path: string; file: File }[] = [];
  for (const [id, file] of archivos) {
    if (!ver.has(id)) continue;
    const campo = esquema.campos.find((c) => c.id === id);
    const ext = TIPOS_ARCHIVO_FORM.get(file.type);
    if (!ext) return { error: `«${campo?.etiqueta}»: use PDF, Word, Excel, JPG o PNG.` };
    if (file.size > 10 * 1024 * 1024) return { error: `«${campo?.etiqueta}»: el archivo supera 10 MB.` };
    const path = `formularios/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    subidas.push({ path, file });
    const resp = r.respuestas.find((x) => x.id === id);
    if (resp) resp.v = path;
  }
  for (const s of subidas) {
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(s.path, await s.file.arrayBuffer(), { contentType: s.file.type });
    if (error) return { error: "No se pudo cargar el archivo. Intente de nuevo." };
    const resp = r.respuestas.find((x) => x.v === s.path);
    if (resp) resp.v = db.storage.from(MEDIA_BUCKET).getPublicUrl(s.path).data.publicUrl;
  }
  if (r.respuestas.length === 0) return { error: "Responda al menos una pregunta." };

  const { error } = await db.from("form_submissions").insert({ form_id: f.id, version: f.version, answers: r.respuestas });
  if (error) return { error: "No pudimos guardar su respuesta. Intente de nuevo." };
  return { ok: true };
}
