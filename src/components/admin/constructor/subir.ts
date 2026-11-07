import { prepararSubida } from "@/lib/cms/documentos-actions";

export type ResultadoSubida = { ok: true; url: string; nombre: string } | { ok: false; message: string };

/**
 * Sube un archivo al depósito «documentos». El servidor valida el nombre y el tamaño y firma una dirección de subida;
 * el archivo viaja directo del navegador a Supabase (Vercel limita el tamaño de cada petición al servidor).
 */
export async function subirArchivo(file: File, carpeta: string): Promise<ResultadoSubida> {
  const r = await prepararSubida({ nombre: file.name, tamano: file.size, carpeta });
  if (!r.ok) return { ok: false, message: r.message };
  try {
    const res = await fetch(r.signedUrl, { method: "PUT", body: file, headers: { "content-type": r.contentType, "x-upsert": "false", "cache-control": "max-age=3600" } });
    if (!res.ok) throw new Error(String(res.status));
  } catch (e) {
    return { ok: false, message: `«${file.name}» no se pudo subir (${e instanceof Error ? e.message : "error"}).` };
  }
  return { ok: true, url: r.publicUrl, nombre: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") };
}
