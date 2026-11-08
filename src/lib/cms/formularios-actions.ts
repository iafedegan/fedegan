"use server";

import { adminDb, MEDIA_BUCKET } from "./client";
import { buscarFormulario, textoRespuesta, type Respuesta } from "./formularios";

export type FormularioEstado = { ok?: boolean; message?: string };

const TIPOS_ARCHIVO = new Map([
  ["application/pdf", "pdf"], ["application/msword", "doc"], ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"], ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"], ["image/jpeg", "jpg"], ["image/png", "png"],
]);
const MAX_ARCHIVO = 10 * 1024 * 1024;
const linea = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^[+()\d][\d\s().+-]{4,38}$/;

// Solo direcciones públicas: nada de equipos de la red interna.
function destinoSeguro(url: string): URL | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h === "[::1]" || !h.includes(".")) return null;
    if (/^(10|127|0)\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Recibe lo que un visitante llenó en un formulario de una página: valida contra la definición publicada, guarda y avisa a la API. */
export async function enviarFormulario(_prev: FormularioEstado, fd: FormData): Promise<FormularioEstado> {
  if (linea(fd.get("sitio_web"), 80)) return { ok: true, message: "¡Gracias!" }; // campo trampa para robots
  const db = adminDb();
  if (!db) return { ok: false, message: "Los formularios no están disponibles por ahora." };
  const clave = linea(fd.get("clave"), 60);
  const form = await buscarFormulario(clave);
  if (!form) return { ok: false, message: "Este formulario ya no está disponible." };

  const respuestas: Respuesta[] = [];
  const subidas: { path: string; file: File; tipo: string }[] = [];
  for (let i = 0; i < form.preguntas.length; i++) {
    const p = form.preguntas[i];
    const nombre = `c${i}`;
    const falta = `Falta responder «${p.etiqueta}».`;
    let v: string | string[] = "";
    switch (p.tipo) {
      case "casillas": {
        const marcadas = fd.getAll(nombre).map((x) => String(x));
        if (marcadas.some((m) => !p.opciones.includes(m))) return { ok: false, message: `«${p.etiqueta}»: elija solo entre las opciones.` };
        if (p.requerido && marcadas.length === 0) return { ok: false, message: falta };
        v = marcadas;
        break;
      }
      case "archivo": {
        const f = fd.get(nombre);
        if (f instanceof File && f.size > 0) {
          const ext = TIPOS_ARCHIVO.get(f.type);
          if (!ext) return { ok: false, message: `«${p.etiqueta}»: use PDF, Word, Excel, JPG o PNG.` };
          if (f.size > MAX_ARCHIVO) return { ok: false, message: `«${p.etiqueta}»: el archivo supera 10 MB.` };
          const path = `formularios/${clave}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          subidas.push({ path, file: f, tipo: f.type });
          v = path;
        } else if (p.requerido) return { ok: false, message: falta };
        break;
      }
      default: {
        const t = p.tipo === "parrafo" ? String(fd.get(nombre) ?? "").trim().slice(0, 3000) : linea(fd.get(nombre), 300);
        if (!t) {
          if (p.requerido) return { ok: false, message: falta };
          break;
        }
        if (p.tipo === "correo" && !CORREO.test(t)) return { ok: false, message: `«${p.etiqueta}»: escriba un correo válido.` };
        if (p.tipo === "telefono" && !TELEFONO.test(t)) return { ok: false, message: `«${p.etiqueta}»: escriba un teléfono válido.` };
        if (p.tipo === "numero" && !/^-?\d+([.,]\d+)?$/.test(t)) return { ok: false, message: `«${p.etiqueta}»: escriba solo un número.` };
        if (p.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return { ok: false, message: `«${p.etiqueta}»: elija una fecha.` };
        if (p.tipo === "lista" && !p.opciones.includes(t)) return { ok: false, message: `«${p.etiqueta}»: elija una de las opciones.` };
        v = t;
      }
    }
    respuestas.push({ e: p.etiqueta, v });
  }

  for (const s of subidas) {
    const { error } = await db.storage.from(MEDIA_BUCKET).upload(s.path, await s.file.arrayBuffer(), { contentType: s.tipo });
    if (error) return { ok: false, message: "No se pudo cargar el archivo. Intente de nuevo." };
    const r = respuestas.find((x) => x.v === s.path);
    if (r) r.v = db.storage.from(MEDIA_BUCKET).getPublicUrl(s.path).data.publicUrl;
  }

  const pagina = linea(fd.get("pagina"), 200);
  const { data: fila, error } = await db.from("form_responses").insert({ form_key: clave, form_title: form.titulo, page: pagina, answers: respuestas }).select("id").single();
  if (error) return { ok: false, message: "No pudimos guardar su respuesta. Intente de nuevo más tarde." };

  // Aviso a la API del editor: si falla, la respuesta ya está guardada y se ve en el panel.
  const destino = form.webhook ? destinoSeguro(form.webhook) : null;
  if (destino) {
    let estado = "error";
    try {
      const res = await fetch(destino, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "FEDEGAN-Formularios/1.0" },
        body: JSON.stringify({
          formulario: clave, titulo: form.titulo, pagina, enviado: new Date().toISOString(),
          respuestas: Object.fromEntries(respuestas.map((r) => [r.e, r.v])),
          lista: respuestas.map((r) => ({ pregunta: r.e, respuesta: textoRespuesta(r.v) })),
        }),
        redirect: "error",
        signal: AbortSignal.timeout(6000),
      });
      estado = res.ok ? "ok" : `http ${res.status}`;
    } catch {
      estado = "error";
    }
    await db.from("form_responses").update({ webhook: estado }).eq("id", fila.id);
  }
  return { ok: true, message: form.gracias };
}
