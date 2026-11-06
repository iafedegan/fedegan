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

/** Sube una imagen del editor (banner de portada, anuncios) al almacenamiento y devuelve su dirección pública. */
export async function subirImagenDiseno(fd: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await actor())) return { error: "Sin permiso para subir imágenes." };
  const db = adminDb();
  if (!db) return { error: "El servidor no tiene la clave de servicio de Supabase." };
  const file = fd.get("archivo");
  if (!(file instanceof File) || file.size === 0) return { error: "Elija una imagen." };
  const ext = TIPOS.get(file.type);
  if (!ext) return { error: "Use una imagen JPG, PNG, WebP, AVIF o GIF." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen supera 5 MB." };
  const path = `diseno/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type });
  if (error) return { error: `No se pudo subir: ${error.message}` };
  return { url: publicMediaUrl(path) };
}
