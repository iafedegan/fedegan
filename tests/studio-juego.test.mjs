import test from "node:test";
import assert from "node:assert/strict";
import { ESTADO_INICIAL, aplicarRacha, ayerDe, insigniasNuevas, nivelDe } from "../src/lib/lms/studio-juego.ts";
import { afirmacionesVF, clasificacion, elegirPorVoz, juegosDisponibles, paresMemoria, pasosOrden, preguntasRapidas } from "../src/lib/lms/studio-juegos-datos.ts";

const contenido = {
  glosario: [{ termino: "Aforo", definicion: "Medición del forraje disponible" }, { termino: "Forraje", definicion: "Planta que alimenta al ganado" }, { termino: "Potrero", definicion: "Lote de pastoreo" }, { termino: "Leguminosa", definicion: "Planta que fija nitrógeno" }],
  tarjetas: [{ q: "¿Qué es el aforo?", a: "Medir el forraje" }, { q: "Labranza mínima", a: "Mover poco el suelo" }, { q: "Carga animal", a: "Animales por hectárea" }, { q: "Rotación", a: "Mover los animales entre potreros" }],
  cuestionario: [{ q: "¿Qué antes de elegir?", options: ["Comprar", "Analizar el suelo", "Vender", "Esperar"], correct: 1, why: "" }, { q: "¿Para qué dividir?", options: ["Descanso", "Gastar", "Quitar agua", "Sembrar"], correct: 0, why: "" }],
  linea: [{ etiqueta: "Analizar el suelo", texto: "a" }, { etiqueta: "Elegir la especie", texto: "b" }, { etiqueta: "Preparar el terreno", texto: "c" }, { etiqueta: "Sembrar", texto: "d" }],
  mapa: { t: "Praderas", hijos: [{ t: "Suelo", hijos: [{ t: "Análisis" }, { t: "Selección" }] }, { t: "Siembra", hijos: [{ t: "Labranza" }, { t: "Densidad" }] }, { t: "Manejo", hijos: [{ t: "Potreros" }, { t: "Carga" }] }] },
};

test("los niveles suben con los XP y el último no tiene siguiente", () => {
  assert.equal(nivelDe(0).nombre, "Ternero");
  assert.equal(nivelDe(119).n, 1);
  assert.equal(nivelDe(120).nombre, "Novillo");
  const n = nivelDe(220);
  assert.equal(n.n, 2);
  assert.equal(n.pct, 50);
  assert.equal(n.falta, 100);
  const max = nivelDe(99999);
  assert.equal(max.hasta, null);
  assert.equal(max.pct, 100);
});

test("la racha suma un día si fue ayer, se reinicia si faltó y no cambia el mismo día", () => {
  assert.equal(ayerDe("2026-03-01"), "2026-02-28");
  assert.equal(ayerDe("2026-01-01"), "2025-12-31");
  const a = aplicarRacha({ ...ESTADO_INICIAL }, "2026-11-08");
  assert.equal(a.racha, 1);
  assert.equal(aplicarRacha(a, "2026-11-08"), a);
  assert.equal(aplicarRacha(a, "2026-11-09").racha, 2);
  assert.equal(aplicarRacha(a, "2026-11-12").racha, 1);
});

test("las insignias se ganan una sola vez según lo hecho", () => {
  assert.deepEqual(insigniasNuevas(ESTADO_INICIAL), []);
  const e = { ...ESTADO_INICIAL, racha: 3, contadores: { tarjetas: 1, perfecto: 1 }, estrellas: { "memoria:x": 3, "vf:x": 2 } };
  const ids = insigniasNuevas(e);
  for (const id of ["primera-tarjeta", "perfecto", "racha-3", "memoria", "estrellas-5"]) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes("racha-7"));
  assert.deepEqual(insigniasNuevas({ ...e, insignias: ids }), []);
  const abiertos = ["leccion:a:resumen", "leccion:a:guia", "leccion:a:mapa", "leccion:a:tarjetas", "leccion:a:cuestionario", "leccion:a:faq", "leccion:a:linea", "leccion:a:glosario", "leccion:a:informe"];
  assert.ok(insigniasNuevas({ ...ESTADO_INICIAL, abiertos }).includes("explorador"));
  assert.ok(!insigniasNuevas({ ...ESTADO_INICIAL, abiertos: abiertos.slice(0, 8) }).includes("explorador"));
});

test("con contenido completo se pueden jugar los cinco juegos", () => {
  const j = juegosDisponibles(contenido);
  assert.deepEqual(j, { memoria: true, relampago: true, vf: true, ordena: true, clasifica: true });
  assert.deepEqual(juegosDisponibles({}), { memoria: false, relampago: false, vf: false, ordena: false, clasifica: false });
});

test("memoria: parejas únicas con texto corto", () => {
  const p = paresMemoria(contenido);
  assert.ok(p.length >= 3 && p.length <= 6);
  assert.equal(new Set(p.map((x) => x.a)).size, p.length);
});

test("relámpago: opción correcta siempre dentro de las opciones y sin repetirse", () => {
  const r = preguntasRapidas(contenido);
  assert.ok(r.length >= 6);
  for (const x of r) {
    assert.ok(x.correcta >= 0 && x.correcta < x.opciones.length);
    assert.equal(new Set(x.opciones).size, x.opciones.length, x.q);
  }
});

test("verdadero o falso: lo verdadero muestra la respuesta correcta y lo falso otra distinta", () => {
  for (let k = 0; k < 20; k++) {
    for (const x of afirmacionesVF(contenido)) {
      if (x.verdad) assert.equal(x.mostrada, x.correcta);
      else assert.notEqual(x.mostrada, x.correcta);
    }
  }
});

test("ordenar y clasificar salen de la línea de tiempo y del mapa", () => {
  assert.deepEqual(pasosOrden(contenido), ["Analizar el suelo", "Elegir la especie", "Preparar el terreno", "Sembrar"]);
  const c = clasificacion(contenido);
  assert.equal(c.ramas.length, 3);
  assert.equal(c.items.length, 6);
  assert.deepEqual(c.items.map((i) => i.rama), [0, 0, 1, 1, 2, 2]);
  assert.equal(clasificacion({ mapa: { t: "x", hijos: [{ t: "a", hijos: [{ t: "b" }] }] } }), null);
});

test("responder con la voz: letras, números y parte del texto", () => {
  const o = ["Analizar el suelo", "Comprar semilla", "Dividir potreros", "Vender animales"];
  assert.equal(elegirPorVoz("b", o), 1);
  assert.equal(elegirPorVoz("la opción C", o), 2);
  assert.equal(elegirPorVoz("cuatro", o), 3);
  assert.equal(elegirPorVoz("yo creo que es analizar el suelo", o), 0);
  assert.equal(elegirPorVoz("no sé", o), -1);
  assert.equal(elegirPorVoz("", o), -1);
});
