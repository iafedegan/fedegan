// Texto de la página (con **negrita** y [palabras](enlace)) → HTML que muestra el campo visual de CampoRico.
// Está aparte, sin React, para poder probarlo.

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s: string) => esc(s).replace(/"/g, "&quot;");
const lineas = (s: string) => esc(s).replace(/\n/g, "<br>");

export { esc, escAttr };

export function mdAHtml(md: string): string {
  let out = "";
  let ultimo = 0;
  for (const m of md.matchAll(TOKEN)) {
    out += lineas(md.slice(ultimo, m.index));
    ultimo = (m.index ?? 0) + m[0].length;
    out += m[1] !== undefined ? `<strong>${mdAHtml(m[1])}</strong>` : `<a href="${escAttr(m[3])}">${esc(m[2] || m[3])}</a>`;
  }
  return out + lineas(md.slice(ultimo));
}
