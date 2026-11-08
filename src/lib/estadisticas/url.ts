// Direcciones y fragmentos que FEDEGÁN envía para cargar cifras: un iframe (con `src` o `srcdoc`) o la dirección de una página.
// Puro (sin servidor): se prueba aparte.

const ENT: Record<string, string> = { quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", nbsp: " " };
const desescapar = (s: string) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);

/** Si el texto pegado es un iframe, devuelve su dirección (`src`) o el HTML que lleva dentro (`srcdoc`). Si es una página completa, null. */
export function iframeDe(texto: string): { src?: string; srcdoc?: string } | null {
  const t = texto.trim();
  if (!/^<iframe\b/i.test(t) && !(t.length < 4000 && /<iframe\b/i.test(t) && !/<form[^>]*name=["']doc\d+/i.test(t))) return null;
  const atributo = (nombre: string) => {
    const m = new RegExp(`\\b${nombre}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(t);
    return m ? m[1] ?? m[2] : undefined;
  };
  const srcdoc = atributo("srcdoc");
  if (srcdoc) return { srcdoc: desescapar(srcdoc) };
  const src = atributo("src");
  return src ? { src: desescapar(src.trim()) } : null;
}

/** ¿Es un nombre de sitio público? Rechaza localhost, direcciones internas, números IP y puertos raros (el servidor no debe poder consultar su propia red). */
export function hostPublico(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (!h.includes(".") || h.includes(":") || h.includes("[")) return false;
  if (h === "localhost" || /\.(local|localhost|internal|lan|home|corp)$/.test(h)) return false;
  if (/^[\d.]+$/.test(h)) return false; // direcciones IPv4 escritas con números
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(h);
}

/** Dirección permitida para traer cifras: https, sitio público y puerto normal. */
export function urlPermitida(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443") || !hostPublico(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}
