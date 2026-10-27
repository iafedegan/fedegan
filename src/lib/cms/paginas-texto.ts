// Conversión entre los bloques de una página migrada y un texto editable (estilo Markdown simplificado).
// Es la base del editor de /admin/paginas: el equipo edita texto y el portal sigue pintando bloques.
//
//   ## Título        encabezado h2   (### h3, #### h4)
//   - elemento       elemento de lista
//   @video URL       contenido incrustado (video, documento o tablero)
//   {{tabla 1}}      una tabla de la página original (se conserva; no se edita aquí)
//   texto            párrafo; una línea en blanco separa bloques
//   **negrita**  y  [texto](https://enlace)  dentro de cualquier texto
//
// Una línea de un párrafo que empiece con \ - # @video o {{ se escribe con una barra \ delante.

export type LegacyBlockLite = { t: string; text?: string; rows?: string[][] };

const PREFIJO: Record<string, string> = { h2: "## ", h3: "### ", h4: "#### ", li: "- " };
const ESPECIAL = /^(\\|#|-\s|@video\s|\{\{)/;

const esc = (linea: string) => (linea === "" ? "\\" : ESPECIAL.test(linea) ? `\\${linea}` : linea);
const unesc = (linea: string) => (linea.startsWith("\\") ? linea.slice(1) : linea);

export function blocksToText(blocks: LegacyBlockLite[]): string {
  let tabla = 0;
  const partes: string[] = [];
  let anteriorLista = false;
  for (const b of blocks) {
    let s: string;
    if (b.t === "table") {
      s = `{{tabla ${++tabla}}}`;
    } else if (b.t === "embed") {
      s = `@video ${b.text ?? ""}`;
    } else {
      const lineas = (b.text ?? "").split("\n");
      const prefijo = PREFIJO[b.t];
      s = prefijo ? [prefijo + lineas[0], ...lineas.slice(1).map(esc)].join("\n") : lineas.map(esc).join("\n");
    }
    // Los elementos de lista consecutivos van sin línea en blanco entre ellos.
    const sep = partes.length === 0 ? "" : b.t === "li" && anteriorLista ? "\n" : "\n\n";
    partes.push(sep + s);
    anteriorLista = b.t === "li";
  }
  return partes.join("");
}

export function textToBlocks(texto: string, previos: LegacyBlockLite[] = []): LegacyBlockLite[] {
  const tablas = previos.filter((b) => b.t === "table");
  const out: LegacyBlockLite[] = [];
  let actual: { t: string; lineas: string[] } | null = null;

  const cerrar = () => {
    if (!actual) return;
    const cuerpo = actual.lineas.map((l) => l.replace(/\s+$/, "")).join("\n").trim();
    if (cuerpo) out.push({ t: actual.t, text: cuerpo });
    actual = null;
  };

  for (const cruda of texto.replace(/\r\n?/g, "\n").split("\n")) {
    const linea = cruda.replace(/\s+$/, "");
    if (!linea.trim()) {
      cerrar();
      continue;
    }
    const tabla = linea.match(/^\{\{tabla (\d+)\}\}$/);
    if (tabla) {
      cerrar();
      const original = tablas[Number(tabla[1]) - 1];
      if (original) out.push({ t: "table", rows: original.rows });
      continue;
    }
    if (linea.startsWith("@video ")) {
      cerrar();
      const url = linea.slice(7).trim();
      if (url) out.push({ t: "embed", text: url });
      continue;
    }
    const encabezado = linea.match(/^(#{2,4}) (.*)$/);
    if (encabezado) {
      cerrar();
      actual = { t: `h${encabezado[1].length}`, lineas: [encabezado[2]] };
      continue;
    }
    if (linea.startsWith("- ")) {
      cerrar();
      actual = { t: "li", lineas: [linea.slice(2)] };
      continue;
    }
    const contenido = unesc(linea);
    if (actual) actual.lineas.push(contenido);
    else actual = { t: "p", lineas: [contenido] };
  }
  cerrar();
  return out;
}

/** Misma página sin diferencias que no importan (espacios al final de línea o del bloque). */
export function normalizarBloques(blocks: LegacyBlockLite[]): LegacyBlockLite[] {
  return blocks.map((b) =>
    b.text === undefined ? b : { ...b, text: b.text.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim() },
  );
}
