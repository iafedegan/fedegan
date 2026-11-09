// Las partes que el sitio arma solo en una página (fichas de los temas, accesos rápidos, anterior/siguiente…) son elementos más
// de la lista: se pueden mover, quitar o volver a añadir, y entre ellas se pone lo que se quiera. Se guardan como `{ t: "parte", data: { cual } }`.
// Una página que no tiene ninguna parte guardada se pinta con la disposición de siempre; al armarla en el editor se vuelve «propia».
// Módulo suelto: lo usan el editor, el sitio y las pruebas.

import type { Bloque } from "./bloques";

export type InicialPartes = { antes: string[]; despues: string[] };

const parte = (cual: string): Bloque => ({ t: "parte", data: { cual } });
const esParte = (b: Bloque) => b.t === "parte";
const cualDe = (b: Bloque) => (typeof b.data?.cual === "string" ? b.data.cual : "");

/** Los bloques con que abre el editor: si la página aún no tiene partes, se ponen en su lugar de siempre (la marca «ninguna» no se muestra). */
export function sembrarPartes(bloques: Bloque[], inicial?: InicialPartes | null): Bloque[] {
  if (!inicial) return bloques;
  if (bloques.some(esParte)) return bloques.filter((b) => !(esParte(b) && cualDe(b) === "ninguna"));
  return [...inicial.antes.map(parte), ...bloques, ...inicial.despues.map(parte)];
}

/** Al publicar: si se quitaron todas las partes, se deja una marca «ninguna» para que la página no vuelva a la disposición de siempre. */
export function marcarSinPartes(json: string): string {
  try {
    const l = JSON.parse(json) as Bloque[];
    if (Array.isArray(l) && !l.some(esParte)) return JSON.stringify([...l, parte("ninguna")]);
  } catch {}
  return json;
}
