import "server-only";
import { randomInt } from "node:crypto";
import { adminDb } from "./client";

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
