import "server-only";
import { adminDb, publicDb } from "@/lib/cms/client";
import { EMPTY_DESIGN, normalizeDesign, type DesignConfig } from "./regions";

const PUBLISHED = "design_layout";
const PREVIOUS = "design_previous";
const draftKey = (actor: string) => `design_draft:${actor}`;

/** Diseño publicado (lectura pública con caché y etiqueta del CMS). Sin tabla o sin CMS: sin cambios. */
export async function getPublishedDesign(): Promise<DesignConfig> {
  const db = publicDb();
  if (!db) return EMPTY_DESIGN;
  const { data, error } = await db.from("site_settings").select("value").eq("key", PUBLISHED).maybeSingle();
  if (error || !data) return EMPTY_DESIGN;
  return normalizeDesign((data as { value: unknown }).value);
}

async function readKey(key: string): Promise<DesignConfig | null> {
  const db = adminDb();
  if (!db) return null;
  const { data, error } = await db.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error || !data) return null;
  return normalizeDesign((data as { value: unknown }).value);
}

export async function getEditorState(actor: string) {
  const [published, draft, previous] = await Promise.all([readKey(PUBLISHED), readKey(draftKey(actor)), readKey(PREVIOUS)]);
  const pub = published ?? EMPTY_DESIGN;
  return { published: pub, draft: draft ?? pub, hasDraft: Boolean(draft), canUndo: previous !== null };
}

async function upsert(key: string, value: DesignConfig, actor: string) {
  const db = adminDb();
  if (!db) return "El servidor no tiene la clave de servicio de Supabase.";
  const { error } = await db.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString(), updated_by: actor });
  return error ? `No se pudo guardar: ${error.message}. ¿Ejecutó docs/migraciones/001-site-settings.sql?` : null;
}

export const saveDraft = (actor: string, d: DesignConfig) => upsert(draftKey(actor), d, actor);

export async function publish(actor: string, d: DesignConfig) {
  const current = (await readKey(PUBLISHED)) ?? EMPTY_DESIGN;
  const e1 = await upsert(PREVIOUS, current, actor);
  if (e1) return e1;
  const e2 = await upsert(PUBLISHED, d, actor);
  if (e2) return e2;
  await adminDb()!.from("audit_log").insert({ actor, action: "publicar", entity: "diseno", summary: "Diseño del sitio" });
  return null;
}

export async function restorePrevious(actor: string) {
  const prev = await readKey(PREVIOUS);
  if (!prev) return { error: "No hay una publicación anterior para restaurar.", design: null };
  const current = (await readKey(PUBLISHED)) ?? EMPTY_DESIGN;
  const e1 = await upsert(PUBLISHED, prev, actor);
  if (e1) return { error: e1, design: null };
  await upsert(PREVIOUS, current, actor); // permite rehacer
  await upsert(draftKey(actor), prev, actor);
  await adminDb()!.from("audit_log").insert({ actor, action: "editar", entity: "diseno", summary: "Deshacer la última publicación del diseño" });
  return { error: null, design: prev };
}
