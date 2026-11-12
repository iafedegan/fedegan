// Formularios propios del portal: la forma del esquema, su lectura segura, la lógica condicional y la validación de respuestas.
// Módulo suelto (sin dependencias, se prueba con Node): lo usan el constructor, el formulario público y la acción del servidor.

export const TIPOS_CAMPO_FORM = [
  { valor: "texto", nombre: "Texto corto" },
  { valor: "parrafo", nombre: "Texto largo" },
  { valor: "numero", nombre: "Número" },
  { valor: "correo", nombre: "Correo" },
  { valor: "telefono", nombre: "Teléfono" },
  { valor: "fecha", nombre: "Fecha" },
  { valor: "opcion", nombre: "Selección única" },
  { valor: "lista", nombre: "Lista desplegable" },
  { valor: "casillas", nombre: "Casillas (varias)" },
  { valor: "escala", nombre: "Escala de valoración" },
  { valor: "archivo", nombre: "Archivo adjunto" },
] as const;
export type TipoCampoForm = (typeof TIPOS_CAMPO_FORM)[number]["valor"];
const TIPOS = new Set<string>(TIPOS_CAMPO_FORM.map((t) => t.valor));

export const OPERADORES = [
  { valor: "es", nombre: "es igual a" },
  { valor: "no_es", nombre: "es distinto de" },
  { valor: "contiene", nombre: "incluye" },
  { valor: "responde", nombre: "tiene respuesta" },
] as const;
export type Operador = (typeof OPERADORES)[number]["valor"];
const OPS = new Set<string>(OPERADORES.map((o) => o.valor));

/** «Mostrar esta pregunta solo si…» la respuesta de otra pregunta (anterior) cumple la condición. */
export type Condicion = { campo: string; op: Operador; valor: string };
export type CampoForm = {
  id: string;
  tipo: TipoCampoForm;
  etiqueta: string;
  ayuda: string;
  requerido: boolean;
  /** Una opción por línea (selección, lista y casillas). */
  opciones: string;
  /** Tope de la escala de valoración (de 1 a `max`). */
  max: number;
  si?: Condicion;
};
export type EsquemaForm = { campos: CampoForm[]; gracias: string };
export type Valor = string | string[];
export type RespuestaForm = { id: string; e: string; v: Valor };

export const MAX_CAMPOS = 40;
export const TIPOS_ARCHIVO_FORM = new Map([
  ["application/pdf", "pdf"], ["application/msword", "doc"], ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"], ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"], ["image/jpeg", "jpg"], ["image/png", "png"],
]);

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const TELEFONO = /^[+()\d][\d\s().+-]{4,38}$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const conOpciones = (t: TipoCampoForm) => t === "opcion" || t === "lista" || t === "casillas";

export function nuevoIdCampo() {
  return `q${Math.random().toString(36).slice(2, 8)}`;
}
export function campoNuevo(tipo: TipoCampoForm = "texto", etiqueta = ""): CampoForm {
  return { id: nuevoIdCampo(), tipo, etiqueta, ayuda: "", requerido: false, opciones: conOpciones(tipo) ? "Opción 1\nOpción 2" : "", max: 5 };
}
export const ESQUEMA_VACIO: EsquemaForm = { campos: [], gracias: "" };

/** Las opciones escritas una por línea (o separadas por «;»): sin vacías ni repetidas. */
export function opcionesForm(texto: string): string[] {
  return [...new Set(texto.split(/[\n;]/).map((x) => x.trim().slice(0, 100)).filter(Boolean))].slice(0, 30);
}

/** Lee lo guardado (o lo que llega del constructor) con su forma y sus límites. Algo raro → formulario vacío. */
export function leerEsquema(raw: unknown): EsquemaForm {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  if (!o || !Array.isArray(o.campos)) return { campos: [], gracias: "" };
  const vistos = new Set<string>();
  const campos: CampoForm[] = [];
  for (const x of o.campos.slice(0, MAX_CAMPOS)) {
    const p = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
    const etiqueta = str(p.etiqueta, 160);
    let id = str(p.id, 24).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!etiqueta) continue;
    if (!id || vistos.has(id)) id = nuevoIdCampo();
    vistos.add(id);
    const tipo = (TIPOS.has(String(p.tipo)) ? p.tipo : "texto") as TipoCampoForm;
    const max = Number(p.max) === 10 ? 10 : 5;
    let si: Condicion | undefined;
    const c = p.si && typeof p.si === "object" ? (p.si as Record<string, unknown>) : null;
    // La condición solo puede mirar una pregunta anterior (así no hay vueltas ni ciclos).
    if (c && typeof c.campo === "string" && campos.some((k) => k.id === c.campo) && OPS.has(String(c.op))) {
      si = { campo: c.campo, op: c.op as Operador, valor: str(c.valor, 100) };
    }
    campos.push({
      id, tipo, etiqueta, ayuda: str(p.ayuda, 200), requerido: p.requerido === true,
      opciones: typeof p.opciones === "string" ? p.opciones.slice(0, 1500) : "", max, ...(si ? { si } : {}),
    });
  }
  return { campos, gracias: str(o.gracias, 400) };
}

/** Qué está mal en el formulario (null = todo bien). */
export function problemaEsquema(e: EsquemaForm): string | null {
  if (e.campos.length === 0) return "Añada al menos una pregunta.";
  for (const c of e.campos) {
    if (conOpciones(c.tipo) && opcionesForm(c.opciones).length < 2) return `«${c.etiqueta}»: escriba al menos dos opciones (una por línea).`;
    if (c.si && c.si.op !== "responde" && !c.si.valor) return `«${c.etiqueta}»: la condición necesita un valor.`;
  }
  return null;
}

/** ¿La condición se cumple con estos valores? */
function cumple(si: Condicion, v: Valor | undefined): boolean {
  const lista = Array.isArray(v) ? v : v ? [v] : [];
  if (si.op === "responde") return lista.length > 0;
  if (si.op === "es") return lista.length === 1 && lista[0] === si.valor;
  if (si.op === "no_es") return !(lista.length === 1 && lista[0] === si.valor);
  return lista.includes(si.valor);
}

/** Las preguntas que se muestran con estos valores (una oculta no cuenta, y las que dependen de ella tampoco). */
export function visibles(campos: CampoForm[], valores: Record<string, Valor | undefined>): Set<string> {
  const ok = new Set<string>();
  for (const c of campos) {
    if (!c.si || (ok.has(c.si.campo) && cumple(c.si, valores[c.si.campo]))) ok.add(c.id);
  }
  return ok;
}

/**
 * Valida las respuestas con el esquema. `valores`: por id de pregunta; en las de archivo basta con el nombre (o "" si no hay).
 * Devuelve el primer error con su mensaje, o las respuestas listas (solo de las preguntas visibles y con respuesta).
 */
export function validarRespuestas(e: EsquemaForm, valores: Record<string, Valor | undefined>): { error: string } | { respuestas: RespuestaForm[] } {
  const ver = visibles(e.campos, valores);
  const respuestas: RespuestaForm[] = [];
  for (const c of e.campos) {
    if (!ver.has(c.id)) continue;
    const falta = `Falta responder «${c.etiqueta}».`;
    const opciones = opcionesForm(c.opciones);
    const bruto = valores[c.id];
    if (c.tipo === "casillas") {
      const marcadas = Array.isArray(bruto) ? bruto : bruto ? [bruto] : [];
      if (marcadas.some((m) => !opciones.includes(m))) return { error: `«${c.etiqueta}»: elija solo entre las opciones.` };
      if (marcadas.length === 0) {
        if (c.requerido) return { error: falta };
        continue;
      }
      respuestas.push({ id: c.id, e: c.etiqueta, v: marcadas });
      continue;
    }
    const t = (Array.isArray(bruto) ? bruto[0] ?? "" : bruto ?? "").trim().slice(0, c.tipo === "parrafo" ? 3000 : 300);
    if (!t) {
      if (c.requerido) return { error: falta };
      continue;
    }
    if (c.tipo === "correo" && !CORREO.test(t)) return { error: `«${c.etiqueta}»: escriba un correo válido.` };
    if (c.tipo === "telefono" && !TELEFONO.test(t)) return { error: `«${c.etiqueta}»: escriba un teléfono válido.` };
    if (c.tipo === "numero" && !/^-?\d+([.,]\d+)?$/.test(t)) return { error: `«${c.etiqueta}»: escriba solo un número.` };
    if (c.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return { error: `«${c.etiqueta}»: elija una fecha.` };
    if ((c.tipo === "opcion" || c.tipo === "lista") && !opciones.includes(t)) return { error: `«${c.etiqueta}»: elija una de las opciones.` };
    if (c.tipo === "escala") {
      const n = Number(t);
      if (!Number.isInteger(n) || n < 1 || n > c.max) return { error: `«${c.etiqueta}»: elija un valor de 1 a ${c.max}.` };
    }
    respuestas.push({ id: c.id, e: c.etiqueta, v: t });
  }
  return { respuestas };
}

/** Un nombre de dirección (slug) a partir del título: minúsculas, sin tildes ni símbolos. */
export function slugDe(titulo: string): string {
  const s = titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50).replace(/-+$/, "");
  return s || "formulario";
}
export const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;
