"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { contextoCredentials } from "@/lib/contexto";
import { adminDb, CMS_TAG, publicDb } from "./client";
import { EDITOR_ROLES } from "./guard";
import { removeStoredSecret, saveStoredSecret } from "./integrations";
import { secretsAvailable } from "./secrets";

export type ApiState = { ok?: boolean; message?: string };

async function session() {
  const s = await auth();
  if (!s?.user) redirect("/ingresar");
  return s.user;
}

async function requireEditor() {
  const u = await session();
  if (!hasAnyRole(u.roles, EDITOR_ROLES)) redirect("/admin");
  return u.email ?? u.name ?? "editor";
}

// Cambiar claves es más sensible que editar contenido: solo administradores del portal.
async function requireAdmin() {
  const u = await session();
  if (!hasAnyRole(u.roles, [ROLES.portalAdmin])) return null;
  return u.email ?? u.name ?? "admin";
}

/** Llama a la API de CONtexto con una clave y resume el resultado (nunca devuelve la clave). */
async function pingContexto(base: string, key: string): Promise<ApiState> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${base}/articulos?limite=1`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const ms = Date.now() - t0;
    if (res.ok) return { ok: true, message: `Conectada · respondió en ${ms} ms` };
    if (res.status === 401 || res.status === 403) return { ok: false, message: "CONtexto rechazó la clave (401). Verifique que sea una clave de la API pública." };
    if (res.status === 429) return { ok: false, message: "CONtexto limitó las consultas (429). Intente de nuevo en unos minutos." };
    return { ok: false, message: `CONtexto respondió con el estado ${res.status}.` };
  } catch {
    return { ok: false, message: "No hubo conexión con la API de CONtexto." };
  }
}

export async function testApi(_prev: ApiState, fd: FormData): Promise<ApiState> {
  await requireEditor();
  const id = String(fd.get("id") ?? "");

  if (id === "contexto") {
    const { base, key } = await contextoCredentials();
    if (!key) return { ok: false, message: "No hay ninguna clave configurada." };
    return pingContexto(base, key);
  }

  if (id === "supabase") {
    const pub = publicDb();
    if (!pub) return { ok: false, message: "Falta SUPABASE_URL o la clave pública en el servidor." };
    const t0 = Date.now();
    const { error } = await pub.from("nav_items").select("id", { head: true, count: "exact" });
    if (error) return { ok: false, message: `La base respondió con un error: ${error.message}` };
    const write = adminDb() ? "con permiso de escritura" : "solo lectura (falta la clave de servicio)";
    return { ok: true, message: `Conectada · ${write} · ${Date.now() - t0} ms` };
  }

  return { ok: false, message: "Conexión desconocida." };
}

export async function saveApiKey(_prev: ApiState, fd: FormData): Promise<ApiState> {
  const actor = await requireAdmin();
  if (!actor) return { ok: false, message: "Solo los administradores del portal pueden cambiar claves." };
  if (String(fd.get("id")) !== "contexto") return { ok: false, message: "Conexión desconocida." };
  if (!adminDb()) return { ok: false, message: "El servidor no tiene la clave de servicio de Supabase." };
  if (!secretsAvailable) return { ok: false, message: "Falta AUTH_SECRET en el servidor para cifrar la clave." };

  const key = String(fd.get("key") ?? "").trim();
  if (key.length < 12 || key.length > 200 || /\s/.test(key)) return { ok: false, message: "La clave no tiene un formato válido." };

  // Solo se guarda si CONtexto la acepta, para no dejar el sitio sin noticias por una clave equivocada.
  const { base } = await contextoCredentials();
  const check = await pingContexto(base, key);
  if (!check.ok) return { ok: false, message: `No se guardó. ${check.message}` };

  const error = await saveStoredSecret("contexto", key, actor);
  if (error) return { ok: false, message: error };
  await adminDb()!.from("audit_log").insert({ actor, action: "editar", entity: "apis", summary: "Clave de CONtexto actualizada" });
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  return { ok: true, message: `Clave guardada y verificada · ${(check.message ?? "").replace("Conectada · ", "")}` };
}

export async function removeApiKey(fd: FormData) {
  const actor = await requireAdmin();
  if (!actor || String(fd.get("id")) !== "contexto") redirect("/admin/apis");
  await removeStoredSecret("contexto");
  await adminDb()?.from("audit_log").insert({ actor, action: "eliminar", entity: "apis", summary: "Clave de CONtexto quitada del panel" });
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  redirect("/admin/apis");
}
