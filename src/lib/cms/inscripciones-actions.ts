"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminDb, MEDIA_BUCKET } from "./client";
import { requireEditorActor } from "./guard";
import { formularioDe, nuevoCodigo } from "./inscripciones";
import { leerForm, opcionesDe, problemaForm, type Respuesta } from "./inscripcion-form";

export type InscripcionEstado = { error?: string };

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

const TIPOS_ARCHIVO = new Map([
  ["application/pdf", "pdf"], ["application/msword", "doc"], ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"], ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"], ["image/jpeg", "jpg"], ["image/png", "png"],
]);
const TELEFONO = /^[+()\d][\d\s().+-]{4,38}$/;

// Solo direcciones públicas: nada de equipos de la red interna.
function destinoSeguro(url: string): URL | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h === "[::1]" || !h.includes(".")) return null;
    if (/^(10|127|0)\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Inscripción pública a un evento: valida (nombre, correo y las preguntas del formulario del evento), guarda, avisa a la API y lleva a la confirmación con el QR. */
export async function inscribirse(_prev: InscripcionEstado, fd: FormData): Promise<InscripcionEstado> {
  // Campo trampa: los robots lo llenan, las personas no lo ven.
  if (clean(fd.get("sitio_web"), 80)) return {};
  const db = adminDb();
  if (!db) return { error: "Las inscripciones aún no están habilitadas. Intente más tarde." };

  const slug = clean(fd.get("slug"), 120);
  const name = clean(fd.get("name"), 120);
  const email = clean(fd.get("email"), 160).toLowerCase();
  if (name.length < 3) return { error: "Escriba su nombre completo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Escriba un correo válido." };

  const { data: ev } = await db.from("events").select("id,starts_on,title").eq("slug", slug).eq("published", true).maybeSingle();
  if (!ev) return { error: "No encontramos el evento." };

  const form = await formularioDe(slug);
  const respuestas: Respuesta[] = [];
  const columnas: Record<string, string | null> = { phone: null, document: null, organization: null };
  const subidas: { path: string; file: File; tipo: string }[] = [];
  for (let i = 0; i < form.preguntas.length; i++) {
    const p = form.preguntas[i];
    const campo = `c${i}`;
    const falta = `Falta responder «${p.etiqueta}».`;
    const opciones = opcionesDe(p.opciones);
    let v: string | string[] = "";
    if (p.tipo === "casillas") {
      const marcadas = fd.getAll(campo).map((x) => String(x));
      if (marcadas.some((m) => !opciones.includes(m))) return { error: `«${p.etiqueta}»: elija solo entre las opciones.` };
      if (p.requerido && marcadas.length === 0) return { error: falta };
      v = marcadas;
    } else if (p.tipo === "archivo") {
      const f = fd.get(campo);
      if (f instanceof File && f.size > 0) {
        const ext = TIPOS_ARCHIVO.get(f.type);
        if (!ext) return { error: `«${p.etiqueta}»: use PDF, Word, Excel, JPG o PNG.` };
        if (f.size > 10 * 1024 * 1024) return { error: `«${p.etiqueta}»: el archivo supera 10 MB.` };
        const path = `inscripciones/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        subidas.push({ path, file: f, tipo: f.type });
        v = path;
      } else if (p.requerido) return { error: falta };
    } else {
      const t = p.tipo === "parrafo" ? String(fd.get(campo) ?? "").trim().slice(0, 3000) : clean(fd.get(campo), 300);
      if (!t) {
        if (p.requerido) return { error: falta };
      } else {
        if (p.tipo === "correo" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return { error: `«${p.etiqueta}»: escriba un correo válido.` };
        if (p.tipo === "telefono" && !TELEFONO.test(t)) return { error: `«${p.etiqueta}»: escriba un teléfono válido.` };
        if (p.tipo === "numero" && !/^-?\d+([.,]\d+)?$/.test(t)) return { error: `«${p.etiqueta}»: escriba solo un número.` };
        if (p.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return { error: `«${p.etiqueta}»: elija una fecha.` };
        if (p.tipo === "lista" && !opciones.includes(t)) return { error: `«${p.etiqueta}»: elija una de las opciones.` };
        v = t;
      }
    }
    if (p.preset && typeof v === "string") columnas[p.preset] = v.slice(0, 120) || null;
    respuestas.push({ e: p.etiqueta, v });
  }

  const { data: ya } = await db.from("event_registrations").select("code").eq("event_id", ev.id).ilike("email", email).maybeSingle();
  if (ya) redirect(`/eventos/${slug}/inscrito/${ya.code}`);

  for (const s of subidas) {
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(s.path, await s.file.arrayBuffer(), { contentType: s.tipo });
    if (error) return { error: "No se pudo cargar el archivo. Intente de nuevo." };
    const r = respuestas.find((x) => x.v === s.path);
    if (r) r.v = db.storage.from(MEDIA_BUCKET).getPublicUrl(s.path).data.publicUrl;
  }

  let code = "";
  let id = "";
  for (let i = 0; i < 4 && !code; i++) {
    const c = nuevoCodigo();
    // Las respuestas van en su columna solo si el editor armó un formulario propio (así funciona aunque falte la migración).
    const fila = { event_id: ev.id, code: c, name, email, phone: columnas.phone, document: columnas.document, organization: columnas.organization, ...(form.personalizado ? { answers: respuestas } : {}) };
    const { data, error } = await db.from("event_registrations").insert(fila).select("id").single();
    if (!error) {
      code = c;
      id = String(data.id);
    } else if (error.code !== "23505") return { error: "No pudimos registrar su inscripción. Intente de nuevo." };
  }
  if (!code) return { error: "No pudimos registrar su inscripción. Intente de nuevo." };

  // Aviso a la API del editor: si falla, la inscripción ya está guardada y se ve en «Inscritos».
  const destino = form.webhook ? destinoSeguro(form.webhook) : null;
  if (destino) {
    let estado = "error";
    try {
      const res = await fetch(destino, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "FEDEGAN-Inscripciones/1.0" },
        body: JSON.stringify({
          evento: slug, titulo: String(ev.title ?? ""), codigo: code, inscrito: new Date().toISOString(), nombre: name, correo: email,
          respuestas: Object.fromEntries(respuestas.map((r) => [r.e, r.v])),
        }),
        redirect: "error",
        signal: AbortSignal.timeout(6000),
      });
      estado = res.ok ? "ok" : `http ${res.status}`;
    } catch {
      estado = "error";
    }
    if (form.personalizado) await db.from("event_registrations").update({ webhook: estado }).eq("id", id);
  }
  redirect(`/eventos/${slug}/inscrito/${code}`);
}

export type GuardarFormEstado = { ok?: boolean; message?: string };

/** Guarda el formulario de inscripción de un evento (preguntas, mensaje y API). Solo el equipo del portal. */
export async function guardarFormularioEvento(_prev: GuardarFormEstado, fd: FormData): Promise<GuardarFormEstado> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: "No hay conexión con la base de datos." };
  const id = clean(fd.get("id"), 60);
  let raw: unknown = null;
  try {
    raw = JSON.parse(String(fd.get("form") ?? "null"));
  } catch {
    return { ok: false, message: "No se entendió el formulario. Recargue la página." };
  }
  const form = leerForm(raw);
  const problema = problemaForm(form);
  if (problema) return { ok: false, message: problema };
  const { error } = await db.from("events").update({ reg_form: form, updated_by: actor }).eq("id", id);
  if (error) {
    return { ok: false, message: /reg_form/.test(error.message) ? "Falta ejecutar docs/migraciones/017-eventos-formulario.sql en Supabase." : "No se pudo guardar. Intente de nuevo." };
  }
  await db.from("audit_log").insert({ actor, action: "editar", entity: "eventos", entity_id: id, summary: "Formulario de inscripción" });
  revalidatePath("/eventos/[slug]", "page");
  return { ok: true, message: "Formulario guardado. Ya se ve en la página del evento." };
}

/** Marca (o desmarca) la asistencia de una persona. Solo el equipo del portal. */
export async function marcarAsistencia(fd: FormData) {
  await requireEditorActor();
  const db = adminDb();
  const id = clean(fd.get("id"), 60);
  const event = clean(fd.get("event"), 60);
  const undo = fd.get("undo") === "1";
  if (db && id) await db.from("event_registrations").update({ checked_in_at: undo ? null : new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/eventos/${event}/inscritos`);
}

/** Registro de asistencia por código (lo que lee el QR o se dicta en la puerta). */
export async function asistenciaPorCodigo(fd: FormData) {
  await requireEditorActor();
  const db = adminDb();
  const event = clean(fd.get("event"), 60);
  const code = clean(fd.get("code"), 20).toUpperCase();
  let res = "no";
  if (db && /^FED-[A-Z0-9]{8}$/.test(code)) {
    const { data } = await db.from("event_registrations").update({ checked_in_at: new Date().toISOString() }).eq("event_id", event).eq("code", code).select("name").maybeSingle();
    if (data) res = `ok:${data.name}`;
  }
  redirect(`/admin/eventos/${event}/inscritos?res=${encodeURIComponent(res)}`);
}
