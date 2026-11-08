import test from "node:test";
import assert from "node:assert/strict";
import { contarNodos, cuantos, leerJson, normalizarContenido } from "../src/lib/lms/studio-tipos.ts";

const completo = {
  resumen: { idea: "Los pastos bien manejados alimentan mejor", puntos: [{ titulo: "Suelo", texto: "Analícelo **antes** de sembrar" }, { titulo: "Especie", texto: "Elíjala según la zona" }, { titulo: "Carga", texto: "No sobrecargue el potrero" }], cierre: "Empiece por el suelo." },
  guia: { objetivos: ["Reconocer especies forrajeras"], conceptos: [{ termino: "Aforo", definicion: "Medición del forraje disponible" }], repaso: [{ pregunta: "¿Qué es el aforo?", respuesta: "Medir el forraje" }], antes: ["Repase la carga animal"] },
  mapa: { t: "Praderas", hijos: [{ t: "Suelo", hijos: [{ t: "Análisis" }] }, { t: "Siembra" }, { t: "Manejo" }] },
  tarjetas: [{ q: "a", a: "b" }, { q: "c", a: "d" }, { q: "e", a: "f" }, { q: "g", a: "h" }],
  cuestionario: [{ q: "¿1?", options: ["a", "b", "c", "d"], correct: 2, why: "porque" }, { q: "¿2?", options: ["a", "b"], correct: 0, why: "" }, { q: "¿3?", options: ["a", "b", "c"], correct: 1, why: "" }],
  faq: [{ q: "a", a: "b" }, { q: "c", a: "d" }, { q: "e", a: "f" }],
  linea: [{ etiqueta: "1", texto: "a" }, { etiqueta: "2", texto: "b" }, { etiqueta: "3", texto: "c" }],
  glosario: [{ termino: "a", definicion: "b" }, { termino: "c", definicion: "d" }, { termino: "e", definicion: "f" }, { termino: "g", definicion: "h" }],
  informe: { titulo: "Informe", introduccion: "Intro", secciones: [{ titulo: "S1", texto: "t1" }, { titulo: "S2", texto: "t2" }], conclusiones: ["c"] },
};

test("un contenido completo conserva sus nueve materiales", () => {
  const c = normalizarContenido(completo);
  assert.equal(cuantos(c), 9);
  assert.equal(contarNodos(c.mapa), 5);
  assert.equal(c.cuestionario[0].correct, 2);
});

test("descarta lo que no llega al mínimo útil y no rompe con basura", () => {
  const c = normalizarContenido({ ...completo, tarjetas: [{ q: "a", a: "b" }], faq: "nada", mapa: { t: "Solo", hijos: [{ t: "una" }] }, glosario: null });
  assert.equal(c.tarjetas, undefined);
  assert.equal(c.faq, undefined);
  assert.equal(c.mapa, undefined);
  assert.equal(c.glosario, undefined);
  assert.equal(cuantos(normalizarContenido(null)), 0);
  assert.equal(cuantos(normalizarContenido("texto")), 0);
  assert.equal(cuantos(normalizarContenido([1, 2])), 0);
});

test("las preguntas con respuesta fuera de rango o sin opciones se descartan", () => {
  const c = normalizarContenido({ ...completo, cuestionario: [{ q: "ok", options: ["a", "b"], correct: 1 }, { q: "mal", options: ["a", "b"], correct: 5 }, { q: "sin", options: ["a"], correct: 0 }, { q: "ok2", options: ["a", "b"], correct: 0 }, { q: "ok3", options: ["a", "b"], correct: 0 }] });
  assert.deepEqual(c.cuestionario.map((p) => p.q), ["ok", "ok2", "ok3"]);
});

test("el mapa mental se acota en profundidad y ancho", () => {
  const hondo = { t: "a", hijos: [{ t: "b", hijos: [{ t: "c", hijos: [{ t: "d", hijos: [{ t: "e" }] }] }] }, { t: "x" }, { t: "y" }] };
  const c = normalizarContenido({ ...completo, mapa: hondo });
  assert.equal(c.mapa.hijos[0].hijos[0].hijos[0].hijos, undefined, "no pasa del cuarto nivel");
  const ancho = { t: "raiz", hijos: Array.from({ length: 20 }, (_, i) => ({ t: `r${i}` })) };
  assert.equal(normalizarContenido({ mapa: ancho }).mapa.hijos.length, 8);
});

test("los textos se limpian y se acotan", () => {
  const c = normalizarContenido({ ...completo, resumen: { idea: "x".repeat(900), puntos: [{ titulo: "t", texto: "  hola \n\n\n\n mundo \u0007" }, { titulo: "t", texto: "b" }, { titulo: "t", texto: "c" }], cierre: "" } });
  assert.equal(c.resumen.idea.length, 400);
  assert.equal(c.resumen.puntos[0].texto, "hola \n\n mundo");
});

test("lee el JSON aunque venga envuelto en un bloque de código o con texto alrededor", () => {
  assert.deepEqual(leerJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(leerJson('Aquí está:\n{"a":1}\nListo.'), { a: 1 });
  assert.equal(leerJson("no es json"), null);
});
