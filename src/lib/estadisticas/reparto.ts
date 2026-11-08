// Reparto de las cifras del sistema de estadísticas de FEDEGÁN dentro de las secciones de «Cifras del sector»:
// cada grupo (Precios, Inventario ganadero, Producción…) se muestra en su sección, y no se repite lo que ya aparece en las pestañas principales.
// Puro (sin servidor): se prueba aparte.

/** Código del indicador del sistema de estadísticas que corresponde a cada serie del Observatorio (se comprobó que las cifras coinciden). */
export const CUBRE: Record<string, string[]> = {
  gordo: ["053"],
  "gordo-ceba": ["071"],
  "flaco-machos": ["064"],
  "flaco-hembras": ["065"],
  "novillo-paises": ["014"],
  "leche-paises": ["018"],
  "leche-polvo": ["019"],
  "carne-deshuesada": ["015"],
  sacrificio: ["006"],
  "carne-mundo": ["007"],
  "consumo-res": ["095"],
  "consumo-carnes": ["023"],
  "consumo-leche": ["023-1"],
  costos: ["020"],
};

/** Grupo del sistema de estadísticas → sección de la página donde se muestra. */
export const SECCION_DE_GRUPO: Record<string, string> = {
  precios: "precios",
  "inventario-ganadero": "inventario",
  produccion: "produccion",
  consumo: "consumo",
  "importaciones-y-exportaciones": "internacional",
  "costos-de-produccion": "costos",
};

type Obs = { indicadores: Record<string, unknown>; bovinos?: unknown; predios?: unknown; orientacion: { predios?: unknown; animales?: unknown } };

/** Códigos de indicadores que el Observatorio ya muestra con los datos que trae. */
export function codigosCubiertos(obs: Obs): Set<string> {
  const out = new Set<string>();
  for (const k of Object.keys(obs.indicadores)) for (const c of CUBRE[k] ?? []) out.add(c);
  if (obs.bovinos) out.add("001");
  if (obs.predios) out.add("077");
  if (obs.orientacion.predios) out.add("088");
  if (obs.orientacion.animales) out.add("089");
  return out;
}

type Conjunto<I extends { codigo: string }> = { id: string; titulo: string; indicadores: I[] };

/** Separa los conjuntos guardados: lo que va dentro de cada sección y lo que sobra («Otras cifras»). Los códigos ya cubiertos no se repiten. */
export function repartir<I extends { codigo: string }, C extends Conjunto<I>>(conjuntos: C[], cubiertos: ReadonlySet<string>): { porSeccion: Record<string, C>; otras: C[] } {
  const porSeccion: Record<string, C> = {};
  const otras: C[] = [];
  for (const c of conjuntos) {
    const indicadores = c.indicadores.filter((i) => !i.codigo || !cubiertos.has(i.codigo));
    if (!indicadores.length) continue;
    const seccion = SECCION_DE_GRUPO[c.id];
    if (seccion && !porSeccion[seccion]) porSeccion[seccion] = { ...c, indicadores };
    else otras.push({ ...c, indicadores });
  }
  return { porSeccion, otras };
}
