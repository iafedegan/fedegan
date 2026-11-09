// ¿Puede el sistema de pagos mostrarse dentro de un iframe del portal? Lo deciden las cabeceras de ESE sitio, no el portal:
// X-Frame-Options (SAMEORIGIN o DENY lo impiden) y, si existe, la directiva frame-ancestors de su Content-Security-Policy
// (que manda sobre X-Frame-Options). Puro (sin servidor): se prueba aparte.

type Cabeceras = { get(nombre: string): string | null };

const norm = (s: string) => s.trim().toLowerCase().replace(/\/$/, "");

/** ¿La lista de fuentes de frame-ancestors admite a `origen` (p. ej. «https://www.fedegan.org.co»)? */
function admiteOrigen(fuentes: string[], origen: string): boolean {
  if (fuentes.includes("'none'")) return false;
  const o = norm(origen);
  const host = new URL(o).host;
  return fuentes.some((s) => {
    const f = norm(s);
    if (f === "*" || f === "https:") return true;
    if (f === o || f === host) return true;
    const comodin = f.replace(/^https:\/\//, "");
    return comodin.startsWith("*.") && host.endsWith(comodin.slice(1));
  });
}

export function permiteEmbeber(cabeceras: Cabeceras, origen: string): boolean {
  // Puede haber varias políticas (separadas por coma); todas las que traigan frame-ancestors deben admitirnos.
  const politicas = (cabeceras.get("content-security-policy") ?? "").split(",");
  const conAncestros = politicas.map((p) => /(?:^|;)\s*frame-ancestors\s+([^;]*)/i.exec(p)?.[1]).filter((x): x is string => x !== undefined);
  if (conAncestros.length) return conAncestros.every((lista) => admiteOrigen(lista.trim().split(/\s+/).filter(Boolean), origen));
  // Sin CSP que lo regule: X-Frame-Options. «ALLOW-FROM» ya no lo respetan los navegadores, así que no cuenta como permiso.
  return !(cabeceras.get("x-frame-options") ?? "").trim();
}
