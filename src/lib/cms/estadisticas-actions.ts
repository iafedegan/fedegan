"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { CMS_TAG } from "./client";
import { requireEditorActor } from "./guard";
import { iframeDe } from "@/lib/estadisticas/url";
import { borrarConjunto, guardarConjunto, slugConjunto, traerHtml } from "./estadisticas";

const txt = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);
const volver = (qs: string): never => redirect(`/admin/estadisticas?${qs}`);

/** Guarda un conjunto de cifras con el HTML pegado, con un archivo .html o traído de una dirección del sistema de estadísticas. */
export async function importarCifras(fd: FormData) {
  const actor = await requireEditorActor();
  const titulo = txt(fd.get("titulo"), 80);
  let origen = txt(fd.get("url"), 300);
  if (!titulo) volver("error=" + encodeURIComponent("Escriba el nombre del conjunto (por ejemplo, General)."));
  let html = String(fd.get("html") ?? "");
  const archivo = fd.get("archivo");
  // Si lo pegado es un iframe, se usa su contenido (srcdoc) o se trae la página a la que apunta (src).
  const iframe = html.trim() ? iframeDe(html) : null;
  if (iframe?.srcdoc) html = iframe.srcdoc;
  else if (iframe?.src) {
    origen = iframe.src;
    html = "";
  }
  if (!html.trim() && archivo instanceof File && archivo.size > 0) html = new TextDecoder("windows-1252").decode(await archivo.arrayBuffer());
  if (!html.trim() && origen) {
    const r = await traerHtml(origen);
    if ("error" in r) volver("error=" + encodeURIComponent(r.error));
    else html = r.html;
  }
  if (!html.trim()) volver("error=" + encodeURIComponent("Pegue el HTML, suba el archivo o escriba la dirección del sistema de estadísticas."));
  const orden = Number(fd.get("orden")) || 50;
  const res = await guardarConjunto({ id: slugConjunto(titulo), titulo, orden, origen: origen || undefined, html, actor });
  if ("error" in res) volver("error=" + encodeURIComponent(res.error));
  updateTag(CMS_TAG);
  revalidatePath("/seccion/cifras-del-sector");
  revalidatePath("/admin/estadisticas");
  if ("ok" in res) volver(`ok=${encodeURIComponent(`${titulo}: ${res.total} indicadores (${res.conDatos} con gráfica)`)}`);
}

export async function eliminarCifras(fd: FormData) {
  await requireEditorActor();
  const id = slugConjunto(txt(fd.get("id"), 80));
  if (id) await borrarConjunto(id);
  updateTag(CMS_TAG);
  revalidatePath("/seccion/cifras-del-sector");
  volver("ok=" + encodeURIComponent("Conjunto eliminado"));
}
