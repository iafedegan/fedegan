"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminDb } from "./client";
import { requireEditorActor } from "./guard";
import { nuevoCodigo } from "./inscripciones";

export type InscripcionEstado = { error?: string };

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/** Inscripción pública a un evento: valida, genera el código y lleva a la confirmación con el QR. */
export async function inscribirse(_prev: InscripcionEstado, fd: FormData): Promise<InscripcionEstado> {
  // Campo trampa: los robots lo llenan, las personas no lo ven.
  if (clean(fd.get("sitio_web"), 80)) return {};
  const db = adminDb();
  if (!db) return { error: "Las inscripciones aún no están habilitadas. Intente más tarde." };

  const slug = clean(fd.get("slug"), 120);
  const name = clean(fd.get("name"), 120);
  const email = clean(fd.get("email"), 160).toLowerCase();
  const phone = clean(fd.get("phone"), 30);
  const document = clean(fd.get("document"), 30);
  const organization = clean(fd.get("organization"), 120);
  if (name.length < 3) return { error: "Escriba su nombre completo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Escriba un correo válido." };

  const { data: ev } = await db.from("events").select("id,starts_on").eq("slug", slug).eq("published", true).maybeSingle();
  if (!ev) return { error: "No encontramos el evento." };

  const { data: ya } = await db.from("event_registrations").select("code").eq("event_id", ev.id).ilike("email", email).maybeSingle();
  if (ya) redirect(`/eventos/${slug}/inscrito/${ya.code}`);

  for (let i = 0; i < 4; i++) {
    const code = nuevoCodigo();
    const { error } = await db.from("event_registrations").insert({
      event_id: ev.id, code, name, email, phone: phone || null, document: document || null, organization: organization || null,
    });
    if (!error) redirect(`/eventos/${slug}/inscrito/${code}`);
    if (error.code !== "23505") return { error: "No pudimos registrar su inscripción. Intente de nuevo." };
  }
  return { error: "No pudimos registrar su inscripción. Intente de nuevo." };
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
