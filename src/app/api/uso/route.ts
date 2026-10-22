import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { adminDb } from "@/lib/cms/client";

export const dynamic = "force-dynamic";

const SECCIONES = new Set(["programas", "normatividad", "publicaciones", "cifras", "fng", "fep", "sig", "noticias", "aliado-tvgan", "aliado-fundagan", "aliado-bursagan", "aliado-maestro-de-la-carne", "aliado-colombian-beef"]);
const VISITANTE = "fedegan-visitante";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Uso del portal por lector. Solo guarda si la persona aceptó (cookie fedegan-consent=1); el identificador es un
// número aleatorio en una cookie propia, sin datos personales ni dirección MAC.
export async function POST(req: Request) {
  const jar = await cookies();
  if (jar.get("fedegan-consent")?.value !== "1") return new Response(null, { status: 204 });
  const body = (await req.json().catch(() => null)) as { seccion?: string } | null;
  if (!body?.seccion || !SECCIONES.has(body.seccion)) return new Response(null, { status: 400 });

  let id = jar.get(VISITANTE)?.value;
  if (!id || !UUID.test(id)) {
    id = randomUUID();
    jar.set(VISITANTE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  const db = adminDb();
  if (db) await db.rpc("registrar_uso", { p_visitor: id, p_seccion: body.seccion });
  return new Response(null, { status: 204 });
}

// Derecho de supresión: borra todo lo guardado de este visitante y su identificador.
export async function DELETE() {
  const jar = await cookies();
  const id = jar.get(VISITANTE)?.value;
  const db = adminDb();
  if (id && UUID.test(id) && db) await db.from("portal_uso").delete().eq("visitor_id", id);
  jar.delete(VISITANTE);
  return new Response(null, { status: 204 });
}
