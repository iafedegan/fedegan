import "server-only";
import { randomInt } from "node:crypto";
import { adminDb } from "./client";
import { leerForm, type FormEvento, type Respuesta } from "./inscripcion-form";

export type Inscripcion = {
  id: string;
  event_id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  organization: string | null;
  checked_in_at: string | null;
  created_at: string;
  answers?: Respuesta[] | null;
  webhook?: string | null;
};

// Sin 0/O/1/I para que el código se lea y se dicte sin confusiones.
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function nuevoCodigo() {
  let c = "";
  for (let i = 0; i < 8; i++) c += ABC[randomInt(ABC.length)];
  return `FED-${c}`;
}

export async function inscritosDe(eventId: string): Promise<Inscripcion[]> {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("event_registrations").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
  return (data ?? []) as Inscripcion[];
}

export async function inscripcionPorCodigo(code: string): Promise<(Inscripcion & { event_slug?: string }) | null> {
  const db = adminDb();
  if (!db || !/^FED-[A-Z0-9]{8}$/.test(code)) return null;
  const { data } = await db.from("event_registrations").select("*, events(slug)").eq("code", code).maybeSingle();
  if (!data) return null;
  const { events, ...rest } = data as Inscripcion & { events?: { slug?: string } | null };
  return { ...rest, event_slug: events?.slug };
}

export async function conteoInscritos(eventId: string) {
  const db = adminDb();
  if (!db) return 0;
  const { count } = await db.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", eventId);
  return count ?? 0;
}

/** ¿Existe la tabla de inscripciones y el servidor puede usarla? Si no, el formulario público no se muestra. */
export async function inscripcionesDisponibles() {
  const db = adminDb();
  if (!db) return false;
  const { error } = await db.from("event_registrations").select("id", { head: true, count: "exact" }).limit(1);
  return !error;
}

/** El formulario de inscripción de un evento (por su identificador): el que armó el editor o el de siempre si no hay uno. */
export async function formularioDe(slug: string): Promise<FormEvento & { personalizado: boolean }> {
  const db = adminDb();
  const { data } = db ? await db.from("events").select("reg_form").eq("slug", slug).maybeSingle() : { data: null };
  const raw = (data as { reg_form?: unknown } | null)?.reg_form ?? null;
  return { ...leerForm(raw), personalizado: raw !== null };
}

/** Igual que formularioDe, pero por el id del evento (el editor). */
export async function formularioPorId(id: string): Promise<FormEvento> {
  const db = adminDb();
  const { data } = db ? await db.from("events").select("reg_form").eq("id", id).maybeSingle() : { data: null };
  return leerForm((data as { reg_form?: unknown } | null)?.reg_form ?? null);
}
