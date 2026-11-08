// Utilidades puras (sin servidor) para copiar los documentos (y las imágenes de contenido) migrados a Supabase y usar la copia en el contenido.

export const MAX_COPIA = 50 * 1024 * 1024; // el depósito «documentos» admite hasta 50 MB por archivo

const EXT = /\.(pdf|xlsx?|xlsm|docx?|pptx?|zip|rar|csv|mp3|m4a|jpe?g|png)$/i;

const TIPOS: Record<string, string> = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
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

// Solo se copian archivos del propio FEDEGÁN (su almacenamiento en Google y sus sitios); lo de terceros se deja enlazado.
export function esOrigenPropio(u: URL): boolean {
  const h = u.hostname.toLowerCase();
  if (h === "storage.googleapis.com") return u.pathname.startsWith("/static-fedegan/");
  return h === "fedegan.org.co" || h.endsWith(".fedegan.org.co") || h === "static.fedegan.org.co.s3.amazonaws.com";
}

/** Dirección normalizada (misma forma que se guarda y que se busca). null si no es un documento copiable. */
export function normalizarOrigen(raw: string): string | null {
  try {
    const u = new URL(raw.trim().replace(/&amp;/g, "&"));
    if (!/^https?:$/.test(u.protocol) || !EXT.test(decodeURIComponent(u.pathname)) || !esOrigenPropio(u)) return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

export function extensionDe(origen: string): string {
  return (EXT.exec(decodeURIComponent(new URL(origen).pathname))?.[1] ?? "pdf").toLowerCase();
}

export function tipoMime(origen: string): string {
  return TIPOS[extensionDe(origen)] ?? "application/octet-stream";
}

function hash(s: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}

/** Ruta dentro del depósito: «migrados/<huella>-<nombre>.<ext>» (la huella evita choques entre archivos con el mismo nombre). */
export function rutaDeCopia(origen: string): string {
  const path = decodeURIComponent(new URL(origen).pathname);
  const base = (path.split("/").pop() ?? "documento").replace(EXT, "");
  const nombre =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "documento";
  return `migrados/${hash(origen)}-${nombre}.${extensionDe(origen)}`;
}

type Bloque = { t: string; text?: string; rows?: string[][]; data?: Record<string, unknown> };

/** Dirección copiable de una imagen del contenido (bloque «image»), si es del propio FEDEGÁN. */
const origenDeImagen = (b: Bloque): string | null => (b.t === "image" && typeof b.data?.src === "string" ? normalizarOrigen(b.data.src) : null);

/** Todas las direcciones de documentos copiables que aparecen en un conjunto de bloques. */
export function origenesEnBloques(blocks: Bloque[], out: Set<string> = new Set()): Set<string> {
  const ver = (s?: string) => {
    if (!s) return;
    for (const m of s.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      const o = normalizarOrigen(m[1]);
      if (o) out.add(o);
    }
  };
  for (const b of blocks) {
    ver(b.text);
    b.rows?.forEach((r) => r.forEach(ver));
    if (b.t === "embed") {
      const o = b.text ? normalizarOrigen(b.text) : null;
      if (o) out.add(o);
    }
    const img = origenDeImagen(b);
    if (img) out.add(img);
  }
  return out;
}

/** Cambia, en los enlaces de los bloques, cada documento original por su copia en Supabase (si ya está copiado). */
export function aplicarCopias<T extends Bloque>(blocks: T[], copias: ReadonlyMap<string, string>): T[] {
  if (copias.size === 0) return blocks;
  const sub = (s: string) =>
    s.replace(/\]\((https?:\/\/[^)\s]+)\)/g, (todo, url: string) => {
      const o = normalizarOrigen(url);
      const nuevo = o ? copias.get(o) : undefined;
      return nuevo ? `](${nuevo.replace(/\(/g, "%28").replace(/\)/g, "%29")})` : todo;
    });
  return blocks.map((b) => {
    if (b.t === "embed") return b;
    if (b.t === "image") {
      const o = origenDeImagen(b);
      const nuevo = o ? copias.get(o) : undefined;
      return nuevo ? ({ ...b, data: { ...b.data, src: nuevo } } as T) : b;
    }
    const out: T = { ...b };
    if (b.text) out.text = sub(b.text);
    if (b.rows) out.rows = b.rows.map((r) => r.map(sub));
    return out;
  });
}
