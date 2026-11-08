// Materiales del Studio de la Escuela Virtual: forma de cada uno y limpieza de lo que devuelve el modelo.
// Puro (sin servidor): lo usan el generador, el panel del estudiante y las pruebas.

export const KINDS = ["resumen", "guia", "mapa", "tarjetas", "cuestionario", "faq", "linea", "glosario", "informe"] as const;
export type StudioKind = (typeof KINDS)[number];

export type Nodo = { t: string; hijos?: Nodo[] };
export type Contenido = {
  resumen?: { idea: string; puntos: { titulo: string; texto: string }[]; cierre: string };
  guia?: { objetivos: string[]; conceptos: { termino: string; definicion: string }[]; repaso: { pregunta: string; respuesta: string }[]; antes: string[] };
  mapa?: Nodo;
  tarjetas?: { q: string; a: string }[];
  cuestionario?: { q: string; options: string[]; correct: number; why: string }[];
  faq?: { q: string; a: string }[];
  linea?: { etiqueta: string; texto: string }[];
  glosario?: { termino: string; definicion: string }[];
  informe?: { titulo: string; introduccion: string; secciones: { titulo: string; texto: string }[]; conclusiones: string[] };
};

/** Lo mínimo de cada material para considerarlo útil (si el modelo trae menos, se descarta y se pide de nuevo). */
const MINIMO: Record<StudioKind, number> = { resumen: 3, guia: 3, mapa: 3, tarjetas: 4, cuestionario: 3, faq: 3, linea: 3, glosario: 4, informe: 2 };

type Obj = Record<string, unknown>;
const esObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Texto de una línea o párrafo, sin saltos raros ni formato de código. */
function txt(v: unknown, max: number): string {
  const s = typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
  return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}
const lista = (v: unknown, max: number, n: number) => arr(v).map((x) => txt(x, max)).filter(Boolean).slice(0, n);

function nodo(v: unknown, nivel: number): Nodo | null {
  if (typeof v === "string") return txt(v, 70) ? { t: txt(v, 70) } : null;
  if (!esObj(v)) return null;
  const t = txt(v.t ?? v.texto ?? v.titulo ?? v.nombre, 70);
  if (!t) return null;
  const hijos = nivel >= 3 ? [] : arr(v.hijos ?? v.children ?? v.ramas).map((h) => nodo(h, nivel + 1)).filter((h): h is Nodo => h !== null).slice(0, 8);
  return hijos.length ? { t, hijos } : { t };
}

/** Limpia y acota el JSON del modelo. Lo que no tenga el mínimo útil se omite (el material queda «pendiente»). */
export function normalizarContenido(raw: unknown): Contenido {
  const r = esObj(raw) ? raw : {};
  const out: Contenido = {};

  if (esObj(r.resumen)) {
    const x = r.resumen;
    const puntos = arr(x.puntos).map((p) => (esObj(p) ? { titulo: txt(p.titulo ?? p.t, 90), texto: txt(p.texto ?? p.descripcion, 400) } : { titulo: "", texto: txt(p, 400) })).filter((p) => p.texto).slice(0, 8);
    if (puntos.length >= MINIMO.resumen) out.resumen = { idea: txt(x.idea ?? x.introduccion, 400), puntos, cierre: txt(x.cierre ?? x.conclusion, 400) };
  }

  if (esObj(r.guia)) {
    const x = r.guia;
    const conceptos = arr(x.conceptos).map((c) => (esObj(c) ? { termino: txt(c.termino ?? c.t, 80), definicion: txt(c.definicion ?? c.texto, 300) } : null)).filter((c): c is { termino: string; definicion: string } => !!c && !!c.termino && !!c.definicion).slice(0, 10);
    const repaso = arr(x.repaso).map((c) => (esObj(c) ? { pregunta: txt(c.pregunta ?? c.q, 220), respuesta: txt(c.respuesta ?? c.a, 400) } : null)).filter((c): c is { pregunta: string; respuesta: string } => !!c && !!c.pregunta && !!c.respuesta).slice(0, 8);
    const objetivos = lista(x.objetivos, 220, 6);
    if (conceptos.length + repaso.length + objetivos.length >= MINIMO.guia) out.guia = { objetivos, conceptos, repaso, antes: lista(x.antes ?? x.antes_de_evaluar, 220, 6) };
  }

  const mapa = nodo(r.mapa, 0);
  if (mapa && (mapa.hijos?.length ?? 0) >= MINIMO.mapa) out.mapa = mapa;

  const pares = (v: unknown, max: number) => arr(v).map((c) => (esObj(c) ? { q: txt(c.q ?? c.pregunta ?? c.termino, 220), a: txt(c.a ?? c.respuesta ?? c.definicion, max) } : null)).filter((c): c is { q: string; a: string } => !!c && !!c.q && !!c.a);
  const tarjetas = pares(r.tarjetas, 300).slice(0, 16);
  if (tarjetas.length >= MINIMO.tarjetas) out.tarjetas = tarjetas;
  const faq = pares(r.faq, 500).slice(0, 10);
  if (faq.length >= MINIMO.faq) out.faq = faq;

  const preguntas = arr(r.cuestionario)
    .map((c) => {
      if (!esObj(c)) return null;
      const options = arr(c.options ?? c.opciones).map((o) => txt(o, 200)).filter(Boolean).slice(0, 5);
      const correct = typeof c.correct === "number" ? Math.trunc(c.correct) : typeof c.correcta === "number" ? Math.trunc(c.correcta) : -1;
      const q = txt(c.q ?? c.pregunta, 260);
      return q && options.length >= 2 && correct >= 0 && correct < options.length ? { q, options, correct, why: txt(c.why ?? c.explicacion, 400) } : null;
    })
    .filter((c): c is { q: string; options: string[]; correct: number; why: string } => c !== null)
    .slice(0, 10);
  if (preguntas.length >= MINIMO.cuestionario) out.cuestionario = preguntas;

  const linea = arr(r.linea).map((c) => (esObj(c) ? { etiqueta: txt(c.etiqueta ?? c.t ?? c.titulo, 90), texto: txt(c.texto ?? c.descripcion, 360) } : null)).filter((c): c is { etiqueta: string; texto: string } => !!c && !!c.etiqueta && !!c.texto).slice(0, 12);
  if (linea.length >= MINIMO.linea) out.linea = linea;

  const glosario = arr(r.glosario).map((c) => (esObj(c) ? { termino: txt(c.termino ?? c.t, 80), definicion: txt(c.definicion ?? c.texto, 360) } : null)).filter((c): c is { termino: string; definicion: string } => !!c && !!c.termino && !!c.definicion).slice(0, 16);
  if (glosario.length >= MINIMO.glosario) out.glosario = glosario;

  if (esObj(r.informe)) {
    const x = r.informe;
    const secciones = arr(x.secciones).map((s) => (esObj(s) ? { titulo: txt(s.titulo ?? s.t, 120), texto: txt(s.texto, 1600) } : null)).filter((s): s is { titulo: string; texto: string } => !!s && !!s.titulo && !!s.texto).slice(0, 6);
    if (secciones.length >= MINIMO.informe) out.informe = { titulo: txt(x.titulo, 160), introduccion: txt(x.introduccion, 900), secciones, conclusiones: lista(x.conclusiones, 300, 6) };
  }
  return out;
}

/** JSON que a veces viene envuelto en un bloque de código o con texto antes y después. */
export function leerJson(text: string): unknown {
  const limpio = text.trim().replace(/^```[a-z]*\n([\s\S]*?)\n```$/i, "$1").trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const a = limpio.indexOf("{");
    const b = limpio.lastIndexOf("}");
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(limpio.slice(a, b + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const TITULO_KIND: Record<StudioKind, string> = {
  resumen: "Resumen",
  guia: "Guía de estudio",
  mapa: "Mapa mental",
  tarjetas: "Tarjetas didácticas",
  cuestionario: "Cuestionario",
  faq: "Preguntas frecuentes",
  linea: "Línea de tiempo",
  glosario: "Glosario",
  informe: "Informe",
};

/** Cuántos materiales útiles trae un contenido. */
export const cuantos = (c: Contenido | null | undefined) => (c ? KINDS.filter((k) => c[k] !== undefined).length : 0);

/** Número de nodos de un mapa mental. */
export function contarNodos(n: Nodo): number {
  return 1 + (n.hijos ?? []).reduce((s, h) => s + contarNodos(h), 0);
}
