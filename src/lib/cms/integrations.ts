import "server-only";
import { adminDb } from "./client";
import { decryptSecret, encryptSecret, secretsAvailable } from "./secrets";

// Claves de API gestionadas desde /admin/apis. Se guardan cifradas en site_settings
// (clave "api_secret:<id>"), una tabla que el público no puede leer: solo la clave de servicio.

export type IntegrationId = "contexto";

const settingKey = (id: IntegrationId) => `api_secret:${id}`;
const TTL_MS = 60_000;
const cache = new Map<IntegrationId, { at: number; secret: string | null }>();

type Stored = { v: string; hint: string };

async function readRow(id: IntegrationId) {
  const db = adminDb();
  if (!db) return null;
  const { data, error } = await db.from("site_settings").select("value,updated_at,updated_by").eq("key", settingKey(id)).maybeSingle();
  if (error || !data) return null;
  return data as { value: Stored; updated_at: string; updated_by: string | null };
}

/** Clave guardada desde el panel, ya descifrada (con caché breve en memoria). Solo en el servidor. */
export async function getStoredSecret(id: IntegrationId): Promise<string | null> {
  if (!secretsAvailable) return null;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.secret;
  const row = await readRow(id);
  const secret = row?.value?.v ? decryptSecret(row.value.v) : null;
  cache.set(id, { at: Date.now(), secret });
  return secret;
}

/** Datos para mostrar en el panel, sin la clave. */
export async function getStoredMeta(id: IntegrationId) {
  const row = await readRow(id);
  if (!row?.value?.v) return null;
  return { hint: row.value.hint, updatedAt: row.updated_at, updatedBy: row.updated_by, readable: decryptSecret(row.value.v) !== null };
}

export async function saveStoredSecret(id: IntegrationId, plain: string, actor: string): Promise<string | null> {
  const db = adminDb();
  if (!db) return "El servidor no tiene la clave de servicio de Supabase.";
  if (!secretsAvailable) return "Falta AUTH_SECRET en el servidor para cifrar la clave.";
  const value: Stored = { v: encryptSecret(plain), hint: plain.slice(-4) };
  const { error } = await db.from("site_settings").upsert({ key: settingKey(id), value, updated_at: new Date().toISOString(), updated_by: actor });
  if (error) return `No se pudo guardar: ${error.message}. ¿Ejecutó docs/migraciones/001-site-settings.sql?`;
  cache.delete(id);
  return null;
}

export async function removeStoredSecret(id: IntegrationId): Promise<string | null> {
  const db = adminDb();
  if (!db) return "El servidor no tiene la clave de servicio de Supabase.";
  const { error } = await db.from("site_settings").delete().eq("key", settingKey(id));
  if (error) return `No se pudo quitar: ${error.message}`;
  cache.delete(id);
  return null;
}
