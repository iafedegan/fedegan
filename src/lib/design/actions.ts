"use server";

import { updateTag } from "next/cache";
import { getEditor } from "@/lib/cms/guard";
import { adminDb, CMS_TAG, MEDIA_BUCKET, publicMediaUrl } from "@/lib/cms/client";
import { normalizeDesign, type DesignConfig } from "./regions";
import { publish, restorePrevious, saveDraft } from "./store";

export type DesignResult = { error?: string; design?: DesignConfig };

async function actor() {
  const ed = await getEditor();
  return ed?.actor ?? null;
}

export async function saveDesignDraft(raw: unknown): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para editar el diseño." };
  const design = normalizeDesign(raw);
  const err = await saveDraft(a, design);
  return err ? { error: err } : { design };
}

export async function publishDesign(raw: unknown): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para publicar el diseño." };
  const design = normalizeDesign(raw);
  const err = await publish(a, design);
  if (err) return { error: err };
  updateTag(CMS_TAG);
  return { design };
}

export async function undoDesignPublish(): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para editar el diseño." };
  const r = await restorePrevious(a);
  if (r.error || !r.design) return { error: r.error ?? "No se pudo deshacer." };
  updateTag(CMS_TAG);
  return { design: r.design };
}

const TIPOS = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/gif", "gif"], ["image/avif", "avif"]]);

export type SubidaImagen = { ok: true; signedUrl: string; publicUrl: string; contentType: string } | { ok: false; message: string };

/** Firma una subida directa de imagen a Supabase: el archivo no pasa por el servidor del portal (que limita el tamaño de cada petición). */
export async function prepararSubidaImagen(input: { nombre: string; tamano: number; tipo: string }): Promise<SubidaImagen> {
  if (!(await actor())) return { ok: false, message: "Sin permiso para subir imágenes." };
  const db = adminDb();
  if (!db) return { ok: false, message: "El servidor no tiene la clave de servicio de Supabase." };
  const ext = TIPOS.get(String(input.tipo ?? ""));
  if (!ext || ext === "gif") return { ok: false, message: "Use una imagen JPG, PNG, WebP o AVIF." };
  if (!(input.tamano > 0) || input.tamano > 5 * 1024 * 1024) return { ok: false, message: `La imagen pesa ${(input.tamano / 1048576).toFixed(1)} MB y el máximo es 5 MB. Redúzcala o expórtela en WebP/AVIF.` };
  const path = `diseno/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await db.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, message: `No se pudo preparar la subida (${error?.message ?? "sin detalle"}).` };
  return { ok: true, signedUrl: data.signedUrl, publicUrl: publicMediaUrl(path), contentType: input.tipo };
}
