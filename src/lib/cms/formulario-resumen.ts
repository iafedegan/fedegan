// Resumen de las respuestas de un formulario para su dashboard y sus descargas.
// Módulo suelto (sin dependencias de servidor, se prueba con Node).
import { esFilas, esPregunta, opcionesForm, valorTexto, type CampoForm, type ColumnaTabla, type EsquemaForm, type Fila, type RespuestaForm } from "./formulario-esquema";

export type RespuestaBase = { id: string; version: number; answers: RespuestaForm[]; created_at: string };
export type Conteo = { etiqueta: string; n: number };
export type ResumenCampo =
  | { tipo: "conteo"; campo: CampoForm; respondidas: number; conteos: Conteo[]; multiple: boolean; promedio?: number }
  | { tipo: "numero"; campo: CampoForm; respondidas: number; promedio: number; minimo: number; maximo: number; suma: number }
  | { tipo: "texto"; campo: CampoForm; respondidas: number; recientes: string[]; repetidos: Conteo[] }
  | { tipo: "tabla"; campo: CampoForm; respondidas: number; filas: number; columnas: ResumenColumna[] };
export type ResumenColumna =
  | { tipo: "conteo"; columna: ColumnaTabla; respondidas: number; conteos: Conteo[] }
  | { tipo: "numero"; columna: ColumnaTabla; respondidas: number; promedio: number; suma: number }
  | { tipo: "texto"; columna: ColumnaTabla; respondidas: number; repetidos: Conteo[]; recientes: string[] };

const num = (s: string) => Number(s.replace(",", "."));
const normal = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");

/** Cuenta valores en el orden de las opciones del esquema; lo que llegó y ya no está como opción va al final. */
function contar(valores: string[], opciones: string[]): Conteo[] {
  const m = new Map<string, number>(opciones.map((o) => [o, 0]));
  for (const v of valores) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m].map(([etiqueta, n]) => ({ etiqueta, n }));
}

/** Los textos que más se repiten (sin importar mayúsculas ni tildes), útil para «herramientas» o «actividades» escritas a mano. */
function repetidos(valores: string[], tope = 8): Conteo[] {
  const m = new Map<string, { etiqueta: string; n: number }>();
  for (const v of valores) {
    const k = normal(v);
    if (!k) continue;
    const x = m.get(k);
    if (x) x.n++;
    else m.set(k, { etiqueta: v.trim(), n: 1 });
  }
  return [...m.values()].filter((x) => x.n > 1).sort((a, b) => b.n - a.n).slice(0, tope);
}

function resumenColumna(k: ColumnaTabla, filas: Fila[]): ResumenColumna {
  const vals = filas.map((f) => f[k.id] ?? "").filter(Boolean);
  if (k.tipo === "lista") return { tipo: "conteo", columna: k, respondidas: vals.length, conteos: contar(vals, opcionesForm(k.opciones)) };
  if (k.tipo === "numero") {
    const ns = vals.map(num).filter(Number.isFinite);
    const suma = ns.reduce((a, b) => a + b, 0);
    return { tipo: "numero", columna: k, respondidas: ns.length, suma, promedio: ns.length ? suma / ns.length : 0 };
  }
  return { tipo: "texto", columna: k, respondidas: vals.length, repetidos: repetidos(vals), recientes: vals.slice(0, 5) };
}

export function resumir(esquema: EsquemaForm, respuestas: RespuestaBase[]): ResumenCampo[] {
  return esquema.campos.filter((c) => esPregunta(c.tipo)).map((c): ResumenCampo => {
    const vals = respuestas.map((r) => r.answers.find((a) => a.id === c.id)?.v).filter((v) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));
    if (c.tipo === "tabla") {
      const filas = vals.filter(esFilas).flat();
      return { tipo: "tabla", campo: c, respondidas: vals.length, filas: filas.length, columnas: (c.columnas ?? []).map((k) => resumenColumna(k, filas)) };
    }
    if (c.tipo === "opcion" || c.tipo === "lista" || c.tipo === "casillas" || c.tipo === "escala") {
      const planos = vals.flatMap((v) => (Array.isArray(v) ? (v as string[]) : [v as string]));
      const opciones = c.tipo === "escala" ? Array.from({ length: c.max }, (_, i) => String(i + 1)) : opcionesForm(c.opciones);
      const promedio = c.tipo === "escala" && planos.length ? planos.map(Number).reduce((a, b) => a + b, 0) / planos.length : undefined;
      return { tipo: "conteo", campo: c, respondidas: vals.length, conteos: contar(planos, opciones), multiple: c.tipo === "casillas", ...(promedio !== undefined ? { promedio } : {}) };
    }
    if (c.tipo === "numero") {
      const ns = vals.map((v) => num(String(v))).filter(Number.isFinite);
      const suma = ns.reduce((a, b) => a + b, 0);
      return { tipo: "numero", campo: c, respondidas: ns.length, suma, promedio: ns.length ? suma / ns.length : 0, minimo: ns.length ? Math.min(...ns) : 0, maximo: ns.length ? Math.max(...ns) : 0 };
    }
    const textos = vals.map((v) => valorTexto(v as string));
    return { tipo: "texto", campo: c, respondidas: vals.length, recientes: textos.slice(0, 5), repetidos: repetidos(textos) };
  });
}

/** Respuestas por día de los últimos `dias` días (hasta `hoy`, en formato AAAA-MM-DD). */
export function porDia(respuestas: RespuestaBase[], hoy: string, dias = 30): { label: string; value: number }[] {
  const fin = new Date(`${hoy}T00:00:00Z`).getTime();
  const m = new Map<string, number>();
  for (const r of respuestas) m.set(r.created_at.slice(0, 10), (m.get(r.created_at.slice(0, 10)) ?? 0) + 1);
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(fin - (dias - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return { label: d.slice(8, 10) + "/" + d.slice(5, 7), value: m.get(d) ?? 0 };
  });
}

// ——— Tablas para descargar (CSV, Excel) ———

export type Tabla = { nombre: string; cabecera: string[]; filas: (string | number)[][] };

/** Hoja general (una fila por respuesta) y una hoja por cada pregunta de tabla (una fila por fila respondida). */
export function tablasExportables(esquema: EsquemaForm, respuestas: RespuestaBase[]): Tabla[] {
  // Columnas: preguntas actuales y, al final, las de versiones anteriores que ya no están.
  const simples = new Map<string, string>();
  const tablas = new Map<string, CampoForm>();
  for (const c of esquema.campos) {
    if (!esPregunta(c.tipo)) continue;
    if (c.tipo === "tabla") tablas.set(c.id, c);
    else simples.set(c.id, c.etiqueta);
  }
  for (const r of respuestas) for (const a of r.answers) if (!simples.has(a.id) && !tablas.has(a.id) && !esFilas(a.v)) simples.set(a.id, a.e);
  const ids = [...simples.keys()];
  const fecha = (s: string) => s.slice(0, 19).replace("T", " ");
  const codigo = (r: RespuestaBase) => r.id.slice(0, 8).toUpperCase();
  const simple = (r: RespuestaBase, id: string) => {
    const a = r.answers.find((x) => x.id === id);
    return a ? valorTexto(a.v) : "";
  };

  const general: Tabla = {
    nombre: "Respuestas",
    cabecera: ["Código", "Fecha", "Versión", ...ids.map((k) => simples.get(k) ?? k), ...[...tablas.values()].map((t) => `${t.etiqueta} (n.º de filas)`)],
    filas: respuestas.map((r) => [
      codigo(r), fecha(r.created_at), r.version, ...ids.map((k) => simple(r, k)),
      ...[...tablas.keys()].map((k) => {
        const v = r.answers.find((a) => a.id === k)?.v;
        return esFilas(v) ? v.length : 0;
      }),
    ]),
  };

  const detalle = [...tablas.values()].map((t): Tabla => {
    const cols = t.columnas ?? [];
    // Para poder filtrar por persona, cada fila lleva también las respuestas generales (las primeras cuatro).
    const ident = ids.slice(0, 4);
    return {
      nombre: t.etiqueta.slice(0, 31),
      cabecera: ["Código", "Fecha", ...ident.map((k) => simples.get(k) ?? k), "N.º", ...cols.map((k) => k.etiqueta)],
      filas: respuestas.flatMap((r) => {
        const v = r.answers.find((a) => a.id === t.id)?.v;
        return esFilas(v) ? v.map((f, i) => [codigo(r), fecha(r.created_at), ...ident.map((k) => simple(r, k)), i + 1, ...cols.map((k) => f[k.id] ?? "")]) : [];
      }),
    };
  });
  return [general, ...detalle];
}

/** Texto CSV (con BOM para que Excel lea bien las tildes y sin fórmulas peligrosas). */
export function aCsv(t: Tabla): string {
  const cel = (v: string | number) => {
    let s = String(v).replace(/"/g, '""');
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s}"`;
  };
  return "﻿" + [t.cabecera, ...t.filas].map((f) => f.map(cel).join(",")).join("\r\n");
}
