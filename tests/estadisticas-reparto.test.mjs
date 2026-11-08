import test from "node:test";
import assert from "node:assert/strict";
import { CUBRE, SECCION_DE_GRUPO, codigosCubiertos, repartir } from "../src/lib/estadisticas/reparto.ts";

const ind = (...cods) => cods.map((codigo) => ({ codigo, titulo: `Indicador ${codigo}` }));
// Códigos reales de cada grupo del sistema de estadísticas de FEDEGÁN (consulta del 8 de noviembre de 2026).
const conjuntos = [
  { id: "general", titulo: "General", indicadores: ind("001", "006", "007", "014", "015", "018", "019", "020", "023", "023-1", "034", "035", "036", "040", "041", "068", "073", "075", "077", "083", "088", "089", "090", "093", "095") },
  { id: "inventario-ganadero", titulo: "Inventario ganadero", indicadores: ind("001", "066", "076", "077", "088", "089") },
  { id: "produccion", titulo: "Producción", indicadores: ind("006", "007", "048", "049", "050", "051", "052", "092") },
  { id: "precios", titulo: "Precios", indicadores: ind("014", "015", "018", "019", "046", "053", "056", "057", "058", "064", "065", "069", "070", "071", "080", "085") },
  { id: "costos-de-produccion", titulo: "Costos de producción", indicadores: ind("020") },
  { id: "consumo", titulo: "Consumo", indicadores: ind("023", "023-1", "095") },
  { id: "importaciones-y-exportaciones", titulo: "Importaciones y exportaciones", indicadores: ind("043", "044", "059", "060", "074", "081", "082", "086", "087", "094") },
  { id: "indicadores-economicos", titulo: "Indicadores económicos", indicadores: ind("061") },
];
const obs = {
  indicadores: Object.fromEntries(Object.keys(CUBRE).map((k) => [k, {}])),
  bovinos: {},
  predios: {},
  orientacion: { predios: {}, animales: {} },
};
const cods = (c) => c.indicadores.map((i) => i.codigo);

test("con el Observatorio completo solo se muestra en cada sección lo que él no dibuja", () => {
  const { porSeccion, otras } = repartir(conjuntos, codigosCubiertos(obs));
  assert.deepEqual(cods(porSeccion.precios), ["046", "056", "057", "058", "069", "070", "080", "085"]);
  assert.deepEqual(cods(porSeccion.inventario), ["066", "076"]);
  assert.deepEqual(cods(porSeccion.produccion), ["048", "049", "050", "051", "052", "092"]);
  assert.equal(cods(porSeccion.internacional).length, 10);
  assert.equal(porSeccion.consumo, undefined, "los tres de consumo ya los dibuja el Observatorio");
  assert.equal(porSeccion.costos, undefined);
  assert.deepEqual(otras.map((c) => c.id), ["general", "indicadores-economicos"]);
  assert.deepEqual(cods(otras[0]), ["034", "035", "036", "040", "041", "068", "073", "075", "083", "090", "093"]);
  assert.deepEqual(cods(otras[1]), ["061"]);
});

test("si el Observatorio no trae una serie, el indicador equivalente sí se muestra", () => {
  const sin = { ...obs, indicadores: { ...obs.indicadores } };
  delete sin.indicadores["flaco-hembras"];
  delete sin.bovinos;
  const { porSeccion } = repartir(conjuntos, codigosCubiertos(sin));
  assert.ok(cods(porSeccion.precios).includes("065"));
  assert.ok(cods(porSeccion.inventario).includes("001"));
});

test("cada grupo conocido va a una sección que existe y los demás quedan como «otras»", () => {
  for (const s of Object.values(SECCION_DE_GRUPO)) assert.ok(["precios", "inventario", "produccion", "consumo", "internacional", "costos"].includes(s));
  const { otras } = repartir([{ id: "mi-conjunto", titulo: "Mío", indicadores: ind("900") }], new Set());
  assert.deepEqual(otras.map((c) => c.id), ["mi-conjunto"]);
});
