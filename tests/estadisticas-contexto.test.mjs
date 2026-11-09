import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { clavePeriodo, fusionarConCopia, leerObservatorioContexto, normalizarCopia } from "../src/lib/estadisticas/contexto.ts";
import { observatorioDesdeConjuntos } from "../src/lib/estadisticas/local.ts";

// Página real del Observatorio de CONtexto (solo los datos), tal como llega en «self.__next_f.push».
const html = fs.readFileSync(new URL("./fixtures/contexto-observatorio.html", import.meta.url), "utf8");
const copia = leerObservatorioContexto(html);

test("lee de la página de CONtexto los 14 indicadores, los 33 territorios y la orientación del hato", () => {
  assert.equal(Object.keys(copia.indicadores).length, 14);
  assert.equal(copia.indicadores.gordo.periodos.length, 59);
  assert.equal(copia.indicadores.gordo.periodos[0], "dic/2021");
  assert.equal(copia.bovinos.departamentos.length, 33);
  assert.equal(copia.predios.departamentos.length, 33);
  assert.ok(copia.orientacion.predios.partes.length >= 3);
  assert.ok(copia.orientacion.animales.partes.length >= 3);
});

test("una página sin cifras no devuelve nada", () => {
  assert.equal(leerObservatorioContexto("<html><body>Hola</body></html>"), null);
  assert.equal(leerObservatorioContexto(""), null);
});

test("los periodos se ordenan por fecha, no por texto", () => {
  assert.ok(clavePeriodo("ene/2027") > clavePeriodo("dic/2026"));
  assert.ok(clavePeriodo("2025") > clavePeriodo("2024"));
  assert.equal(clavePeriodo("Q1"), null);
  assert.equal(clavePeriodo(undefined), null);
});

test("las celdas vacías de la copia se vuelven NaN (y 0 en el explorador por departamento)", () => {
  const n = normalizarCopia({
    indicadores: { x: { clave: "x", titulo: "X", unidad: "", periodos: ["2024", "2025"], series: [{ nombre: "a", valores: [1, null] }] } },
    bovinos: { clave: "bovinos", titulo: "B", unidad: "cab", periodos: ["2024", "2025"], nacional: [5, null], departamentos: [{ nombre: "A", valores: [null, 2] }] },
    orientacion: {},
  });
  assert.ok(Number.isNaN(n.indicadores.x.series[0].valores[1]));
  assert.deepEqual(n.bovinos.nacional, [5, 0]);
  assert.deepEqual(n.bovinos.departamentos[0].valores, [0, 2]);
});

test("sin copia se queda lo de FEDEGÁN; sin HTML de FEDEGÁN sale la copia completa", () => {
  const base = { indicadores: {}, orientacion: {}, inventario: [] };
  assert.equal(fusionarConCopia(base, null), base);
  assert.equal(fusionarConCopia(null, null), null);
  const solo = fusionarConCopia(null, copia);
  assert.equal(solo.indicadores.gordo.periodos.length, 59);
  assert.deepEqual(solo.inventario, []);
});

const mes = (ini, n) => {
  const ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return Array.from({ length: n }, (_, i) => `${ABR[(ini + i) % 12]}/${2025 + Math.floor((ini + i) / 12)}`);
};
const ind = (codigo, titulo, periodos, series) => ({ clave: `${codigo}-x`, codigo, titulo, unidad: "", periodos, series: series.map(([nombre, valores]) => ({ nombre, valores })) });

test("el historial sale de la copia y lo más reciente de FEDEGÁN: gana FEDEGÁN si el periodo coincide y se suman los meses nuevos", () => {
  // FEDEGÁN: nov/2025 … nov/2026 (13 meses; oct/2026 con cifra corregida y nov/2026 nuevo).
  const periodos = mes(10, 13);
  assert.equal(periodos[0], "nov/2025");
  assert.equal(periodos.at(-1), "nov/2026");
  const valores = periodos.map((_, i) => 9000 + i);
  valores[periodos.indexOf("oct/2026")] = 9999;
  const base = observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("053", "Precio promedio", periodos, [["Precio x kilo", valores]])] }]);
  const f = fusionarConCopia(base, copia);
  const g = f.indicadores.gordo;
  assert.equal(g.periodos[0], "dic/2021");
  assert.equal(g.periodos.at(-1), "nov/2026");
  assert.equal(g.periodos.length, 60);
  assert.equal(g.series.length, 1);
  assert.equal(g.series[0].nombre, "Precio x kilo");
  assert.equal(g.series[0].valores[g.periodos.indexOf("oct/2026")], 9999);
  assert.equal(g.series[0].valores[g.periodos.length - 1], 9000 + 12);
  // El historial viene de la copia.
  assert.equal(g.series[0].valores[0], copia.indicadores.gordo.series[0].valores[0]);
  // Todo el recorrido está ordenado y sin periodos repetidos.
  assert.equal(new Set(g.periodos).size, g.periodos.length);
  assert.ok(g.periodos.every((p, i) => i === 0 || clavePeriodo(p) > clavePeriodo(g.periodos[i - 1])));
  // Los demás indicadores principales siguen saliendo de la copia.
  assert.equal(f.indicadores.sacrificio.periodos[0], "2009");
});

test("las series se emparejan por nombre (sin importar tildes) y las que solo trae la copia se conservan", () => {
  const base = observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("065", "Flaco hembras", mes(10, 12), [["REGION CARIBE", mes(10, 12).map(() => 1)], ["Magdalena Medio y Santanderes", mes(10, 12).map(() => 2)]])] }]);
  const f = fusionarConCopia(base, copia);
  const h = f.indicadores["flaco-hembras"];
  const nombres = h.series.map((s) => s.nombre);
  assert.deepEqual(nombres.slice(0, 2), ["REGION CARIBE", "Magdalena Medio y Santanderes"]);
  assert.ok(nombres.includes("Llanos Orientales"));
  assert.equal(h.series.length, 3);
  const caribe = h.series[0];
  assert.equal(caribe.valores[0], copia.indicadores["flaco-hembras"].series[0].valores[0]);
  assert.equal(caribe.valores.at(-1), 1);
});

test("periodos con formato desconocido no se mezclan: se queda la serie que llega más reciente", () => {
  const base = observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("053", "Precio", ["I trim", "II trim"], [["Precio x kilo", [1, 2]]])] }]);
  const f = fusionarConCopia(base, copia);
  assert.equal(f.indicadores.gordo.periodos.at(-1), "oct/2026");
  assert.equal(f.indicadores.gordo.periodos.length, 59);
});

test("los departamentos salen de la copia mientras el HTML de FEDEGÁN no traiga todos; si trae más, ganan los de FEDEGÁN", () => {
  const dos = observatorioDesdeConjuntos([{ id: "inventario-ganadero", indicadores: [ind("001", "Inventario", ["2024", "2025"], [["Antioquia", [1, 2]], ["Córdoba", [3, 4]], ["Nacional", [10, 20]]])] }]);
  assert.equal(dos.bovinos, undefined);
  assert.equal(dos.inventario.length, 1);
  const f = fusionarConCopia(dos, copia);
  assert.equal(f.bovinos.departamentos.length, 33);
  assert.deepEqual(f.inventario, []);
  // FEDEGÁN envía un año nuevo con todos los departamentos.
  const nombres = copia.bovinos.departamentos.map((d) => d.nombre);
  const completo = observatorioDesdeConjuntos([{
    id: "inventario-ganadero",
    indicadores: [ind("001", "Inventario", ["2026"], [...nombres.map((n) => [n, [7]]), ["Nacional", [999]]])],
  }]);
  const g = fusionarConCopia(completo, copia);
  assert.deepEqual(g.bovinos.periodos, ["2026"]);
  assert.equal(g.bovinos.nacional[0], 999);
});

test("la orientación del hato más reciente gana", () => {
  const base = { indicadores: {}, orientacion: { predios: { titulo: "x", periodo: "2030", partes: [{ nombre: "a", valor: 1 }, { nombre: "b", valor: 2 }] } }, inventario: [] };
  const f = fusionarConCopia(base, copia);
  assert.equal(f.orientacion.predios.periodo, "2030");
  assert.ok(f.orientacion.animales.partes.length >= 3);
});
