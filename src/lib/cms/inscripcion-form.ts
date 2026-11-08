// Formulario de inscripción de un evento: las preguntas que el editor añade además del nombre y el correo (que siempre se piden).
// Módulo suelto (se prueba con Node): lo usan el editor, el formulario público y la acción del servidor.

export const TIPOS_CAMPO = [
  { valor: "texto", nombre: "Texto corto" }, { valor: "parrafo", nombre: "Texto largo" }, { valor: "correo", nombre: "Correo" },
  { valor: "telefono", nombre: "Teléfono" }, { valor: "numero", nombre: "Número" }, { valor: "fecha", nombre: "Fecha" },
  { valor: "lista", nombre: "Lista desplegable" }, { valor: "casillas", nombre: "Casillas (varias)" }, { valor: "archivo", nombre: "Archivo adjunto" },
] as const;
export type TipoCampo = (typeof TIPOS_CAMPO)[number]["valor"];
const TIPOS = new Set<string>(TIPOS_CAMPO.map((t) => t.valor));

/** `preset`: la respuesta también se guarda en la columna de la inscripción (así las listas y el CSV de siempre siguen igual). */
export type Preset = "phone" | "document" | "organization";
export type Pregunta = { etiqueta: string; tipo: TipoCampo; opciones: string; ayuda: string; requerido: boolean; preset?: Preset };
export type FormEvento = { preguntas: Pregunta[]; gracias: string; webhook: string };
export type Respuesta = { e: string; v: string | string[] };

export const PREGUNTAS_BASE: Pregunta[] = [
  { etiqueta: "Celular", tipo: "telefono", opciones: "", ayuda: "", requerido: false, preset: "phone" },
  { etiqueta: "Documento", tipo: "texto", opciones: "", ayuda: "", requerido: false, preset: "document" },
  { etiqueta: "Empresa o gremio", tipo: "texto", opciones: "", ayuda: "", requerido: false, preset: "organization" },
];

/** Preguntas que se añaden con un clic. */
export const SUGERENCIAS: Pregunta[] = [
  { etiqueta: "Cargo", tipo: "texto", opciones: "", ayuda: "", requerido: false },
  { etiqueta: "Ciudad o municipio", tipo: "texto", opciones: "", ayuda: "", requerido: false },
  { etiqueta: "¿Es ganadero?", tipo: "lista", opciones: "Sí\nNo", ayuda: "", requerido: false },
  { etiqueta: "Tamaño del hato", tipo: "lista", opciones: "Menos de 50 cabezas\nDe 50 a 200\nMás de 200", ayuda: "", requerido: false },
  { etiqueta: "¿Cómo se enteró del evento?", tipo: "lista", opciones: "Correo\nRedes sociales\nGremio\nAmigo o colega\nOtro", ayuda: "", requerido: false },
  { etiqueta: "Temas de su interés", tipo: "casillas", opciones: "Sanidad\nNutrición\nGenética\nMercado", ayuda: "", requerido: false },
  { etiqueta: "Comentarios o preguntas", tipo: "parrafo", opciones: "", ayuda: "", requerido: false },
  { etiqueta: "Soporte (archivo)", tipo: "archivo", opciones: "", ayuda: "", requerido: false },
];

export const MAX_PREGUNTAS = 15;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Las opciones escritas una por línea (o separadas por «;»): sin vacías ni repetidas. */
export function opcionesDe(texto: string): string[] {
  return [...new Set(texto.split(/[\n;]/).map((x) => x.trim().slice(0, 100)).filter(Boolean))].slice(0, 30);
}

/** Lee lo guardado (o lo que llega del editor) con su forma y sus límites. null o algo raro → el formulario de siempre. */
export function leerForm(raw: unknown): FormEvento {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  if (!o || !Array.isArray(o.preguntas)) return { preguntas: PREGUNTAS_BASE, gracias: "", webhook: "" };
  const preguntas = o.preguntas.slice(0, MAX_PREGUNTAS).flatMap((x): Pregunta[] => {
    const p = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
    const etiqueta = str(p.etiqueta, 120);
    if (!etiqueta) return [];
    const tipo = (TIPOS.has(String(p.tipo)) ? p.tipo : "texto") as TipoCampo;
    const preset = p.preset === "phone" || p.preset === "document" || p.preset === "organization" ? p.preset : undefined;
    return [{ etiqueta, tipo, opciones: typeof p.opciones === "string" ? p.opciones.slice(0, 600) : "", ayuda: str(p.ayuda, 160), requerido: p.requerido === true, ...(preset ? { preset } : {}) }];
  });
  return { preguntas, gracias: str(o.gracias, 300), webhook: str(o.webhook, 400) };
}

/** Qué está mal en el formulario del editor (null = todo bien). */
export function problemaForm(f: FormEvento): string | null {
  for (let i = 0; i < f.preguntas.length; i++) {
    const p = f.preguntas[i];
    if ((p.tipo === "lista" || p.tipo === "casillas") && opcionesDe(p.opciones).length < 2) return `«${p.etiqueta}»: escriba al menos dos opciones (una por línea).`;
  }
  if (new Set(f.preguntas.map((p) => p.etiqueta.toLowerCase())).size !== f.preguntas.length) return "Hay dos preguntas con el mismo nombre; cámbiele uno.";
  if (f.webhook && !/^https:\/\/[^\s]+$/.test(f.webhook)) return "La dirección de la API debe empezar con https://.";
  return null;
}
