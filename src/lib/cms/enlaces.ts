// Enlaces y limpieza de texto que comparten el constructor de páginas (bloques.ts) y sus elementos (elementos.ts).
// Módulo suelto, sin importar nada: se prueba con Node y lo usan el navegador y el servidor.

const SEGURO = String.raw`[^\s"'<>\\]`;
/** Enlaces de botones, tarjetas y documentos: https://, http://, una ruta del portal, un ancla, correo o teléfono. */
export const ENLACE_OK = new RegExp(`^(https?://${SEGURO}+|/(?!/)${SEGURO}*|#${SEGURO}*|mailto:${SEGURO}+|tel:\\+?[0-9 ()-]{5,25})$`, "i");
/** Imágenes: solo https:// o una ruta del portal. */
export const IMAGEN_OK = new RegExp(`^(https://${SEGURO}+|/(?!/)${SEGURO}*)$`);
/** Contenido incrustado: https:// o http://. Solo los videos de YouTube se incrustan (siempre por https); lo demás se muestra como enlace. */
export const EMBED_OK = new RegExp(`^https?://${SEGURO}+$`, "i");

/** Enlaces que entiende el texto de la página: [palabras](https://…) o [palabras](/ruta). */
export const ENLACE_TEXTO = /^(https?:\/\/[^)\s]+|\/[^)\s]*)$/;
/** «fedegan.org.co» → «https://fedegan.org.co»; un correo → «mailto:»; lo demás queda como está. */
export function normalizarUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(u)) return u;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(u)) return `mailto:${u}`;
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(u)) return `https://${u}`;
  return u;
}

/** Enlaces de YouTube (watch, youtu.be, shorts, playlist) → la dirección para incrustar. */
export function normalizarVideo(raw: string): string {
  const u = normalizarUrl(raw);
  try {
    const x = new URL(u);
    const host = x.hostname.replace(/^(www|m)\./, "");
    const embed = (id: string) => `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    if (host === "youtu.be") {
      const id = x.pathname.split("/")[1];
      if (id) return embed(id);
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = x.searchParams.get("v");
      const list = x.searchParams.get("list");
      if (x.pathname === "/watch" && v) return embed(v);
      if (x.pathname === "/playlist" && list) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`;
      const [, kind, id] = x.pathname.split("/");
      if ((kind === "shorts" || kind === "live") && id) return embed(id);
    }
  } catch {
    /* no es una dirección completa: se devuelve tal cual */
  }
  return u;
}

export const linea = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
export const parrafos = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim().slice(0, max) : "");
export const texto = (v: unknown) => (typeof v === "string" ? v : "");
export const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
