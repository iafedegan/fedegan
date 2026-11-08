// Material de los juegos del Studio, armado con lo que ya está guardado de la lección o del curso (no se genera nada nuevo).
// Puro (sin navegador): se prueba aparte.

import type { Contenido } from "@/lib/lms/studio-tipos";

export type JuegoId = "memoria" | "relampago" | "vf" | "ordena" | "clasifica";

export const barajar = <T,>(a: readonly T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const limpiar = (t: string) => t.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
export const corto = (t: string, n: number) => {
  const s = limpiar(t);
  return s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`;
};
export const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------- Memoria ----------

export type Par = { a: string; b: string };

/** Parejas término–definición (o pregunta–respuesta) para el juego de memoria. */
export function paresMemoria(c: Contenido, max = 6): Par[] {
  const g = (c.glosario ?? []).map((x) => ({ a: corto(x.termino, 36), b: corto(x.definicion, 70) }));
  const t = (c.tarjetas ?? []).map((x) => ({ a: corto(x.q, 60), b: corto(x.a, 70) }));
  const vistos = new Set<string>();
  const out: Par[] = [];
  for (const p of [...barajar(g), ...barajar(t)]) {
    const k = sinTildes(p.a);
    if (!p.a || !p.b || vistos.has(k) || sinTildes(p.a) === sinTildes(p.b)) continue;
    vistos.add(k);
    out.push(p);
    if (out.length >= max) break;
  }
  return out.length >= 3 ? out : [];
}

// ---------- Relámpago ----------

export type Rapida = { q: string; opciones: string[]; correcta: number };

function conDistractores(q: string, correcta: string, otras: string[], n = 3): Rapida | null {
  const malas = barajar(otras.filter((o) => o && sinTildes(o) !== sinTildes(correcta))).slice(0, n);
  if (malas.length < 2) return null;
  const opciones = barajar([correcta, ...malas]);
  return { q, opciones, correcta: opciones.indexOf(correcta) };
}

/** Preguntas de opción múltiple para el reto contrarreloj: el cuestionario, más tarjetas y glosario con opciones armadas. */
export function preguntasRapidas(c: Contenido, max = 30): Rapida[] {
  const out: Rapida[] = [];
  for (const p of c.cuestionario ?? []) {
    const opciones = p.options.slice(0, 4);
    if (p.correct < opciones.length) out.push({ q: corto(p.q, 200), opciones: opciones.map((o) => corto(o, 90)), correcta: p.correct });
  }
  const t = c.tarjetas ?? [];
  if (t.length >= 4) for (const x of t) { const r = conDistractores(corto(x.q, 200), corto(x.a, 90), t.map((y) => corto(y.a, 90))); if (r) out.push(r); }
  const g = c.glosario ?? [];
  if (g.length >= 4) for (const x of g) { const r = conDistractores(`¿Qué es «${corto(x.termino, 40)}»?`, corto(x.definicion, 90), g.map((y) => corto(y.definicion, 90))); if (r) out.push(r); }
  return out.length >= 6 ? barajar(out).slice(0, max) : [];
}

/** Elige una opción a partir de lo que dijo la persona: «b», «la c», «opción tres» o parte del texto de la opción. -1 si no se entiende. */
export function elegirPorVoz(dicho: string, opciones: string[]): number {
  const d = sinTildes(dicho).replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
  if (!d) return -1;
  const letras: Record<string, number> = { a: 0, uno: 0, primera: 0, "1": 0, b: 1, be: 1, bee: 1, dos: 1, segunda: 1, "2": 1, c: 2, ce: 2, se: 2, tres: 2, tercera: 2, "3": 2, d: 3, de: 3, cuatro: 3, cuarta: 3, "4": 3 };
  const palabras = d.split(" ");
  // «no sé» suena como la letra C: una frase corta con «no» nunca es una respuesta.
  if (palabras.length <= 3 && palabras.includes("no")) return -1;
  if (palabras.length <= 3) {
    for (const p of palabras) if (p in letras && letras[p] < opciones.length) return letras[p];
  }
  let mejor = -1;
  let puntaje = 0;
  const dichas = new Set(palabras.filter((p) => p.length > 2));
  opciones.forEach((o, i) => {
    const ps = sinTildes(o).replace(/[^a-z0-9ñ ]/g, " ").split(" ").filter((p) => p.length > 2);
    if (!ps.length) return;
    const aciertos = ps.filter((p) => dichas.has(p)).length / ps.length;
    if (aciertos > puntaje) {
      puntaje = aciertos;
      mejor = i;
    }
  });
  return puntaje >= 0.5 ? mejor : -1;
}

// ---------- Verdadero o falso ----------

export type VF = { q: string; mostrada: string; verdad: boolean; correcta: string };

export function afirmacionesVF(c: Contenido, max = 10): VF[] {
  const base: { q: string; a: string }[] = [
    ...(c.tarjetas ?? []).map((x) => ({ q: corto(x.q, 160), a: corto(x.a, 110) })),
    ...(c.glosario ?? []).map((x) => ({ q: `¿Qué significa «${corto(x.termino, 40)}»?`, a: corto(x.definicion, 110) })),
  ];
  if (base.length < 6) return [];
  return barajar(base).slice(0, max).map((x, i, arr) => {
    const verdad = i % 2 === 0 ? Math.random() < 0.5 : Math.random() >= 0.5;
    if (verdad) return { q: x.q, mostrada: x.a, verdad: true, correcta: x.a };
    const otra = barajar(arr.concat(base).filter((y) => sinTildes(y.a) !== sinTildes(x.a)))[0];
    return { q: x.q, mostrada: otra.a, verdad: false, correcta: x.a };
  });
}

// ---------- Ordena la secuencia ----------

/** Pasos de la línea de tiempo en su orden correcto (el juego los presenta mezclados). */
export function pasosOrden(c: Contenido, max = 7): string[] {
  const p = (c.linea ?? []).slice(0, max).map((x) => corto(x.etiqueta, 70));
  return p.length >= 4 && new Set(p.map(sinTildes)).size === p.length ? p : [];
}

// ---------- Clasifica las ideas ----------

export type Clasifica = { ramas: string[]; items: { t: string; rama: number }[] };

/** Ramas del mapa mental y sus ideas, para arrastrar cada idea a su rama. */
export function clasificacion(c: Contenido): Clasifica | null {
  const ramas = (c.mapa?.hijos ?? []).filter((h) => (h.hijos?.length ?? 0) >= 2).slice(0, 4);
  if (ramas.length < 3) return null;
  const items = ramas.flatMap((r, i) => (r.hijos ?? []).slice(0, 3).map((h) => ({ t: corto(h.t, 50), rama: i })));
  return { ramas: ramas.map((r) => corto(r.t, 40)), items };
}

/** Qué juegos se pueden jugar con este contenido. */
export function juegosDisponibles(c: Contenido): Record<JuegoId, boolean> {
  return {
    memoria: paresMemoria(c).length >= 3,
    relampago: preguntasRapidas(c).length >= 6,
    vf: afirmacionesVF(c).length >= 6,
    ordena: pasosOrden(c).length >= 4,
    clasifica: clasificacion(c) !== null,
  };
}
