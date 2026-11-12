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
  { valor: "tabla", nombre: "Tabla (varias filas)" },
  { valor: "seccion", nombre: "Título de sección" },
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
  /** Columnas de una tabla: cada fila que añade quien responde las llena (p. ej. una fila por actividad). */
  columnas?: ColumnaTabla[];
  /** Opciones que salen de un catálogo (p. ej. áreas, o los cargos del área elegida en otra pregunta). */
  catalogo?: FuenteCatalogo;
  si?: Condicion;
};

// ——— Catálogos: listas encadenadas área → cargo → tareas ———
export const CATALOGOS = [{ id: "cargos-fng-2026", nombre: "Cargos y tareas FNG 2026" }] as const;
const CATALOGO_IDS = new Set<string>(CATALOGOS.map((c) => c.id));
/** `area`: las áreas; `cargo`: los cargos del área respondida en `padre`; `tarea` (columna de tabla): las tareas del cargo respondido en `padre`. */
export type FuenteCatalogo = { id: string; nivel: "area" | "cargo" | "tarea"; padre?: string };
/** Lo que el formulario necesita de un catálogo para las listas: área → cargos. */
export type MapaCargos = Record<string, string[]>;
export const OTRO_CARGO = "Otro (no está en la lista)";

function leerFuente(raw: unknown, previos: string[], niveles: FuenteCatalogo["nivel"][]): FuenteCatalogo | undefined {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!o || !CATALOGO_IDS.has(String(o.id)) || !niveles.includes(o.nivel as FuenteCatalogo["nivel"])) return undefined;
  const nivel = o.nivel as FuenteCatalogo["nivel"];
  if (nivel === "area") return { id: String(o.id), nivel };
  // Cargo y tarea dependen de una pregunta anterior.
  return typeof o.padre === "string" && previos.includes(o.padre) ? { id: String(o.id), nivel, padre: o.padre } : undefined;
}

/** Llena las opciones de las listas que salen de un catálogo según lo ya respondido (el área elegida define los cargos). */
export function aplicarCatalogo(e: EsquemaForm, mapas: Record<string, MapaCargos>, valores: Record<string, Valor | undefined>): EsquemaForm {
  if (!e.campos.some((c) => c.catalogo)) return e;
  return {
    ...e,
    campos: e.campos.map((c) => {
      const mapa = c.catalogo ? mapas[c.catalogo.id] : undefined;
      if (!c.catalogo || !mapa) return c;
      if (c.catalogo.nivel === "area") return { ...c, opciones: Object.keys(mapa).join("\n") };
      const area = valores[c.catalogo.padre ?? ""];
      const cargos = typeof area === "string" ? mapa[area] ?? [] : [];
      return { ...c, opciones: cargos.length ? [...cargos, OTRO_CARGO].join("\n") : "" };
    }),
  };
}
export const TIPOS_COLUMNA = [
  { valor: "texto", nombre: "Texto corto" },
  { valor: "parrafo", nombre: "Texto largo" },
  { valor: "lista", nombre: "Lista de opciones" },
  { valor: "numero", nombre: "Número" },
] as const;
export type TipoColumna = (typeof TIPOS_COLUMNA)[number]["valor"];
const TIPOS_COL = new Set<string>(TIPOS_COLUMNA.map((t) => t.valor));
export type ColumnaTabla = { id: string; etiqueta: string; tipo: TipoColumna; opciones: string; requerido: boolean; catalogo?: FuenteCatalogo };
export type Fila = Record<string, string>;
export type EsquemaForm = { campos: CampoForm[]; gracias: string };
export type Valor = string | string[] | Fila[];
export type RespuestaForm = { id: string; e: string; v: Valor };

export const MAX_CAMPOS = 60;
export const MAX_COLUMNAS = 12;
export const MAX_FILAS = 40;
/** Campos que no piden respuesta (solo organizan el formulario). */
export const esPregunta = (t: TipoCampoForm) => t !== "seccion";
export const esFilas = (v: Valor | undefined): v is Fila[] => Array.isArray(v) && v.some((x) => typeof x === "object" && x !== null);
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
export function columnaNueva(tipo: TipoColumna = "texto", etiqueta = "", opciones = ""): ColumnaTabla {
  return { id: `k${Math.random().toString(36).slice(2, 7)}`, etiqueta, tipo, opciones: tipo === "lista" && !opciones ? "Opción 1\nOpción 2" : opciones, requerido: false };
}
export function campoNuevo(tipo: TipoCampoForm = "texto", etiqueta = ""): CampoForm {
  return {
    id: nuevoIdCampo(), tipo, etiqueta, ayuda: "", requerido: false, opciones: conOpciones(tipo) ? "Opción 1\nOpción 2" : "", max: 5,
    ...(tipo === "tabla" ? { columnas: [columnaNueva("texto", "Descripción")] } : {}),
  };
}

function leerColumnas(raw: unknown, previos: string[] = []): ColumnaTabla[] {
  if (!Array.isArray(raw)) return [];
  const vistos = new Set<string>();
  return raw.slice(0, MAX_COLUMNAS).flatMap((x): ColumnaTabla[] => {
    const p = x && typeof x === "object" ? (x as Record<string, unknown>) : {};
    const etiqueta = str(p.etiqueta, 120);
    if (!etiqueta) return [];
    let id = str(p.id, 24).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!id || vistos.has(id)) id = columnaNueva().id;
    vistos.add(id);
    const tipo = (TIPOS_COL.has(String(p.tipo)) ? p.tipo : "texto") as TipoColumna;
    // Solo las columnas de texto pueden sugerir tareas del catálogo (quien responde también puede escribir otra).
    const catalogo = tipo === "texto" || tipo === "parrafo" ? leerFuente(p.catalogo, previos, ["tarea"]) : undefined;
    return [{ id, etiqueta, tipo, opciones: typeof p.opciones === "string" ? p.opciones.slice(0, 1500) : "", requerido: p.requerido === true, ...(catalogo ? { catalogo } : {}) }];
  });
}

/** Una respuesta como texto legible (para listas, CSV y Excel). */
export function valorTexto(v: Valor, columnas?: ColumnaTabla[]): string {
  if (typeof v === "string") return v;
  if (!esFilas(v)) return (v as string[]).join(", ");
  return v.map((f, i) => `${i + 1}) ${(columnas?.length ? columnas.map((c) => [c.etiqueta, f[c.id] ?? ""]) : Object.entries(f)).filter(([, x]) => x).map(([k, x]) => `${k}: ${x}`).join(" · ")}`).join("\n");
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
      ...(tipo === "tabla" ? { columnas: leerColumnas(p.columnas, campos.map((k) => k.id)) } : {}),
      ...(() => {
        const catalogo = tipo === "lista" ? leerFuente(p.catalogo, campos.map((k) => k.id), ["area", "cargo"]) : undefined;
        return catalogo ? { catalogo } : {};
      })(),
    });
  }
  return { campos, gracias: str(o.gracias, 400) };
}

/** Qué está mal en el formulario (null = todo bien). */
export function problemaEsquema(e: EsquemaForm): string | null {
  if (!e.campos.some((c) => esPregunta(c.tipo))) return "Añada al menos una pregunta.";
  for (const c of e.campos) {
    if (conOpciones(c.tipo) && !c.catalogo && opcionesForm(c.opciones).length < 2) return `«${c.etiqueta}»: escriba al menos dos opciones (una por línea).`;
    if (c.tipo === "tabla") {
      if (!c.columnas?.length) return `«${c.etiqueta}»: añada al menos una columna a la tabla.`;
      for (const k of c.columnas) if (k.tipo === "lista" && opcionesForm(k.opciones).length < 2) return `«${c.etiqueta}» → «${k.etiqueta}»: escriba al menos dos opciones.`;
    }
    if (c.si && c.si.op !== "responde" && !c.si.valor) return `«${c.etiqueta}»: la condición necesita un valor.`;
  }
  return null;
}

/** ¿La condición se cumple con estos valores? */
function cumple(si: Condicion, v: Valor | undefined): boolean {
  if (esFilas(v)) return si.op === "responde" ? v.length > 0 : false;
  const lista = (Array.isArray(v) ? v : v ? [v] : []) as string[];
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
    if (!ver.has(c.id) || !esPregunta(c.tipo)) continue;
    const falta = `Falta responder «${c.etiqueta}».`;
    const opciones = opcionesForm(c.opciones);
    const bruto = valores[c.id];
    if (c.tipo === "tabla") {
      const cols = c.columnas ?? [];
      const filas = (Array.isArray(bruto) ? bruto : []).filter((f): f is Fila => typeof f === "object" && f !== null).slice(0, MAX_FILAS);
      const limpias: Fila[] = [];
      for (const f of filas) {
        const fila: Fila = {};
        for (const k of cols) {
          const x = typeof f[k.id] === "string" ? f[k.id].trim().slice(0, k.tipo === "parrafo" ? 2000 : 300) : "";
          if (x) fila[k.id] = x;
        }
        if (Object.keys(fila).length === 0) continue; // fila vacía: se ignora
        const n = limpias.length + 1;
        for (const k of cols) {
          const x = fila[k.id] ?? "";
          if (!x && k.requerido) return { error: `«${c.etiqueta}», fila ${n}: falta «${k.etiqueta}».` };
          if (x && k.tipo === "lista" && !opcionesForm(k.opciones).includes(x)) return { error: `«${c.etiqueta}», fila ${n}: «${k.etiqueta}» debe ser una de las opciones.` };
          if (x && k.tipo === "numero" && !/^-?\d+([.,]\d+)?$/.test(x)) return { error: `«${c.etiqueta}», fila ${n}: «${k.etiqueta}» debe ser un número.` };
        }
        limpias.push(fila);
      }
      if (limpias.length === 0) {
        if (c.requerido) return { error: `«${c.etiqueta}»: añada al menos una fila.` };
        continue;
      }
      respuestas.push({ id: c.id, e: c.etiqueta, v: limpias });
      continue;
    }
    if (c.tipo === "casillas") {
      const marcadas = (Array.isArray(bruto) ? bruto : bruto ? [bruto] : []) as string[];
      if (marcadas.some((m) => typeof m !== "string")) return { error: `«${c.etiqueta}»: elija solo entre las opciones.` };
      if (marcadas.some((m) => !opciones.includes(m))) return { error: `«${c.etiqueta}»: elija solo entre las opciones.` };
      if (marcadas.length === 0) {
        if (c.requerido) return { error: falta };
        continue;
      }
      respuestas.push({ id: c.id, e: c.etiqueta, v: marcadas });
      continue;
    }
    const primero = Array.isArray(bruto) ? bruto[0] : bruto;
    const t = (typeof primero === "string" ? primero : "").trim().slice(0, c.tipo === "parrafo" ? 3000 : 300);
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
