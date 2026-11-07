"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getLegacyPage } from "@/content/legacy";
import { adminDb, CMS_TAG } from "./client";
import { requireEditorActor } from "./guard";
import { sanearBloques } from "./bloques";

export type PaginaState = { ok?: boolean; message?: string };

export async function savePagina(_prev: PaginaState, fd: FormData): Promise<PaginaState> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: "El servidor no tiene la clave de servicio de Supabase (SUPABASE_SERVICE_ROLE_KEY)." };

  const key = String(fd.get("key") ?? "");
  const original = getLegacyPage(key);
  if (!original) return { ok: false, message: "La página no existe." };

  const title = String(fd.get("title") ?? "").trim();
  if (!title || title.length > 200) return { ok: false, message: "El título es obligatorio (máximo 200 caracteres)." };

  const crudo = fd.get("bloques");
  let parsed: unknown;
  try {
    parsed = JSON.parse(typeof crudo === "string" ? crudo : "");
  } catch {
    return { ok: false, message: "El contenido de la página no es válido. Recargue la página e intente de nuevo." };
  }
  const r = sanearBloques(parsed);
  if (!r.ok) return { ok: false, message: r.message };
  const blocks = r.bloques;

  const { error } = await db.from("legacy_pages").upsert({ key, title, blocks, updated_by: actor });
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}. ¿Ejecutó docs/migraciones/010-paginas-editables.sql?` };
  await db.from("audit_log").insert({ actor, action: "editar", entity: "paginas", entity_id: key, summary: title });
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  return { ok: true, message: "Guardado. El cambio ya se ve en el sitio." };
}

export async function restorePagina(fd: FormData) {
  const actor = await requireEditorActor();
  const key = String(fd.get("key") ?? "");
  const db = adminDb();
  if (!db || !getLegacyPage(key)) redirect("/admin/paginas");
  await db.from("legacy_pages").delete().eq("key", key);
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: "paginas", entity_id: key, summary: "Texto original restaurado" });
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  redirect(`/admin/paginas/editar/${key.split("/").map(encodeURIComponent).join("/")}?restaurada=1`);
}
