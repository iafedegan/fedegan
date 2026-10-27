import test from "node:test";
import assert from "node:assert/strict";
import { search } from "../src/lib/search-index.ts";

const index = [
  { title: "Informe de gestión 2026", excerpt: "Resultados institucionales del último año.", href: "/publicaciones/informe", type: "Publicación" },
  { title: "Bienestar animal", excerpt: "Seminario sobre la gestión del hato.", href: "/eventos/bienestar", type: "Evento" },
  { title: "Política de privacidad", excerpt: "Tratamiento de datos personales.", href: "/privacidad", type: "Página" },
];

test("una consulta vacía no devuelve nada", () => {
  assert.deepEqual(search(index, ""), []);
  assert.deepEqual(search(index, "   "), []);
});

test("ignora tildes y mayúsculas", () => {
  assert.equal(search(index, "POLITICA")[0]?.href, "/privacidad");
});

test("las coincidencias en el título pesan más que en el resumen", () => {
  const r = search(index, "gestión");
  assert.equal(r[0].href, "/publicaciones/informe");
  assert.equal(r[1].href, "/eventos/bienestar");
});

test("todos los términos deben aparecer", () => {
  assert.deepEqual(search(index, "gestión seminario").map((x) => x.href), ["/eventos/bienestar"]);
  assert.deepEqual(search(index, "inexistente"), []);
});
