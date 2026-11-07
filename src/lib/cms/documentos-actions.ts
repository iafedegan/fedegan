"use server";

import { auth } from "@/auth";
import { hasAnyRole } from "@/lib/access";
import { adminDb } from "./client";
import { EDITOR_ROLES } from "./guard";

// Subida de documentos de las páginas (PDF, Excel, Word, PowerPoint, CSV, ZIP, audio) al depósito «documentos».
// El archivo no pasa por el servidor del portal (Vercel limita el tamaño de cada petición): el servidor valida
// y firma una dirección de subida, y el navegador envía el archivo directo a Supabase.

const DOCS_BUCKET = "documentos";
const MAX_MB = 50;

const TIPOS: Record<string, string> = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  zip: "application/zip",
  mp3: "audio/mpeg",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export type Subida = { ok: true; signedUrl: string; publicUrl: string; contentType: string } | { ok: false; message: string };

const slug = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "documento";

/** Firma la subida de un documento. `carpeta` agrupa los archivos por página (por ejemplo, su ruta). */
export async function prepararSubida(input: { nombre: string; tamano: number; carpeta: string }): Promise<Subida> {
  const s = await auth();
  if (!s?.user || !hasAnyRole(s.user.roles, EDITOR_ROLES)) return { ok: false, message: "Su usuario no puede subir documentos." };
  const db = adminDb();
  if (!db) return { ok: false, message: "El servidor no tiene la clave de servicio de Supabase." };

  const nombre = String(input.nombre ?? "");
  const ext = (nombre.split(".").pop() ?? "").toLowerCase();
  const contentType = TIPOS[ext];
  if (!contentType || !nombre.includes(".")) return { ok: false, message: `«${nombre}»: formato no permitido. Use PDF, Excel, Word, PowerPoint, CSV, ZIP, MP3, JPG o PNG.` };
  if (!(input.tamano > 0) || input.tamano > MAX_MB * 1024 * 1024) return { ok: false, message: `«${nombre}» supera ${MAX_MB} MB.` };

  const base = slug(nombre.replace(/\.[^.]+$/, ""));
  const anio = new Date().getFullYear();
  const path = `${slug(String(input.carpeta ?? "general"))}/${anio}/${base}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { data, error } = await db.storage.from(DOCS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    const msg = error?.message ?? "";
    if (/not found|bucket/i.test(msg)) return { ok: false, message: "Falta crear el depósito de documentos: ejecute docs/migraciones/012-documentos.sql en Supabase." };
    return { ok: false, message: `No se pudo preparar la subida (${msg || "sin detalle"}).` };
  }
  const { data: pub } = db.storage.from(DOCS_BUCKET).getPublicUrl(path);
  await db.from("audit_log").insert({ actor: s.user.email ?? s.user.name ?? "editor", action: "crear", entity: "documentos", summary: `Subida preparada: «${nombre}» → ${path}` });
  return { ok: true, signedUrl: data.signedUrl, publicUrl: pub.publicUrl, contentType };
}
