import "server-only";
import { cache } from "react";
import { publicDb, readDb } from "./client";
import type { LegacyBlockLite } from "./paginas-texto";

// Texto editado desde /admin/paginas para una página migrada. Sin fila (o sin CMS) se usa la copia original.

export type PageOverride = { title: string; blocks: LegacyBlockLite[] };

export const getPageOverride = cache(async (key: string): Promise<PageOverride | null> => {
  const db = publicDb();
  if (!db) return null;
  try {
    const { data, error } = await db.from("legacy_pages").select("title,blocks").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return { title: String(data.title), blocks: Array.isArray(data.blocks) ? (data.blocks as LegacyBlockLite[]) : [] };
  } catch {
    return null;
  }
});

export type OverrideInfo = { updated_at: string; updated_by: string | null };

/** Qué páginas tienen texto editado (para la lista del panel). */
export async function listOverrides(): Promise<{ map: Map<string, OverrideInfo>; tableReady: boolean }> {
  const { db } = readDb();
  const map = new Map<string, OverrideInfo>();
  if (!db) return { map, tableReady: false };
  const { data, error } = await db.from("legacy_pages").select("key,updated_at,updated_by");
  if (error) return { map, tableReady: false };
  for (const r of data ?? []) map.set(String(r.key), { updated_at: String(r.updated_at), updated_by: (r.updated_by as string | null) ?? null });
  return { map, tableReady: true };
}
