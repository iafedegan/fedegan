// Arma las cifras de «Cifras del sector» (tarjetas, pestañas por tema, explorador territorial) con lo que el equipo cargó desde el HTML del
// sistema de estadísticas de FEDEGÁN. No lee nada de servicios externos. Puro (sin servidor): se prueba aparte.

import type { IndicadorFedegan } from "./parse";
import { CUBRE } from "./reparto";
import type { Indicador, Observatorio, Partes, Territorial } from "./tipos";

/** Nombre corto, unidad y descripción con que se muestra cada indicador principal de la página. */
const INFO: Record<string, { titulo: string; unidad: string; descripcion?: string }> = {
  gordo: { titulo: "Ganado gordo", unidad: "$ por kilo en pie", descripcion: "Precio promedio del ganado gordo en pie en Colombia." },
  "gordo-ceba": { titulo: "Gordo · macho ceba", unidad: "$ por kilo en pie", descripcion: "Precio promedio por región, subastas ganaderas." },
  "flaco-machos": { titulo: "Flaco · machos", unidad: "$ por kilo en pie", descripcion: "Precio promedio por región, subastas ganaderas." },
  "flaco-hembras": { titulo: "Flaco · hembras", unidad: "$ por kilo en pie", descripcion: "Precio promedio por región, subastas ganaderas." },
  "novillo-paises": { titulo: "Novillo gordo en pie: países", unidad: "US$ por kilo", descripcion: "Precio del novillo gordo en pie en distintos países." },
  "leche-paises": { titulo: "Leche cruda: países", unidad: "US$ por litro", descripcion: "Precio de la leche cruda pagado al productor en distintos países." },
  "leche-polvo": { titulo: "Leche en polvo entera", unidad: "US$ por tonelada", descripcion: "Precio internacional de la leche en polvo entera." },
  "carne-deshuesada": { titulo: "Carne bovina deshuesada", unidad: "US$ por tonelada", descripcion: "Precio implícito CIF de la carne bovina deshuesada." },
  sacrificio: { titulo: "Sacrificio de bovinos", unidad: "miles de cabezas", descripcion: "Sacrificio formal y estimado informal en Colombia." },
  "carne-mundo": { titulo: "Producción mundial de carne bovina", unidad: "miles de toneladas", descripcion: "Producción de carne de bovino de los principales países." },
  "consumo-res": { titulo: "Consumo de carne de res", unidad: "kg por habitante", descripcion: "Consumo aparente per cápita de carne de res." },
  "consumo-carnes": { titulo: "Consumo de carnes por habitante", unidad: "kg por habitante", descripcion: "Consumo aparente per cápita anual de carnes (solo formal)." },
  "consumo-leche": { titulo: "Consumo de leche por habitante", unidad: "litros por habitante", descripcion: "Consumo aparente per cápita anual de leche." },
  costos: { titulo: "Índice de costos de producción", unidad: "índice", descripcion: "Índices de costos y de precios de la producción ganadera." },
};

const FUENTE = "FEDEGÁN · Sistema de información estadística";

export type ObservatorioLocal = Observatorio & {
  /** Inventario como pestañas, cuando el HTML no trae los departamentos que necesita el explorador territorial. */
  inventario: Indicador[];
};

const conSeries = (i: IndicadorFedegan | undefined): i is IndicadorFedegan => !!i && i.series.length > 0 && i.periodos.length > 0;

function aIndicador(clave: string, i: IndicadorFedegan): Indicador {
  const info = INFO[clave];
  const colombia = i.series.length > 4 ? i.series.find((s) => /^colombia\b/i.test(s.nombre))?.nombre : undefined;
  return {
    clave,
    titulo: info?.titulo ?? i.titulo,
    unidad: info?.unidad ?? i.unidad,
    descripcion: info?.descripcion,
    fuente: FUENTE,
    forma: i.forma,
    periodos: i.periodos,
    series: i.series,
    destacadas: colombia ? [colombia, ...i.series.map((s) => s.nombre).filter((n) => n !== colombia).slice(0, 3)] : undefined,
  };
}

const esNacional = (n: string) => /^(nacional|total)\b/i.test(n.trim());

/** Departamentos por año: solo si el HTML trae el total nacional y al menos 5 departamentos. */
function territorial(i: IndicadorFedegan | undefined, clave: string, titulo: string, unidad: string): Territorial | undefined {
  if (!conSeries(i)) return undefined;
  const nacional = i.series.find((s) => esNacional(s.nombre));
  const deps = i.series.filter((s) => s !== nacional);
  if (!nacional || deps.length < 5) return undefined;
  const cero = (v: number) => (Number.isFinite(v) ? v : 0);
  return { clave, titulo, unidad, periodos: i.periodos, nacional: nacional.valores.map(cero), departamentos: deps.map((s) => ({ nombre: s.nombre, valores: s.valores.map(cero) })) };
}

/** Un solo periodo con varias partes (hato por orientación) → partes del total. */
function partes(i: IndicadorFedegan | undefined, titulo: string): Partes | undefined {
  if (!conSeries(i)) return undefined;
  const k = i.periodos.length - 1;
  const ps = i.series.map((s) => ({ nombre: s.nombre, valor: s.valores[k] })).filter((p) => Number.isFinite(p.valor) && p.valor > 0);
  return ps.length >= 2 ? { titulo, periodo: i.periodos[k], partes: ps } : undefined;
}

/** null si todavía no hay cifras cargadas (o ninguna de las principales). */
export function observatorioDesdeConjuntos(conjuntos: { id: string; indicadores: IndicadorFedegan[] }[]): ObservatorioLocal | null {
  // Un código puede estar en varios conjuntos (p. ej. «General» repite los de cada tema): se toma el primero con datos.
  const porCodigo = new Map<string, IndicadorFedegan>();
  for (const c of [...conjuntos].sort((a, b) => Number(a.id === "general") - Number(b.id === "general"))) {
    for (const i of c.indicadores) if (i.codigo && conSeries(i) && !porCodigo.has(i.codigo)) porCodigo.set(i.codigo, i);
  }
  const indicadores: Record<string, Indicador> = {};
  for (const [clave, codigos] of Object.entries(CUBRE)) {
    const i = codigos.map((c) => porCodigo.get(c)).find(Boolean);
    if (i) indicadores[clave] = aIndicador(clave, i);
  }
  const i001 = porCodigo.get("001");
  const i077 = porCodigo.get("077");
  const bovinos = territorial(i001, "bovinos", "Inventario de bovinos y bufalinos", "cabezas");
  const predios = territorial(i077, "predios", "Predios ganaderos", "predios");
  const orientacion = { predios: partes(porCodigo.get("088"), "Predios por orientación del hato"), animales: partes(porCodigo.get("089"), "Animales por orientación del hato") };

  const inventario: Indicador[] = [];
  if (!bovinos && !predios) {
    for (const [codigo, titulo] of [["001", "Bovinos y bufalinos"], ["077", "Predios ganaderos"], ["088", "Predios por orientación"], ["089", "Animales por orientación"]] as const) {
      const i = porCodigo.get(codigo);
      if (i) inventario.push({ ...aIndicador(`inv-${codigo}`, i), titulo, fuente: FUENTE });
    }
  }
  if (!Object.keys(indicadores).length && !bovinos && !predios && !inventario.length) return null;
  return { indicadores, bovinos, predios, orientacion, inventario };
}
