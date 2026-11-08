// Elementos del constructor de páginas que se describen con un esquema (sus campos) en lugar de código propio.
//
// Cada elemento dice qué campos tiene (texto, enlace, imagen, opciones, listas de partes, tabla…) y de ahí salen solos
// el formulario del editor, la limpieza de lo que llega al servidor y los mensajes de lo que falta. Así sumar un
// elemento es declararlo aquí y escribir cómo se ve (src/components/legacy/ElementosExtra.tsx), y todos validan igual:
// textos recortados, enlaces e imágenes seguros y listas acotadas.
//
// Lo guardado es `{ t: <tipo>, data: <datos> }`, igual que tarjetas o carrusel. Módulo suelto: lo usan el navegador y el
// servidor y se prueba con Node.

import { ENLACE_OK, IMAGEN_OK, linea, normalizarUrl, parrafos } from "./enlaces";

export type Datos = Record<string, unknown>;

export const GRUPOS = ["Texto", "Acciones", "Medios", "Contenido", "Personas", "Archivos", "Diseño"] as const;
export type Grupo = (typeof GRUPOS)[number];

type Base = { k: string; etiqueta: string; ayuda?: string; obligatorio?: boolean };
type Patron = { re: RegExp; mensaje: string };

export type CampoSimple =
  | (Base & { tipo: "texto"; max: number; placeholder?: string; patron?: Patron })
  | (Base & { tipo: "parrafo"; max: number; filas?: number; placeholder?: string; formato?: boolean })
  | (Base & { tipo: "enlace"; placeholder?: string })
  | (Base & { tipo: "imagen" })
  | (Base & { tipo: "archivo"; aceptar: string; placeholder?: string })
  | (Base & { tipo: "opcion"; opciones: { valor: string; nombre: string }[]; defecto: string })
  | (Base & { tipo: "sino"; defecto: boolean });

export type CampoLista = Base & {
  tipo: "lista";
  nombreItem: string;
  max: number;
  minimo: number;
  /** Cuántas partes vacías trae un elemento recién añadido. */
  inicial: number;
  campos: CampoSimple[];
  /** Subir varias imágenes de una vez: cada archivo crea una parte con su imagen en `campo` y su nombre en `nombre`. */
  subirVarias?: { campo: string; nombre?: string };
};

export type CampoTabla = Base & { tipo: "tabla"; maxFilas: number; maxColumnas: number; maxCelda: number };

export type Campo = CampoSimple | CampoLista | CampoTabla;

export type Esquema = {
  nombre: string;
  ayuda: string;
  grupo: Grupo;
  /** Nombre del icono de lucide-react (el editor lo resuelve). */
  icono: string;
  campos: Campo[];
  /** Los campos que deciden si el elemento está vacío (por omisión, todos los de texto, enlace, imagen, lista y tabla). */
  principales?: string[];
  /** Qué decir mientras el elemento está vacío. */
  vacioMensaje: string;
  /** Regla entre campos: devuelve el problema o null. */
  regla?: (d: Datos) => string | null;
  /** Se publica aunque no tenga contenido (los espacios). */
  siempre?: boolean;
};

// ───────────────────────── motor: valores iniciales, lectura, limpieza y problemas

const s = (v: unknown): string => (typeof v === "string" ? v : "");
const esObj = (v: unknown): v is Datos => !!v && typeof v === "object" && !Array.isArray(v);

const valorInicial = (c: Campo): unknown => {
  switch (c.tipo) {
    case "opcion": return c.defecto;
    case "sino": return c.defecto;
    case "lista": return Array.from({ length: c.inicial }, () => datosDe(c.campos));
    case "tabla": return [["", ""], ["", ""]];
    default: return "";
  }
};
/** Los datos de una parte nueva (todos sus campos con el valor de siempre). */
export const datosDe = (campos: Campo[]): Datos => Object.fromEntries(campos.map((c) => [c.k, valorInicial(c)]));

/** Los datos de un elemento recién añadido. */
export const datosIniciales = (e: Esquema): Datos => datosDe(e.campos);

const opcionValida = (c: Extract<Campo, { tipo: "opcion" }>, v: unknown) => (c.opciones.some((o) => o.valor === v) ? (v as string) : c.defecto);

function leerCampo(c: Campo, v: unknown): unknown {
  switch (c.tipo) {
    case "texto": case "parrafo": case "enlace": case "imagen": case "archivo": return s(v);
    case "opcion": return opcionValida(c, v);
    case "sino": return typeof v === "boolean" ? v : c.defecto;
    case "lista": return (Array.isArray(v) ? v : []).slice(0, c.max).map((x) => leerCampos(c.campos, x));
    case "tabla": return (Array.isArray(v) ? v : []).slice(0, c.maxFilas).map((f) => (Array.isArray(f) ? f : []).slice(0, c.maxColumnas).map(s));
  }
}
const leerCampos = (campos: Campo[], raw: unknown): Datos => {
  const o = esObj(raw) ? raw : {};
  return Object.fromEntries(campos.map((c) => [c.k, leerCampo(c, o[c.k])]));
};

/** Los datos guardados como los muestra el editor: con su forma, sin recortar ni juzgar. */
export const leerDatos = (e: Esquema, raw: unknown): Datos => leerCampos(e.campos, raw);

function limpiarTabla(v: unknown, c: CampoTabla): string[][] {
  const filas = (Array.isArray(v) ? v : []).slice(0, c.maxFilas).map((f) => (Array.isArray(f) ? f : []).slice(0, c.maxColumnas).map((x) => parrafos(x, c.maxCelda)));
  while (filas.length && filas[filas.length - 1].every((x) => x === "")) filas.pop();
  const columnas = filas.reduce((m, f) => {
    let n = f.length;
    while (n > 0 && f[n - 1] === "") n--;
    return Math.max(m, n);
  }, 0);
  return columnas === 0 ? [] : filas.map((f) => Array.from({ length: columnas }, (_, i) => f[i] ?? ""));
}

// Una parte está vacía si ninguno de sus campos de texto, enlace o imagen trae algo (las opciones siempre traen un valor).
const itemVacio = (c: CampoLista, it: Datos) => c.campos.every((x) => x.tipo === "opcion" || x.tipo === "sino" || s(it[x.k]).trim() === "");

function limpiarCampo(c: Campo, v: unknown): unknown {
  switch (c.tipo) {
    case "texto": return linea(v, c.max);
    case "parrafo": return parrafos(v, c.max);
    case "enlace": case "imagen": case "archivo": return normalizarUrl(linea(v, 800));
    case "opcion": return opcionValida(c, v);
    case "sino": return typeof v === "boolean" ? v : c.defecto;
    case "lista": return (Array.isArray(v) ? v : []).slice(0, c.max).map((x) => limpiarCampos(c.campos, x)).filter((it) => !itemVacio(c, it));
    case "tabla": return limpiarTabla(v, c);
  }
}
const limpiarCampos = (campos: Campo[], raw: unknown): Datos => {
  const o = esObj(raw) ? raw : {};
  return Object.fromEntries(campos.map((c) => [c.k, limpiarCampo(c, o[c.k])]));
};

const conContenido = (v: unknown): boolean => (typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : false);

/** ¿No hay nada que publicar? (ya con los datos limpios) */
export function esVacio(e: Esquema, d: Datos): boolean {
  if (e.siempre) return false;
  const claves = e.principales ?? e.campos.filter((c) => c.tipo !== "opcion" && c.tipo !== "sino").map((c) => c.k);
  return !claves.some((k) => conContenido(d[k]));
}

/** Limpia lo que llega: recorta textos, completa enlaces, descarta partes vacías y devuelve null si no queda nada. */
export function limpiarDatos(e: Esquema, raw: unknown): Datos | null {
  const d = limpiarCampos(e.campos, raw);
  return esVacio(e, d) ? null : d;
}

const nombreCampo = (c: Campo) => `«${c.etiqueta.replace(/\s*\([^)]*\)\s*$/, "")}»`;

function problemaCampos(campos: Campo[], d: Datos, prefijo: string): string | null {
  for (const c of campos) {
    const v = d[c.k];
    switch (c.tipo) {
      case "texto": {
        const t = s(v);
        if (c.obligatorio && !t) return `${prefijo}Falta ${nombreCampo(c)}.`;
        if (t && c.patron && !c.patron.re.test(t)) return `${prefijo}${c.patron.mensaje}`;
        break;
      }
      case "parrafo":
        if (c.obligatorio && !s(v)) return `${prefijo}Falta ${nombreCampo(c)}.`;
        break;
      case "enlace": case "archivo": {
        const t = s(v);
        if (c.obligatorio && !t) return `${prefijo}Falta ${nombreCampo(c)}.`;
        if (t && !ENLACE_OK.test(t)) return `${prefijo}El enlace ${nombreCampo(c)} no es válido (use https://…, una ruta como /pagos o un correo).`;
        break;
      }
      case "imagen": {
        const t = s(v);
        if (c.obligatorio && !t) return `${prefijo}Falta ${nombreCampo(c)}.`;
        if (t && !IMAGEN_OK.test(t)) return `${prefijo}La imagen ${nombreCampo(c)} debe empezar con https://.`;
        break;
      }
      case "lista": {
        const items = Array.isArray(v) ? (v as Datos[]) : [];
        if (items.length < c.minimo) return `${prefijo}Añada al menos ${c.minimo} ${c.nombreItem.toLowerCase()}${c.minimo > 1 ? "s" : ""}.`;
        for (let i = 0; i < items.length; i++) {
          const p = problemaCampos(c.campos, items[i], `${c.nombreItem} ${i + 1}: `);
          if (p) return p;
        }
        break;
      }
      default:
        break;
    }
  }
  return null;
}

/** Qué falta o qué está mal en los datos ya limpios (null = todo bien). */
export function problemaDatos(e: Esquema, d: Datos): string | null {
  return problemaCampos(e.campos, d, "") ?? e.regla?.(d) ?? null;
}

// ───────────────────────── los elementos

const op = (...pares: [string, string][]) => pares.map(([valor, nombre]) => ({ valor, nombre }));
const DE_2_A_4 = op(["2", "2"], ["3", "3"], ["4", "4"]);
const ALINEACION = op(["izquierda", "A la izquierda"], ["centro", "Centrado"], ["derecha", "A la derecha"]);
const ALTOS = op(["bajo", "Bajo"], ["medio", "Medio"], ["alto", "Alto"]);

const CORREO: Patron = { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, mensaje: "El correo no es válido (por ejemplo, nombre@fedegan.org.co)." };
const TELEFONO: Patron = { re: /^[+()\d][\d\s().+-]{4,38}$/, mensaje: "El teléfono solo puede llevar números, espacios y los signos + ( ) - ." };

// Un botón necesita texto y enlace a la vez.
const reglaBoton = (boton: unknown, enlace: unknown) => (s(boton) && !s(enlace) ? "Falta el enlace del botón." : s(enlace) && !s(boton) ? "Escriba el texto del botón." : null);

/** Iconos que se pueden elegir en «Características» (nombre → icono de lucide-react, que resuelve el sitio). */
export const ICONOS_CARACTERISTICAS = op(
  ["check", "Visto bueno"], ["personas", "Personas"], ["documento", "Documento"], ["escudo", "Protección"], ["telefono", "Teléfono"], ["correo", "Correo"],
  ["calendario", "Calendario"], ["ubicacion", "Lugar"], ["corazon", "Corazón"], ["estrella", "Estrella"], ["crecimiento", "Crecimiento"], ["premio", "Premio"],
  ["reloj", "Reloj"], ["descarga", "Descarga"], ["mundo", "Mundo"], ["hoja", "Campo"], ["res", "Ganado"], ["leche", "Leche"], ["pasto", "Pasto"],
  ["tractor", "Tractor"], ["agua", "Agua"], ["vacuna", "Vacunación"], ["salud", "Sanidad"], ["camion", "Transporte"], ["balanza", "Normas"],
  ["edificio", "Institución"], ["alianza", "Alianza"], ["capacitacion", "Capacitación"], ["dinero", "Dinero"], ["tramite", "Trámite"], ["libro", "Libro"], ["idea", "Idea"],
);


/** Tipos de respuesta de una pregunta de «Formulario». */
export const TIPOS_CAMPO = [
  { valor: "texto", nombre: "Texto corto" }, { valor: "parrafo", nombre: "Texto largo" }, { valor: "correo", nombre: "Correo" },
  { valor: "telefono", nombre: "Teléfono" }, { valor: "numero", nombre: "Número" }, { valor: "fecha", nombre: "Fecha" },
  { valor: "lista", nombre: "Lista desplegable" }, { valor: "casillas", nombre: "Casillas (varias)" }, { valor: "archivo", nombre: "Archivo adjunto" },
];
export const CLAVE_FORMULARIO: Patron = { re: /^[a-z0-9][a-z0-9-]{2,49}$/, mensaje: "El nombre interno usa minúsculas, números y guiones, entre 3 y 50 caracteres (por ejemplo: inscripcion-seminario)." };

/** Las opciones escritas una por línea (o separadas por «;»): sin vacías ni repetidas. */
export function opcionesDe(texto: string): string[] {
  return [...new Set(texto.split(/[\n;]/).map((x) => x.trim().slice(0, 100)).filter(Boolean))].slice(0, 30);
}

export const ESQUEMAS = {
  // ── Texto
  aviso: {
    nombre: "Aviso",
    ayuda: "Nota informativa, advertencia o aviso importante",
    grupo: "Texto",
    icono: "Info",
    campos: [
      { k: "tono", tipo: "opcion", etiqueta: "Tipo de aviso", opciones: op(["info", "Información"], ["exito", "Éxito"], ["alerta", "Advertencia"], ["importante", "Importante"]), defecto: "info" },
      { k: "titulo", tipo: "texto", etiqueta: "Título (opcional)", max: 120 },
      { k: "texto", tipo: "parrafo", etiqueta: "Mensaje", max: 1500, filas: 3, formato: true, placeholder: "Escriba el aviso…" },
    ],
    principales: ["titulo", "texto"],
    vacioMensaje: "Escriba un título o un mensaje.",
  },
  cita: {
    nombre: "Cita",
    ayuda: "Frase destacada con su autor",
    grupo: "Texto",
    icono: "Quote",
    campos: [
      { k: "texto", tipo: "parrafo", etiqueta: "Cita", max: 700, filas: 3, obligatorio: true, placeholder: "La frase que quiere destacar…" },
      { k: "autor", tipo: "texto", etiqueta: "Autor", max: 120 },
      { k: "cargo", tipo: "texto", etiqueta: "Cargo o entidad", max: 140 },
      { k: "imagen", tipo: "imagen", etiqueta: "Foto (opcional)" },
    ],
    principales: ["texto"],
    vacioMensaje: "Escriba la cita.",
  },
  columnas: {
    nombre: "Columnas de texto",
    ayuda: "Dos o tres columnas, cada una con título y texto",
    grupo: "Texto",
    icono: "Columns3",
    campos: [
      { k: "columnas", tipo: "opcion", etiqueta: "Columnas", opciones: op(["2", "2"], ["3", "3"]), defecto: "2" },
      {
        k: "items", tipo: "lista", etiqueta: "Contenido de cada columna", nombreItem: "Columna", max: 3, minimo: 1, inicial: 2,
        campos: [
          { k: "titulo", tipo: "texto", etiqueta: "Título", max: 120 },
          { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 1200, filas: 4, formato: true },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Escriba el contenido de al menos una columna.",
  },

  // ── Acciones
  botones: {
    nombre: "Botones",
    ayuda: "Varios botones en una misma fila",
    grupo: "Acciones",
    icono: "SquareMousePointer",
    campos: [
      { k: "alineacion", tipo: "opcion", etiqueta: "Alineación", opciones: ALINEACION, defecto: "izquierda" },
      {
        k: "items", tipo: "lista", etiqueta: "Botones", nombreItem: "Botón", max: 6, minimo: 1, inicial: 2,
        campos: [
          { k: "texto", tipo: "texto", etiqueta: "Texto del botón", max: 80, obligatorio: true },
          { k: "enlace", tipo: "enlace", etiqueta: "Enlace", obligatorio: true, placeholder: "https://… o /ruta" },
          { k: "estilo", tipo: "opcion", etiqueta: "Estilo", opciones: op(["solido", "Relleno"], ["borde", "Solo borde"]), defecto: "solido" },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos un botón con su enlace.",
  },
  banner: {
    nombre: "Banner",
    ayuda: "Franja grande con imagen de fondo, título y botón",
    grupo: "Acciones",
    icono: "PanelTop",
    campos: [
      { k: "imagen", tipo: "imagen", etiqueta: "Imagen de fondo (opcional)" },
      { k: "titulo", tipo: "texto", etiqueta: "Título", max: 140, placeholder: "El mensaje principal" },
      { k: "texto", tipo: "parrafo", etiqueta: "Texto (opcional)", max: 400, filas: 2 },
      { k: "boton", tipo: "texto", etiqueta: "Texto del botón (opcional)", max: 40 },
      { k: "enlace", tipo: "enlace", etiqueta: "Enlace del botón" },
      { k: "alto", tipo: "opcion", etiqueta: "Alto", opciones: ALTOS, defecto: "medio" },
      { k: "alineacion", tipo: "opcion", etiqueta: "Alineación del texto", opciones: op(["izquierda", "A la izquierda"], ["centro", "Centrado"]), defecto: "izquierda" },
      { k: "fondo", tipo: "opcion", etiqueta: "Color (cuando no hay imagen)", opciones: op(["verde", "Verde"], ["oscuro", "Oscuro"], ["dorado", "Amarillo"]), defecto: "verde" },
    ],
    principales: ["imagen", "titulo", "texto"],
    regla: (d) => reglaBoton(d.boton, d.enlace),
    vacioMensaje: "Escriba el título del banner o elija una imagen.",
  },
  redes: {
    nombre: "Redes sociales",
    ayuda: "Botones a sus redes: Facebook, X, Instagram, YouTube…",
    grupo: "Acciones",
    icono: "Share2",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título (opcional)", max: 80, placeholder: "Síganos en nuestras redes" },
      {
        k: "items", tipo: "lista", etiqueta: "Redes", nombreItem: "Red", max: 10, minimo: 1, inicial: 3,
        campos: [
          { k: "red", tipo: "opcion", etiqueta: "Red", opciones: op(["facebook", "Facebook"], ["x", "X (Twitter)"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"], ["tiktok", "TikTok"], ["whatsapp", "WhatsApp"], ["web", "Sitio web"]), defecto: "facebook" },
          { k: "enlace", tipo: "enlace", etiqueta: "Enlace", obligatorio: true, placeholder: "https://…" },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una red con su enlace.",
  },

  // ── Medios
  imagentexto: {
    nombre: "Imagen y texto",
    ayuda: "Una foto junto a un título, un texto y un botón",
    grupo: "Medios",
    icono: "PanelLeft",
    campos: [
      { k: "imagen", tipo: "imagen", etiqueta: "Imagen", obligatorio: true },
      { k: "alt", tipo: "texto", etiqueta: "Descripción de la imagen", max: 250, ayuda: "La leen los lectores de pantalla y aparece si la imagen no carga." },
      { k: "posicion", tipo: "opcion", etiqueta: "La imagen va", opciones: op(["izquierda", "A la izquierda"], ["derecha", "A la derecha"]), defecto: "izquierda" },
      { k: "ancho", tipo: "opcion", etiqueta: "Ancho de la imagen", opciones: op(["tercio", "Un tercio"], ["mitad", "La mitad"]), defecto: "mitad" },
      { k: "titulo", tipo: "texto", etiqueta: "Título", max: 140 },
      { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 1500, filas: 4, formato: true },
      { k: "boton", tipo: "texto", etiqueta: "Texto del botón (opcional)", max: 40 },
      { k: "enlace", tipo: "enlace", etiqueta: "Enlace del botón" },
    ],
    principales: ["imagen", "titulo", "texto"],
    regla: (d) => reglaBoton(d.boton, d.enlace),
    vacioMensaje: "Elija la imagen y escriba el texto.",
  },
  galeria: {
    nombre: "Galería",
    ayuda: "Varias fotos en cuadrícula; al pulsar una se agranda",
    grupo: "Medios",
    icono: "Images",
    campos: [
      { k: "columnas", tipo: "opcion", etiqueta: "Fotos por fila", opciones: DE_2_A_4, defecto: "3" },
      {
        k: "items", tipo: "lista", etiqueta: "Fotos", nombreItem: "Foto", max: 30, minimo: 1, inicial: 3, subirVarias: { campo: "imagen", nombre: "pie" },
        campos: [
          { k: "imagen", tipo: "imagen", etiqueta: "Foto", obligatorio: true },
          { k: "pie", tipo: "texto", etiqueta: "Pie de foto (opcional)", max: 200 },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una foto.",
  },
  audio: {
    nombre: "Audio",
    ayuda: "Reproductor de un archivo MP3 (podcast, boletín hablado…)",
    grupo: "Medios",
    icono: "Headphones",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título", max: 160 },
      { k: "url", tipo: "archivo", etiqueta: "Archivo de audio", aceptar: ".mp3", obligatorio: true, placeholder: "https://… o suba un archivo MP3" },
    ],
    principales: ["titulo", "url"],
    vacioMensaje: "Suba el audio o pegue su dirección.",
  },
  logos: {
    nombre: "Logos",
    ayuda: "Cuadrícula de logos de aliados o patrocinadores",
    grupo: "Medios",
    icono: "Building2",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título (opcional)", max: 120, placeholder: "Nuestros aliados" },
      { k: "columnas", tipo: "opcion", etiqueta: "Logos por fila", opciones: op(["3", "3"], ["4", "4"], ["5", "5"]), defecto: "4" },
      {
        k: "items", tipo: "lista", etiqueta: "Logos", nombreItem: "Logo", max: 30, minimo: 1, inicial: 4, subirVarias: { campo: "imagen", nombre: "nombre" },
        campos: [
          { k: "imagen", tipo: "imagen", etiqueta: "Logo", obligatorio: true },
          { k: "nombre", tipo: "texto", etiqueta: "Nombre de la entidad", max: 120 },
          { k: "enlace", tipo: "enlace", etiqueta: "Enlace (opcional)" },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos un logo.",
  },

  // ── Contenido
  pestanas: {
    nombre: "Pestañas",
    ayuda: "Varios textos en pestañas; solo se ve uno a la vez",
    grupo: "Contenido",
    icono: "AppWindow",
    campos: [
      {
        k: "items", tipo: "lista", etiqueta: "Pestañas", nombreItem: "Pestaña", max: 8, minimo: 1, inicial: 3,
        campos: [
          { k: "titulo", tipo: "texto", etiqueta: "Título de la pestaña", max: 60, obligatorio: true },
          { k: "texto", tipo: "parrafo", etiqueta: "Contenido", max: 4000, filas: 5, formato: true },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una pestaña.",
  },
  cifras: {
    nombre: "Cifras",
    ayuda: "Números grandes con su explicación",
    grupo: "Contenido",
    icono: "ChartColumn",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título (opcional)", max: 120 },
      { k: "columnas", tipo: "opcion", etiqueta: "Cifras por fila", opciones: DE_2_A_4, defecto: "3" },
      {
        k: "items", tipo: "lista", etiqueta: "Cifras", nombreItem: "Cifra", max: 12, minimo: 1, inicial: 3,
        campos: [
          { k: "valor", tipo: "texto", etiqueta: "Cifra", max: 24, obligatorio: true, placeholder: "Por ejemplo: 27,5 millones" },
          { k: "etiqueta", tipo: "texto", etiqueta: "Qué significa", max: 100 },
          { k: "nota", tipo: "texto", etiqueta: "Nota o fuente (opcional)", max: 120 },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una cifra.",
  },
  pasos: {
    nombre: "Pasos",
    ayuda: "Instrucciones o trámite en pasos numerados",
    grupo: "Contenido",
    icono: "ListOrdered",
    campos: [
      {
        k: "items", tipo: "lista", etiqueta: "Pasos", nombreItem: "Paso", max: 20, minimo: 1, inicial: 3,
        campos: [
          { k: "titulo", tipo: "texto", etiqueta: "Qué hacer", max: 140, obligatorio: true },
          { k: "texto", tipo: "parrafo", etiqueta: "Detalle (opcional)", max: 800, filas: 3, formato: true },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos un paso.",
  },
  cronologia: {
    nombre: "Línea de tiempo",
    ayuda: "Fechas y hechos en orden, o un calendario de fechas clave",
    grupo: "Contenido",
    icono: "Milestone",
    campos: [
      { k: "estilo", tipo: "opcion", etiqueta: "Presentación", opciones: op(["linea", "Línea de tiempo"], ["fechas", "Fechas clave"]), defecto: "linea" },
      {
        k: "items", tipo: "lista", etiqueta: "Hechos", nombreItem: "Hecho", max: 30, minimo: 1, inicial: 3,
        campos: [
          { k: "fecha", tipo: "texto", etiqueta: "Fecha", max: 60, obligatorio: true, placeholder: "Por ejemplo: 15 de mayo" },
          { k: "titulo", tipo: "texto", etiqueta: "Título", max: 140 },
          { k: "texto", tipo: "parrafo", etiqueta: "Detalle (opcional)", max: 600, filas: 3, formato: true },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos un hecho con su fecha.",
  },
  caracteristicas: {
    nombre: "Características",
    ayuda: "Ventajas o servicios, cada uno con su icono",
    grupo: "Contenido",
    icono: "BadgeCheck",
    campos: [
      { k: "columnas", tipo: "opcion", etiqueta: "Por fila", opciones: DE_2_A_4, defecto: "3" },
      {
        k: "items", tipo: "lista", etiqueta: "Características", nombreItem: "Característica", max: 12, minimo: 1, inicial: 3,
        campos: [
          { k: "icono", tipo: "opcion", etiqueta: "Icono", opciones: ICONOS_CARACTERISTICAS, defecto: "check" },
          { k: "titulo", tipo: "texto", etiqueta: "Título", max: 100, obligatorio: true },
          { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 400, filas: 3 },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una característica.",
  },
  enlaces: {
    nombre: "Lista de enlaces",
    ayuda: "Enlaces destacados, cada uno con su explicación",
    grupo: "Contenido",
    icono: "Link2",
    campos: [
      {
        k: "items", tipo: "lista", etiqueta: "Enlaces", nombreItem: "Enlace", max: 20, minimo: 1, inicial: 3,
        campos: [
          { k: "titulo", tipo: "texto", etiqueta: "Título", max: 140, obligatorio: true },
          { k: "texto", tipo: "texto", etiqueta: "Explicación (opcional)", max: 200 },
          { k: "enlace", tipo: "enlace", etiqueta: "Enlace", obligatorio: true, placeholder: "https://… o /ruta" },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos un enlace con su título.",
  },
  ficha: {
    nombre: "Ficha de tema",
    ayuda: "Una ficha más en la cuadrícula de temas de la página",
    grupo: "Contenido",
    icono: "LayoutGrid",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título", max: 120, obligatorio: true },
      { k: "texto", tipo: "texto", etiqueta: "Descripción (opcional)", max: 160 },
      { k: "enlace", tipo: "enlace", etiqueta: "Enlace", obligatorio: true, placeholder: "https://… o /ruta" },
    ],
    principales: ["titulo", "enlace"],
    vacioMensaje: "Escriba el título de la ficha y a dónde lleva.",
  },
  formulario: {
    nombre: "Formulario",
    ayuda: "Recoge datos de los visitantes (inscripciones, solicitudes, consultas) y los envía a una API si lo desea",
    grupo: "Contenido",
    icono: "ClipboardList",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título del formulario", max: 120, obligatorio: true, placeholder: "Por ejemplo: Inscripción al seminario" },
      { k: "texto", tipo: "parrafo", etiqueta: "Descripción (opcional)", max: 500, filas: 2, formato: true },
      {
        k: "clave", tipo: "texto", etiqueta: "Nombre interno", max: 50, obligatorio: true, placeholder: "inscripcion-seminario",
        ayuda: "Sirve para reconocer las respuestas en el panel (Formularios). Solo minúsculas, números y guiones; no puede repetirse en otro formulario.",
        patron: CLAVE_FORMULARIO,
      },
      {
        k: "campos", tipo: "lista", etiqueta: "Preguntas", nombreItem: "Pregunta", max: 25, minimo: 1, inicial: 3,
        campos: [
          { k: "etiqueta", tipo: "texto", etiqueta: "Pregunta", max: 120, obligatorio: true, placeholder: "Por ejemplo: Nombre completo" },
          { k: "tipo", tipo: "opcion", etiqueta: "Tipo de respuesta", opciones: TIPOS_CAMPO, defecto: "texto" },
          { k: "opciones", tipo: "parrafo", etiqueta: "Opciones (solo para lista o casillas)", max: 600, filas: 3, placeholder: "Una opción por línea" },
          { k: "ayuda", tipo: "texto", etiqueta: "Ayuda bajo la pregunta (opcional)", max: 160 },
          { k: "requerido", tipo: "sino", etiqueta: "Es obligatoria", defecto: false },
        ],
      },
      { k: "boton", tipo: "texto", etiqueta: "Texto del botón", max: 40, placeholder: "Enviar" },
      { k: "gracias", tipo: "parrafo", etiqueta: "Mensaje al enviar", max: 300, filas: 2, placeholder: "¡Gracias! Recibimos su respuesta." },
      {
        k: "webhook", tipo: "texto", etiqueta: "Enviar también a una API (opcional)", max: 400, placeholder: "https://…",
        ayuda: "Cada respuesta se envía además por POST (JSON) a esta dirección. No se muestra a los visitantes.",
        patron: { re: /^https:\/\/[^\s]+$/, mensaje: "La dirección de la API debe empezar con https://." },
      },
    ],
    principales: ["titulo", "campos"],
    vacioMensaje: "Escriba el título y al menos una pregunta.",
    regla: (d) => {
      const lista = Array.isArray(d.campos) ? (d.campos as Datos[]) : [];
      for (let i = 0; i < lista.length; i++) {
        if ((s(lista[i].tipo) === "lista" || s(lista[i].tipo) === "casillas") && opcionesDe(s(lista[i].opciones)).length < 2) return `Pregunta ${i + 1}: escriba al menos dos opciones (una por línea).`;
      }
      return null;
    },
  },
  tabla: {
    nombre: "Tabla",
    ayuda: "Filas y columnas que se editan como una hoja de cálculo",
    grupo: "Contenido",
    icono: "Table2",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título de la tabla (opcional)", max: 160 },
      { k: "encabezado", tipo: "sino", etiqueta: "La primera fila es el encabezado", defecto: true },
      { k: "filas", tipo: "tabla", etiqueta: "Contenido", maxFilas: 40, maxColumnas: 8, maxCelda: 500 },
    ],
    principales: ["filas"],
    vacioMensaje: "Escriba el contenido de la tabla.",
  },

  // ── Personas y contacto
  personas: {
    nombre: "Personas",
    ayuda: "Tarjetas de equipo: foto, nombre, cargo y contacto",
    grupo: "Personas",
    icono: "UsersRound",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Título (opcional)", max: 120 },
      { k: "columnas", tipo: "opcion", etiqueta: "Personas por fila", opciones: DE_2_A_4, defecto: "3" },
      {
        k: "items", tipo: "lista", etiqueta: "Personas", nombreItem: "Persona", max: 24, minimo: 1, inicial: 3,
        campos: [
          { k: "foto", tipo: "imagen", etiqueta: "Foto (opcional)" },
          { k: "nombre", tipo: "texto", etiqueta: "Nombre", max: 120, obligatorio: true },
          { k: "cargo", tipo: "texto", etiqueta: "Cargo o área", max: 140 },
          { k: "correo", tipo: "texto", etiqueta: "Correo (opcional)", max: 120, patron: CORREO },
          { k: "telefono", tipo: "texto", etiqueta: "Teléfono (opcional)", max: 40, patron: TELEFONO },
        ],
      },
    ],
    principales: ["items"],
    vacioMensaje: "Añada al menos una persona con su nombre.",
  },
  contacto: {
    nombre: "Contacto",
    ayuda: "Teléfono, correo, dirección y horario de una oficina o persona",
    grupo: "Personas",
    icono: "ContactRound",
    campos: [
      { k: "titulo", tipo: "texto", etiqueta: "Nombre o área", max: 140, obligatorio: true },
      { k: "cargo", tipo: "texto", etiqueta: "Cargo o descripción (opcional)", max: 160 },
      { k: "telefono", tipo: "texto", etiqueta: "Teléfono (opcional)", max: 60, patron: TELEFONO },
      { k: "correo", tipo: "texto", etiqueta: "Correo (opcional)", max: 120, patron: CORREO },
      { k: "direccion", tipo: "texto", etiqueta: "Dirección (opcional)", max: 200, ayuda: "Con la dirección se añade un enlace «Cómo llegar» a Google Maps." },
      { k: "horario", tipo: "texto", etiqueta: "Horario (opcional)", max: 160 },
    ],
    principales: ["titulo", "telefono", "correo", "direccion", "horario"],
    vacioMensaje: "Escriba el nombre o el área del contacto.",
  },

  // ── Diseño
  espaciador: {
    nombre: "Espacio",
    ayuda: "Un espacio en blanco entre dos partes de la página",
    grupo: "Diseño",
    icono: "MoveVertical",
    campos: [{ k: "alto", tipo: "opcion", etiqueta: "Tamaño del espacio", opciones: op(["pequeno", "Pequeño"], ["medio", "Mediano"], ["grande", "Grande"]), defecto: "medio" }],
    siempre: true,
    vacioMensaje: "",
  },
} satisfies Record<string, Esquema>;

export type TipoEsquema = keyof typeof ESQUEMAS;

/** El esquema de un tipo de bloque, si es uno de estos elementos. */
export function esquemaDe(tipo: string): Esquema | undefined {
  return Object.prototype.hasOwnProperty.call(ESQUEMAS, tipo) ? (ESQUEMAS as Record<string, Esquema>)[tipo] : undefined;
}

export const TIPOS_ESQUEMA = Object.keys(ESQUEMAS) as TipoEsquema[];
