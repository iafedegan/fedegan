// Constructor de páginas: los elementos que el equipo arrastra para armar una página.
//
// Lo que se guarda en `site_nodes.blocks` es el mismo formato de las páginas copiadas del portal ({ t, text })
// más `data` para los elementos con varias partes (tarjetas, carrusel…). Este módulo lo comparte el editor
// (navegador) y el servidor, por eso no importa nada exclusivo de uno u otro.
//
//   Elemento  = lo que se edita en pantalla (con `id`, listas agrupadas, textos sin recortar).
//   Bloque    = lo que se guarda y se pinta en el sitio.

export type Bloque = { t: string; text?: string; rows?: string[][]; data?: Record<string, unknown> };

export type Estilo = "solido" | "borde";
export type Tono = "verde" | "dorado" | "claro";
export type Tarjeta = { titulo: string; texto: string; imagen: string; enlace: string; boton: string };
export type Pregunta = { titulo: string; texto: string };
export type Documento = { nombre: string; url: string };

export type Elemento =
  | { id: string; tipo: "h2" | "h3" | "h4" | "p"; texto: string }
  | { id: string; tipo: "lista"; items: string[] }
  | { id: string; tipo: "button"; texto: string; href: string; estilo: Estilo }
  | { id: string; tipo: "image"; src: string; alt: string; pie: string }
  | { id: string; tipo: "cards"; columnas: 2 | 3 | 4; items: Tarjeta[] }
  | { id: string; tipo: "carousel"; auto: boolean; items: Tarjeta[] }
  | { id: string; tipo: "accordion"; items: Pregunta[] }
  | { id: string; tipo: "callout"; titulo: string; texto: string; boton: string; enlace: string; tono: Tono }
  | { id: string; tipo: "docs"; titulo: string; items: Documento[] }
  | { id: string; tipo: "embed"; url: string }
  | { id: string; tipo: "upload"; texto: string }
  | { id: string; tipo: "divider" }
  /** Un bloque que el constructor no sabe editar (por ejemplo, una tabla copiada): se conserva tal cual. */
  | { id: string; tipo: "otro"; bloque: Bloque };

export type Tipo = Elemento["tipo"];
/** Título, subtítulo, detalle o párrafo (comparten forma: un solo texto). */
export type ElTexto = Extract<Elemento, { tipo: "h2" | "h3" | "h4" | "p" }>;
export type TipoNuevo = Exclude<Tipo, "otro" | "h4">;

export const MAX_BLOQUES = 400;
const MAX_ITEMS = 40;
const MAX_BYTES = 500_000;

/** Lo que se ofrece en la paleta, en el orden en que se muestra. */
export const CATALOGO: { tipo: TipoNuevo; nombre: string; ayuda: string; grupo: "Texto" | "Acciones" | "Contenido" | "Archivos" }[] = [
  { tipo: "h2", nombre: "Título", ayuda: "Encabezado de una sección", grupo: "Texto" },
  { tipo: "h3", nombre: "Subtítulo", ayuda: "Encabezado menor", grupo: "Texto" },
  { tipo: "p", nombre: "Párrafo", ayuda: "Texto corrido", grupo: "Texto" },
  { tipo: "lista", nombre: "Lista", ayuda: "Viñetas, una por línea", grupo: "Texto" },
  { tipo: "button", nombre: "Botón", ayuda: "Enlace con forma de botón", grupo: "Acciones" },
  { tipo: "callout", nombre: "Destacado", ayuda: "Recuadro con mensaje y botón", grupo: "Acciones" },
  { tipo: "cards", nombre: "Tarjetas", ayuda: "Cuadrícula de fichas con imagen y enlace", grupo: "Contenido" },
  { tipo: "carousel", nombre: "Carrusel", ayuda: "Fichas que se deslizan", grupo: "Contenido" },
  { tipo: "accordion", nombre: "Preguntas", ayuda: "Acordeón que se despliega", grupo: "Contenido" },
  { tipo: "image", nombre: "Imagen", ayuda: "Foto con pie opcional", grupo: "Contenido" },
  { tipo: "embed", nombre: "Video o tablero", ayuda: "YouTube o un enlace incrustado", grupo: "Contenido" },
  { tipo: "divider", nombre: "Separador", ayuda: "Línea divisoria", grupo: "Contenido" },
  { tipo: "docs", nombre: "Documentos", ayuda: "Lista de archivos para descargar", grupo: "Archivos" },
  { tipo: "upload", nombre: "Recibir archivos", ayuda: "Botón para que el visitante cargue documentos", grupo: "Archivos" },
];

export const NOMBRE_TIPO: Record<string, string> = {
  h2: "Título", h3: "Subtítulo", h4: "Detalle", p: "Párrafo", lista: "Lista", li: "Lista", button: "Botón", callout: "Destacado",
  cards: "Tarjetas", carousel: "Carrusel", accordion: "Preguntas", image: "Imagen", embed: "Video o tablero", divider: "Separador",
  docs: "Documentos", upload: "Recibir archivos", table: "Tabla", otro: "Elemento copiado",
};

// ───────────────────────── enlaces y texto

const SEGURO = String.raw`[^\s"'<>\\]`;
/** Enlaces de botones, tarjetas y documentos: https://, http://, una ruta del portal, un ancla, correo o teléfono. */
export const ENLACE_OK = new RegExp(`^(https?://${SEGURO}+|/(?!/)${SEGURO}*|#${SEGURO}*|mailto:${SEGURO}+|tel:\\+?[0-9 ()-]{5,25})$`, "i");
/** Imágenes: solo https:// o una ruta del portal. */
export const IMAGEN_OK = new RegExp(`^(https://${SEGURO}+|/(?!/)${SEGURO}*)$`);
/** Contenido incrustado: solo https://. */
export const EMBED_OK = new RegExp(`^https://${SEGURO}+$`);

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

const linea = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const parrafos = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim().slice(0, max) : "");
const texto = (v: unknown) => (typeof v === "string" ? v : "");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v.slice(0, MAX_ITEMS) : []);

/** Antes el botón guardaba «texto|enlace» en una sola cadena; ahora el enlace va en `data.href`. */
function partesBoton(b: Bloque): { etiqueta: string; enlace: string } {
  const d = obj(b.data);
  if (typeof d.href === "string") return { etiqueta: b.text ?? "", enlace: d.href };
  const [etiqueta, ...resto] = (b.text ?? "").split("|");
  return { etiqueta: etiqueta ?? "", enlace: resto.join("|") };
}

let contador = 0;
export const nuevoId = () => `e${Date.now().toString(36)}${(contador++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const tarjetaVacia = (): Tarjeta => ({ titulo: "", texto: "", imagen: "", enlace: "", boton: "" });
const tarjetas = (v: unknown): Tarjeta[] =>
  lista(v).map((x) => {
    const o = obj(x);
    return { titulo: texto(o.titulo), texto: texto(o.texto), imagen: texto(o.imagen), enlace: texto(o.enlace), boton: texto(o.boton) };
  });
const preguntas = (v: unknown): Pregunta[] => lista(v).map((x) => ({ titulo: texto(obj(x).titulo), texto: texto(obj(x).texto) }));
const documentos = (v: unknown): Documento[] => lista(v).map((x) => ({ nombre: texto(obj(x).nombre), url: texto(obj(x).url) }));

// ───────────────────────── Bloque (guardado) → Elemento (editor)

export function aElementos(blocks: Bloque[]): Elemento[] {
  const out: Elemento[] = [];
  // Identificadores por posición, no al azar: así el servidor y el navegador generan los mismos al pintar la página.
  let n = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const d = obj(b.data);
    const id = `i${n++}`;
    switch (b.t) {
      case "h2":
      case "h3":
      case "h4":
      case "p":
        out.push({ id, tipo: b.t, texto: b.text ?? "" });
        break;
      case "li": {
        const items = [b.text ?? ""];
        while (blocks[i + 1]?.t === "li") items.push(blocks[++i].text ?? "");
        out.push({ id, tipo: "lista", items });
        break;
      }
      case "button": {
        const { etiqueta, enlace } = partesBoton(b);
        out.push({ id, tipo: "button", texto: etiqueta, href: enlace, estilo: d.estilo === "borde" ? "borde" : "solido" });
        break;
      }
      case "image":
        out.push({ id, tipo: "image", src: texto(d.src), alt: texto(d.alt), pie: texto(d.pie) });
        break;
      case "cards":
        out.push({ id, tipo: "cards", columnas: d.columnas === 2 || d.columnas === 4 ? d.columnas : 3, items: tarjetas(d.items) });
        break;
      case "carousel":
        out.push({ id, tipo: "carousel", auto: d.auto === true, items: tarjetas(d.items) });
        break;
      case "accordion":
        out.push({ id, tipo: "accordion", items: preguntas(d.items) });
        break;
      case "callout":
        out.push({ id, tipo: "callout", titulo: texto(d.titulo), texto: texto(d.texto), boton: texto(d.boton), enlace: texto(d.enlace), tono: d.tono === "dorado" || d.tono === "claro" ? d.tono : "verde" });
        break;
      case "docs":
        out.push({ id, tipo: "docs", titulo: texto(d.titulo), items: documentos(d.items) });
        break;
      case "embed":
        out.push({ id, tipo: "embed", url: b.text ?? "" });
        break;
      case "upload":
        out.push({ id, tipo: "upload", texto: b.text ?? "" });
        break;
      case "divider":
        out.push({ id, tipo: "divider" });
        break;
      default:
        out.push({ id, tipo: "otro", bloque: b });
    }
  }
  return out;
}

/** Un solo bloque guardado como elemento (lo usa el sitio para pintar los elementos con varias partes). */
export const elementoDeBloque = (b: Bloque): Elemento => aElementos([b])[0];

// ───────────────────────── Elemento (editor) → Bloque (guardado)

function bloqueCrudo(el: Exclude<Elemento, { tipo: "lista" | "otro" }>): Bloque {
  switch (el.tipo) {
    case "h2":
    case "h3":
    case "h4":
    case "p":
      return { t: el.tipo, text: el.texto };
    case "button":
      return { t: "button", text: el.texto, data: { href: el.href, estilo: el.estilo } };
    case "image":
      return { t: "image", data: { src: el.src, alt: el.alt, pie: el.pie } };
    case "cards":
      return { t: "cards", data: { columnas: el.columnas, items: el.items } };
    case "carousel":
      return { t: "carousel", data: { auto: el.auto, items: el.items } };
    case "accordion":
      return { t: "accordion", data: { items: el.items } };
    case "callout":
      return { t: "callout", data: { titulo: el.titulo, texto: el.texto, boton: el.boton, enlace: el.enlace, tono: el.tono } };
    case "docs":
      return { t: "docs", data: { titulo: el.titulo, items: el.items } };
    case "embed":
      return { t: "embed", text: el.url };
    case "upload":
      return { t: "upload", text: el.texto };
    case "divider":
      return { t: "divider" };
  }
}

/** Limpia un bloque: recorta textos, completa enlaces y descarta lo que está vacío (devuelve null). No juzga si es válido. */
export function canonico(b: Bloque): Bloque | null {
  const d = obj(b.data);
  switch (b.t) {
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": {
      const t = linea(b.text, 300);
      return t ? { t: b.t, text: t } : null;
    }
    case "p": {
      const t = parrafos(b.text, 20_000);
      return t ? { t: "p", text: t } : null;
    }
    case "li": {
      const t = parrafos(b.text, 2000);
      return t ? { t: "li", text: t } : null;
    }
    case "button": {
      const partes = partesBoton(b);
      const t = linea(partes.etiqueta, 80);
      const href = normalizarUrl(linea(partes.enlace, 600));
      if (!t && !href) return null;
      return { t: "button", text: t, data: { href, estilo: d.estilo === "borde" ? "borde" : "solido" } };
    }
    case "image": {
      const src = normalizarUrl(linea(d.src, 600));
      if (!src) return null;
      return { t: "image", data: { src, alt: linea(d.alt, 250), pie: linea(d.pie, 300) } };
    }
    case "cards":
    case "carousel": {
      const items = tarjetas(d.items)
        .map((x) => ({ titulo: linea(x.titulo, 140), texto: parrafos(x.texto, 700), imagen: normalizarUrl(linea(x.imagen, 600)), enlace: normalizarUrl(linea(x.enlace, 600)), boton: linea(x.boton, 40) }))
        .filter((x) => x.titulo || x.texto || x.imagen);
      if (!items.length) return null;
      return b.t === "cards"
        ? { t: "cards", data: { columnas: d.columnas === 2 || d.columnas === 4 ? d.columnas : 3, items } }
        : { t: "carousel", data: { auto: d.auto === true, items } };
    }
    case "accordion": {
      const items = preguntas(d.items)
        .map((x) => ({ titulo: linea(x.titulo, 200), texto: parrafos(x.texto, 6000) }))
        .filter((x) => x.titulo || x.texto);
      return items.length ? { t: "accordion", data: { items } } : null;
    }
    case "callout": {
      const titulo = linea(d.titulo, 160);
      const t = parrafos(d.texto, 700);
      const boton = linea(d.boton, 40);
      const enlace = normalizarUrl(linea(d.enlace, 600));
      if (!titulo && !t && !boton && !enlace) return null;
      return { t: "callout", data: { titulo, texto: t, boton, enlace, tono: d.tono === "dorado" || d.tono === "claro" ? d.tono : "verde" } };
    }
    case "docs": {
      const items = documentos(d.items)
        .map((x) => ({ nombre: linea(x.nombre, 200), url: normalizarUrl(linea(x.url, 800)) }))
        .filter((x) => x.nombre || x.url);
      return items.length ? { t: "docs", data: { titulo: linea(d.titulo, 160), items } } : null;
    }
    case "embed": {
      const url = normalizarVideo(linea(b.text, 800));
      return url ? { t: "embed", text: url } : null;
    }
    case "upload":
      return { t: "upload", text: linea(b.text, 80) || "Cargar documentos" };
    case "divider":
      return { t: "divider" };
    case "table": {
      if (!Array.isArray(b.rows)) return null;
      const rows = b.rows.slice(0, 200).map((r) => (Array.isArray(r) ? r.slice(0, 20).map((c) => (typeof c === "string" ? c.slice(0, 2000) : "")) : []));
      return rows.length ? { t: "table", rows } : null;
    }
    default:
      return { t: "?" };
  }
}

/** Qué le falta o qué está mal en un bloque ya limpio (null = todo bien). */
export function problemaBloque(b: Bloque): string | null {
  const d = obj(b.data);
  const enlaceMal = (u: string, que: string) => (u && !ENLACE_OK.test(u) ? `${que} no es válido (use https://…, una ruta como /pagos o un correo).` : null);
  const imagenMal = (u: string, que: string) => (u && !IMAGEN_OK.test(u) ? `${que} debe empezar con https://.` : null);
  switch (b.t) {
    case "button": {
      const href = texto(d.href);
      if (!b.text) return "Escriba el texto del botón.";
      if (!href) return "Falta el enlace del botón.";
      return enlaceMal(href, "El enlace del botón");
    }
    case "image": {
      const src = texto(d.src);
      if (!src) return "Falta la imagen.";
      return imagenMal(src, "La dirección de la imagen");
    }
    case "cards":
    case "carousel": {
      const items = tarjetas(d.items);
      if (!items.length) return "Añada al menos una tarjeta con contenido.";
      for (let i = 0; i < items.length; i++) {
        const p = enlaceMal(items[i].enlace, `El enlace de la tarjeta ${i + 1}`) ?? imagenMal(items[i].imagen, `La imagen de la tarjeta ${i + 1}`);
        if (p) return p;
      }
      return null;
    }
    case "accordion": {
      const items = preguntas(d.items);
      if (!items.length) return "Añada al menos una pregunta.";
      const i = items.findIndex((x) => !x.titulo);
      return i >= 0 ? `Falta el título de la pregunta ${i + 1}.` : null;
    }
    case "callout": {
      const titulo = texto(d.titulo);
      const t = texto(d.texto);
      const boton = texto(d.boton);
      const enlace = texto(d.enlace);
      if (!titulo && !t) return "Escriba un título o un texto.";
      if (boton && !enlace) return "Falta el enlace del botón.";
      if (enlace && !boton) return "Escriba el texto del botón.";
      return enlaceMal(enlace, "El enlace del botón");
    }
    case "docs": {
      const items = documentos(d.items);
      if (!items.length) return "Añada al menos un documento.";
      for (let i = 0; i < items.length; i++) {
        if (!items[i].nombre) return `Falta el nombre del documento ${i + 1}.`;
        if (!items[i].url) return `Falta el enlace del documento ${i + 1}.`;
        const p = enlaceMal(items[i].url, `El enlace del documento ${i + 1}`);
        if (p) return p;
      }
      return null;
    }
    case "embed":
      return EMBED_OK.test(b.text ?? "") ? null : "La dirección debe empezar con https://.";
    case "?":
      return "Tipo de elemento no reconocido.";
    default:
      return null;
  }
}

/** Los bloques que se publican: solo los elementos completos y válidos; los vacíos o incompletos se omiten. */
export function aBloques(elementos: Elemento[]): Bloque[] {
  return elementos.flatMap((el) => elementoABloques(el).filter((b) => problemaBloque(b) === null));
}

function elementoABloques(el: Elemento): Bloque[] {
  if (el.tipo === "otro") return [el.bloque];
  if (el.tipo === "lista") return el.items.map((t) => canonico({ t: "li", text: t })).filter((b): b is Bloque => b !== null);
  const b = canonico(bloqueCrudo(el));
  return b ? [b] : [];
}

/** Qué le impide a un elemento publicarse (null = se publica tal cual). */
export function problema(el: Elemento): string | null {
  if (el.tipo === "otro" || el.tipo === "divider") return null;
  const bs = elementoABloques(el);
  if (el.tipo === "lista") return bs.length ? null : "Escriba al menos un elemento de la lista.";
  if (bs.length === 0) {
    switch (el.tipo) {
      case "h2": case "h3": case "h4": return "Escriba el título.";
      case "p": return "Escriba el texto.";
      case "button": return "Escriba el texto del botón y su enlace.";
      case "image": return "Falta la imagen.";
      case "cards": case "carousel": return "Añada al menos una tarjeta con contenido.";
      case "accordion": return "Añada al menos una pregunta.";
      case "callout": return "Escriba un título o un texto.";
      case "docs": return "Añada al menos un documento.";
      case "embed": return "Pegue la dirección del video o documento.";
      default: return "Complete este elemento.";
    }
  }
  return problemaBloque(bs[0]);
}

export type Saneado = { ok: true; bloques: Bloque[] } | { ok: false; message: string };

/** Valida en el servidor lo que llega del editor antes de guardarlo: tipos conocidos, enlaces seguros y tamaños acotados. */
export function sanearBloques(raw: unknown): Saneado {
  if (!Array.isArray(raw)) return { ok: false, message: "El contenido de la página no es válido." };
  if (raw.length > MAX_BLOQUES) return { ok: false, message: `La página tiene demasiados elementos (máximo ${MAX_BLOQUES}).` };
  const out: Bloque[] = [];
  for (let i = 0; i < raw.length; i++) {
    const x = raw[i];
    if (!x || typeof x !== "object" || typeof (x as Bloque).t !== "string") return { ok: false, message: `El elemento ${i + 1} no es válido.` };
    const c = canonico(x as Bloque);
    if (!c) continue;
    const p = problemaBloque(c);
    if (p) return { ok: false, message: `Elemento ${i + 1} (${NOMBRE_TIPO[c.t] ?? "desconocido"}): ${p}` };
    out.push(c);
  }
  if (JSON.stringify(out).length > MAX_BYTES) return { ok: false, message: "La página es demasiado grande." };
  return { ok: true, bloques: out };
}

// ───────────────────────── elementos nuevos y plantillas

export function elementoNuevo(tipo: TipoNuevo): Elemento {
  const id = nuevoId();
  switch (tipo) {
    case "h2": case "h3": case "p": return { id, tipo, texto: "" };
    case "lista": return { id, tipo, items: [""] };
    case "button": return { id, tipo, texto: "", href: "", estilo: "solido" };
    case "image": return { id, tipo, src: "", alt: "", pie: "" };
    case "cards": return { id, tipo, columnas: 3, items: [tarjetaVacia(), tarjetaVacia(), tarjetaVacia()] };
    case "carousel": return { id, tipo, auto: false, items: [tarjetaVacia(), tarjetaVacia(), tarjetaVacia()] };
    case "accordion": return { id, tipo, items: [{ titulo: "", texto: "" }, { titulo: "", texto: "" }] };
    case "callout": return { id, tipo, titulo: "", texto: "", boton: "", enlace: "", tono: "verde" };
    case "docs": return { id, tipo, titulo: "Documentos", items: [] };
    case "embed": return { id, tipo, url: "" };
    case "upload": return { id, tipo, texto: "Cargar documentos" };
    case "divider": return { id, tipo };
  }
}

export type Plantilla = { id: string; nombre: string; ayuda: string; crear: () => Elemento[] };

const tarjeta = (titulo: string, texto: string): Tarjeta => ({ ...tarjetaVacia(), titulo, texto });

/** Puntos de partida para una página en blanco. El texto de muestra se reemplaza al editar cada elemento. */
export const PLANTILLAS: Plantilla[] = [
  {
    id: "informativa",
    nombre: "Página informativa",
    ayuda: "Título, presentación y un botón",
    crear: () => [
      { id: nuevoId(), tipo: "h2", texto: "Título de la sección" },
      { id: nuevoId(), tipo: "p", texto: "Presente aquí de qué trata la página y a quién va dirigida." },
      { id: nuevoId(), tipo: "button", texto: "Más información", href: "", estilo: "solido" },
    ],
  },
  {
    id: "servicios",
    nombre: "Servicios con tarjetas",
    ayuda: "Introducción y una cuadrícula de fichas",
    crear: () => [
      { id: nuevoId(), tipo: "h2", texto: "Nuestros servicios" },
      { id: nuevoId(), tipo: "p", texto: "Elija el servicio que necesita." },
      { id: nuevoId(), tipo: "cards", columnas: 3, items: [tarjeta("Primer servicio", "Describa el servicio en una o dos frases."), tarjeta("Segundo servicio", "Describa el servicio en una o dos frases."), tarjeta("Tercer servicio", "Describa el servicio en una o dos frases.")] },
    ],
  },
  {
    id: "documentos",
    nombre: "Documentos y descargas",
    ayuda: "Presentación y lista de archivos",
    crear: () => [
      { id: nuevoId(), tipo: "h2", texto: "Documentos" },
      { id: nuevoId(), tipo: "p", texto: "Consulte y descargue los documentos de esta sección." },
      { id: nuevoId(), tipo: "docs", titulo: "", items: [] },
    ],
  },
  {
    id: "preguntas",
    nombre: "Preguntas frecuentes",
    ayuda: "Acordeón de preguntas y respuestas",
    crear: () => [
      { id: nuevoId(), tipo: "h2", texto: "Preguntas frecuentes" },
      { id: nuevoId(), tipo: "accordion", items: [{ titulo: "Primera pregunta", texto: "Escriba la respuesta." }, { titulo: "Segunda pregunta", texto: "Escriba la respuesta." }] },
    ],
  },
];
