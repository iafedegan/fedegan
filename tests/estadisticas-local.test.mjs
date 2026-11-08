import test from "node:test";
import assert from "node:assert/strict";
import { observatorioDesdeConjuntos } from "../src/lib/estadisticas/local.ts";

const meses = ["nov/2025", "dic/2025", "ene/2026"];
const ind = (codigo, titulo, series, periodos = meses, extra = {}) => ({ clave: `${codigo}-x`, codigo, titulo, unidad: "", periodos, series: series.map(([nombre, valores]) => ({ nombre, valores })), ...extra });
const regiones = [["Región Caribe", [8490, 8372, 8652]], ["Magdalena Medio y Santanderes", [9069, 8980, 9385]], ["Llanos Orientales", [7818, 7525, 7786]]];

test("sin cifras cargadas no hay página de cifras", () => {
  assert.equal(observatorioDesdeConjuntos([]), null);
  assert.equal(observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("999", "Otro", [["a", [1, 2, 3]]])] }]), null);
  assert.equal(observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("065", "Sin datos", [])] }]), null);
});

test("los indicadores principales salen del HTML cargado con nombre corto y unidad conocida", () => {
  const o = observatorioDesdeConjuntos([
    { id: "precios", indicadores: [ind("065", "Precio ganado flaco Kilo en pie - Hembras", regiones), ind("053", "Precio promedio registrado…", [["Precio x kilo", [9700, 9740, 9795]]])] },
  ]);
  assert.deepEqual(Object.keys(o.indicadores).sort(), ["flaco-hembras", "gordo"]);
  assert.equal(o.indicadores["flaco-hembras"].titulo, "Flaco · hembras");
  assert.equal(o.indicadores["flaco-hembras"].unidad, "$ por kilo en pie");
  assert.deepEqual(o.indicadores["flaco-hembras"].series.map((s) => s.nombre), regiones.map((r) => r[0]));
  assert.equal(o.indicadores.gordo.series[0].valores[2], 9795);
  assert.match(o.indicadores.gordo.fuente, /FEDEG/);
});

test("el mismo código en varios conjuntos se toma una vez y se prefiere el de su tema", () => {
  const general = ind("065", "Flaco hembras (general)", [["Región Caribe", [1, 1, 1]]]);
  const precios = ind("065", "Flaco hembras", regiones);
  const o = observatorioDesdeConjuntos([{ id: "general", indicadores: [general] }, { id: "precios", indicadores: [precios] }]);
  assert.equal(o.indicadores["flaco-hembras"].series.length, 3);
});

test("el inventario va por departamento solo si el HTML trae al menos 5 y el total nacional", () => {
  const pocos = observatorioDesdeConjuntos([{ id: "inventario-ganadero", indicadores: [ind("001", "Inventario total", [["Antioquia", [3, 3, 3]], ["Córdoba", [2, 2, 2]], ["Nacional", [29, 29, 30]]], ["2023", "2024", "2025"])] }]);
  assert.equal(pocos.bovinos, undefined);
  assert.equal(pocos.inventario.length, 1);
  assert.equal(pocos.inventario[0].titulo, "Bovinos y bufalinos");
  const deps = ["Antioquia", "Córdoba", "Meta", "Casanare", "Cesar", "Santander"].map((n) => [n, [1, 2, 3]]);
  const muchos = observatorioDesdeConjuntos([{ id: "inventario-ganadero", indicadores: [ind("001", "Inventario total", [...deps, ["Nacional", [10, 20, 30]]], ["2023", "2024", "2025"])] }]);
  assert.equal(muchos.bovinos.departamentos.length, 6);
  assert.deepEqual(muchos.bovinos.nacional, [10, 20, 30]);
  assert.equal(muchos.inventario.length, 0);
});

test("el hato por orientación (un solo periodo) se vuelve partes del total", () => {
  const o = observatorioDesdeConjuntos([{ id: "inventario-ganadero", indicadores: [ind("089", "Animales por orientación", [["Cría", [100]], ["Doble propósito", [300]], ["Leche", [50]]], ["2025"])] }]);
  assert.deepEqual(o.orientacion.animales.partes.map((p) => p.nombre), ["Cría", "Doble propósito", "Leche"]);
  assert.equal(o.orientacion.animales.periodo, "2025");
});

test("con muchas series se destaca Colombia", () => {
  const paises = ["Argentina", "Australia", "Brasil", "Canadá", "Colombia", "Estados Unidos"].map((n, i) => [n, [i + 1, i + 2, i + 3]]);
  const o = observatorioDesdeConjuntos([{ id: "precios", indicadores: [ind("014", "Precio novillo gordo", paises)] }]);
  assert.equal(o.indicadores["novillo-paises"].destacadas[0], "Colombia");
  assert.equal(o.indicadores["novillo-paises"].destacadas.length, 4);
});
