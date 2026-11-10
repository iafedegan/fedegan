// Tarjetas de documentos (Excel, PDF, Word…): qué tipo es cada archivo y cómo se agrupan en tarjetas.
// Lo usan las listas de enlaces a documentos (DocList), el elemento «Documentos» del constructor y el editor.
// Módulo suelto, sin importar nada: se prueba con Node.

export type TipoDoc = { clave: string; sigla: string; nombre: string };

export const TIPOS: Record<string, TipoDoc> = {
  pdf: { clave: "pdf", sigla: "PDF", nombre: "PDF" },
  xls: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  xlsx: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  xlsm: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  csv: { clave: "xls", sigla: "CSV", nombre: "CSV" },
  doc: { clave: "doc", sigla: "DOC", nombre: "Word" },
  docx: { clave: "doc", sigla: "DOC", nombre: "Word" },
  ppt: { clave: "ppt", sigla: "PPT", nombre: "PowerPoint" },
  pptx: { clave: "ppt", sigla: "PPT", nombre: "PowerPoint" },
  zip: { clave: "zip", sigla: "ZIP", nombre: "ZIP" },
  rar: { clave: "zip", sigla: "RAR", nombre: "RAR" },
  mp3: { clave: "mp3", sigla: "MP3", nombre: "Audio" },
  m4a: { clave: "mp3", sigla: "M4A", nombre: "Audio" },
};

const EXT = /\.(pdf|xlsx?|xlsm|docx?|pptx?|zip|rar|csv|mp3|m4a)(?:$|[?#])/i;
const ENLACE = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*$/;
// «Nombre (Excel)», «Nombre — Etiqueta (PDF)»: el tipo entre paréntesis al final no es parte del nombre.
const SUFIJO = /\s*\((?:Excel|PDF|Word|PowerPoint|CSV|ZIP|RAR|audio|Audio)\)\s*$/i;

export type Doc = { nombre: string; etiqueta: string; url: string; tipo: TipoDoc; detalle?: string };
export type TarjetaDoc = { titulo: string; docs: Doc[]; detalle?: string };

/** El tipo de documento de una dirección (según su extensión), o null si no es un documento conocido. */
export function tipoDeUrl(url: string): TipoDoc | null {
  try {
    const ext = EXT.exec(new URL(url, "https://portal.invalid").pathname)?.[1]?.toLowerCase();
    return ext ? (TIPOS[ext] ?? null) : null;
  } catch {
    return null;
  }
}

/** «Nombre» + tipo entre paréntesis, como se escribían los documentos de las páginas migradas: «Tasa de imputación (Excel)». */
export function nombreConTipo(nombre: string, url: string): string {
  const limpio = nombre.replace(SUFIJO, "").trim();
  const tipo = tipoDeUrl(url);
  return tipo && limpio ? `${limpio} (${tipo.nombre})` : limpio;
}

/** Un archivo con su nombre: «Nombre — Etiqueta (Tipo)» o «Nombre (Tipo)». null si la dirección no es de un documento. */
export function docDe(texto: string, url: string): Doc | null {
  const tipo = tipoDeUrl(url);
  if (!tipo) return null;
  const [nombre, ...resto] = texto.replace(SUFIJO, "").trim().split(" — ");
  return { nombre: nombre.trim(), etiqueta: resto.join(" — ").trim(), url, tipo };
}

// Los archivos seguidos con el mismo nombre (el cuadro de salida y el instructivo, el Excel y el PDF) van en una tarjeta.
function agrupar(docs: Doc[]): TarjetaDoc[] {
  const out: TarjetaDoc[] = [];
  for (const d of docs) {
    const prev = out[out.length - 1];
    if (prev && prev.titulo === d.nombre && !prev.docs.some((x) => x.url === d.url)) prev.docs.push(d);
    else out.push({ titulo: d.nombre, docs: [d], detalle: d.detalle });
  }
  return out;
}

/** Tarjetas de una lista de viñetas, si TODAS son «[nombre](https://…documento)» y hay al menos `minimo`; si no, null (lista normal). */
export function tarjetasDeTextos(textos: string[], minimo = 1): TarjetaDoc[] | null {
  if (textos.length < minimo || textos.length === 0) return null;
  const docs: Doc[] = [];
  for (const t of textos) {
    const m = ENLACE.exec(t.trim());
    const d = m ? docDe(m[1], m[2]) : null;
    if (!d) return null;
    docs.push(d);
  }
  return agrupar(docs);
}

/** Tarjetas del elemento «Documentos» (nombre y dirección aparte); sin mínimo. null si algún archivo no es un documento conocido. */
export function tarjetasDeEnlaces(items: { nombre: string; url: string }[]): TarjetaDoc[] | null {
  if (items.length === 0) return null;
  const docs: Doc[] = [];
  for (const it of items) {
    const d = docDe(it.nombre, it.url);
    if (!d) return null;
    docs.push(d);
  }
  return agrupar(docs);
}

export type PiezaDocs = { t: "titulo"; texto: string; nivel: 1 | 2 } | { t: "docs"; tarjetas: TarjetaDoc[] };

const ENLACES = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/**
 * Un párrafo de páginas migradas que mezcla títulos en negrita con enlaces a documentos (el índice de una revista, por ejemplo):
 * lo devuelve como títulos y grupos de tarjetas. null si no hay al menos `minimo` documentos o si algún enlace no es un documento.
 * El texto de un enlace con varias líneas es el nombre (primera línea) y su detalle (las demás).
 */
export function piezasDeParrafo(texto: string, minimo = 2): PiezaDocs[] | null {
  const piezas: PiezaDocs[] = [];
  let docs: Doc[] = [];
  let total = 0;
  const cerrar = () => {
    if (docs.length) piezas.push({ t: "docs", tarjetas: agrupar(docs) });
    docs = [];
  };
  const titulos = (trozo: string) => {
    for (const l of trozo.replace(/\*+/g, "").split("\n")) {
      const t = l.trim();
      if (!t) continue;
      cerrar();
      const mayus = t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t);
      piezas.push({ t: "titulo", texto: t, nivel: mayus ? 1 : 2 });
    }
  };
  let desde = 0;
  for (const m of texto.matchAll(ENLACES)) {
    titulos(texto.slice(desde, m.index));
    desde = m.index + m[0].length;
    const [primera, ...resto] = m[1].split("\n").map((x) => x.trim()).filter(Boolean);
    const d = primera ? docDe(primera, m[2]) : null;
    if (!d) return null;
    if (resto.length) d.detalle = resto.join(" · ");
    docs.push(d);
    total++;
  }
  titulos(texto.slice(desde));
  cerrar();
  return total >= minimo ? piezas : null;
}
