"use server";

import { adminDb, MEDIA_BUCKET } from "./client";

const TIPOS = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);
const MAX = 10 * 1024 * 1024;

export type SubirState = { ok?: boolean; message?: string };

/** Recibe documentos de los visitantes y los guarda en `recibidos/` del almacenamiento. */
export async function subirDocumentos(_prev: SubirState, fd: FormData): Promise<SubirState> {
  const db = adminDb();
  if (!db) return { ok: false, message: "La carga de documentos no está disponible por ahora." };
  const archivos = fd.getAll("archivos").filter((f): f is File => f instanceof File && f.size > 0);
  if (archivos.length === 0) return { ok: false, message: "Elija al menos un documento." };
  if (archivos.length > 5) return { ok: false, message: "Puede cargar hasta 5 documentos a la vez." };
  const pagina = String(fd.get("pagina") ?? "").replace(/[^a-z0-9/_-]/gi, "").slice(0, 80) || "pagina";
  for (const f of archivos) {
    if (!TIPOS.has(f.type)) return { ok: false, message: `«${f.name}»: use PDF, Word, Excel, JPG o PNG.` };
    if (f.size > MAX) return { ok: false, message: `«${f.name}» supera 10 MB.` };
  }
  for (const f of archivos) {
    const path = `recibidos/${pagina.replace(/\//g, "_")}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${TIPOS.get(f.type)}`;
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, await f.arrayBuffer(), { contentType: f.type });
    if (error) return { ok: false, message: "No se pudo cargar el documento. Intente de nuevo." };
  }
  return { ok: true, message: archivos.length === 1 ? "Documento recibido. ¡Gracias!" : `${archivos.length} documentos recibidos. ¡Gracias!` };
}
