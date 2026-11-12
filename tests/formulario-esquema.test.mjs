import test from "node:test";
import assert from "node:assert/strict";
import { campoNuevo, leerEsquema, problemaEsquema, slugDe, validarRespuestas, visibles } from "../src/lib/cms/formulario-esquema.ts";

const campo = (id, tipo, extra = {}) => ({ ...campoNuevo(tipo, `Pregunta ${id}`), id, ...extra });

test("leerEsquema descarta lo raro, repite ids y solo deja condiciones hacia preguntas anteriores", () => {
  assert.deepEqual(leerEsquema(null).campos, []);
  assert.deepEqual(leerEsquema({ campos: "x" }).campos, []);
  const e = leerEsquema({
    gracias: "  Gracias ",
    campos: [
      { id: "a", tipo: "texto", etiqueta: "Uno" },
      { id: "a", tipo: "inventado", etiqueta: "Dos", si: { campo: "a", op: "es", valor: "x" } },
      { id: "c", tipo: "texto", etiqueta: "" },
      { id: "d", tipo: "texto", etiqueta: "Tres", si: { campo: "zzz", op: "es", valor: "x" } },
    ],
  });
  assert.equal(e.gracias, "Gracias");
  assert.equal(e.campos.length, 3);
  assert.equal(new Set(e.campos.map((c) => c.id)).size, 3, "ids únicos");
  assert.equal(e.campos[1].tipo, "texto");
  assert.equal(e.campos[1].si?.campo, "a");
  assert.equal(e.campos[2].si, undefined, "una condición a una pregunta que no existe se quita");
});

test("problemaEsquema pide preguntas, opciones y valores de condición", () => {
  assert.match(problemaEsquema({ campos: [], gracias: "" }), /al menos una/);
  assert.match(problemaEsquema({ campos: [campo("a", "lista", { opciones: "Solo una" })], gracias: "" }), /dos opciones/);
  assert.match(problemaEsquema({ campos: [campo("a", "texto"), campo("b", "texto", { si: { campo: "a", op: "es", valor: "" } })], gracias: "" }), /valor/);
  assert.equal(problemaEsquema({ campos: [campo("a", "texto")], gracias: "" }), null);
});

test("la lógica condicional muestra y oculta, también en cadena", () => {
  const campos = [
    campo("a", "opcion", { opciones: "Sí\nNo" }),
    campo("b", "texto", { si: { campo: "a", op: "es", valor: "Sí" } }),
    campo("c", "texto", { si: { campo: "b", op: "responde", valor: "" } }),
  ];
  assert.deepEqual([...visibles(campos, {})], ["a"]);
  assert.deepEqual([...visibles(campos, { a: "Sí" })], ["a", "b"]);
  assert.deepEqual([...visibles(campos, { a: "Sí", b: "hola" })], ["a", "b", "c"]);
  // Si «b» se oculta, «c» también, aunque «b» tenga un valor viejo.
  assert.deepEqual([...visibles(campos, { a: "No", b: "hola" })], ["a"]);
});

test("validarRespuestas exige lo obligatorio solo si la pregunta está visible y comprueba cada tipo", () => {
  const e = {
    gracias: "",
    campos: [
      campo("a", "opcion", { opciones: "Sí\nNo", requerido: true }),
      campo("b", "correo", { requerido: true, si: { campo: "a", op: "es", valor: "Sí" } }),
      campo("n", "escala", { max: 5 }),
      campo("t", "casillas", { opciones: "X\nY" }),
    ],
  };
  assert.match(validarRespuestas(e, {}).error, /Falta responder/);
  // Oculta: no se exige ni se guarda.
  const ok = validarRespuestas(e, { a: "No", b: "no-es-correo" });
  assert.deepEqual(ok.respuestas, [{ id: "a", e: "Pregunta a", v: "No" }]);
  assert.match(validarRespuestas(e, { a: "Sí" }).error, /Falta responder «Pregunta b»/);
  assert.match(validarRespuestas(e, { a: "Sí", b: "mal" }).error, /correo válido/);
  assert.match(validarRespuestas(e, { a: "Quizá" }).error, /una de las opciones/);
  assert.match(validarRespuestas(e, { a: "No", n: "9" }).error, /de 1 a 5/);
  assert.match(validarRespuestas(e, { a: "No", t: ["Z"] }).error, /solo entre las opciones/);
  const bien = validarRespuestas(e, { a: "Sí", b: "a@b.co", n: "4", t: ["X", "Y"] });
  assert.deepEqual(bien.respuestas.map((r) => r.v), ["Sí", "a@b.co", "4", ["X", "Y"]]);
});

test("slugDe quita tildes y símbolos", () => {
  assert.equal(slugDe("¡Inscripción al Día del Ganadero 2026!"), "inscripcion-al-dia-del-ganadero-2026");
  assert.equal(slugDe("???"), "formulario");
});

import { aCsv, porDia, resumir, tablasExportables } from "../src/lib/cms/formulario-resumen.ts";
import { valorTexto } from "../src/lib/cms/formulario-esquema.ts";

const tabla = {
  id: "act", tipo: "tabla", etiqueta: "Actividades", ayuda: "", requerido: true, opciones: "", max: 5,
  columnas: [
    { id: "a", etiqueta: "Actividad", tipo: "texto", opciones: "", requerido: true },
    { id: "ia", etiqueta: "¿Con IA?", tipo: "lista", opciones: "Sí\nNo", requerido: false },
    { id: "h", etiqueta: "Horas", tipo: "numero", opciones: "", requerido: false },
  ],
};

test("la tabla valida cada fila, ignora las vacías y exige al menos una si es obligatoria", () => {
  const e = leerEsquema({ campos: [{ ...tabla }, { id: "s", tipo: "seccion", etiqueta: "Parte 2" }] });
  assert.equal(e.campos[0].columnas.length, 3);
  assert.equal(problemaEsquema(e), null);
  assert.match(validarRespuestas(e, { act: [{}] }).error, /al menos una fila/);
  assert.match(validarRespuestas(e, { act: [{ ia: "Sí" }] }).error, /fila 1: falta «Actividad»/);
  assert.match(validarRespuestas(e, { act: [{ a: "x", ia: "Tal vez" }] }).error, /una de las opciones/);
  assert.match(validarRespuestas(e, { act: [{ a: "x", h: "mucho" }] }).error, /número/);
  const ok = validarRespuestas(e, { act: [{ a: " Actas ", ia: "Sí", h: "4", raro: "z" }, {}, { a: "Pagos" }] });
  assert.deepEqual(ok.respuestas, [{ id: "act", e: "Actividades", v: [{ a: "Actas", ia: "Sí", h: "4" }, { a: "Pagos" }] }]);
  assert.equal(valorTexto(ok.respuestas[0].v, tabla.columnas), "1) Actividad: Actas · ¿Con IA?: Sí · Horas: 4\n2) Actividad: Pagos");
});

test("el resumen cuenta opciones, filas de tabla y exporta una hoja por tabla", () => {
  const e = leerEsquema({ campos: [{ id: "n", tipo: "texto", etiqueta: "Nombre" }, { id: "o", tipo: "opcion", etiqueta: "Área", opciones: "A\nB" }, tabla] });
  const rs = [
    { id: "11111111-x", version: 1, created_at: "2026-11-10T10:00:00Z", answers: [{ id: "n", e: "Nombre", v: "Ana" }, { id: "o", e: "Área", v: "A" }, { id: "act", e: "Actividades", v: [{ a: "Actas", ia: "Sí", h: "4" }, { a: "actas", ia: "No", h: "2" }] }] },
    { id: "22222222-y", version: 1, created_at: "2026-11-12T09:00:00Z", answers: [{ id: "n", e: "Nombre", v: "=Beto" }, { id: "o", e: "Área", v: "A" }] },
  ];
  const r = resumir(e, rs);
  assert.deepEqual(r[1].conteos, [{ etiqueta: "A", n: 2 }, { etiqueta: "B", n: 0 }]);
  assert.equal(r[2].filas, 2);
  assert.deepEqual(r[2].columnas[1].conteos, [{ etiqueta: "Sí", n: 1 }, { etiqueta: "No", n: 1 }]);
  assert.equal(r[2].columnas[2].suma, 6);
  assert.deepEqual(r[2].columnas[0].repetidos, [{ etiqueta: "Actas", n: 2 }]);
  const serie = porDia(rs, "2026-11-12", 3);
  assert.deepEqual(serie.map((d) => d.value), [1, 0, 1]);
  const [general, detalle] = tablasExportables(e, rs);
  assert.deepEqual(general.cabecera, ["Código", "Fecha", "Versión", "Nombre", "Área", "Actividades (n.º de filas)"]);
  assert.equal(general.filas[0][5], 2);
  assert.equal(detalle.filas.length, 2);
  assert.deepEqual(detalle.filas[1].slice(-4), [2, "actas", "No", "2"]);
  assert.match(aCsv(general), /"'=Beto"/, "el CSV neutraliza fórmulas");
});
