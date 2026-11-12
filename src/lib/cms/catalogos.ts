import "server-only";
import cargosFng2026 from "@/content/catalogos/cargos-fng-2026.json";
import type { EsquemaForm, MapaCargos } from "./formulario-esquema";

// Catálogos para las listas encadenadas de los formularios: área → cargo → tareas.
// cargos-fng-2026 sale de «cargos_procedimientos_tareas_FNG_2026.xlsx» (solo cargos con perfil de cargo 2026, tareas sin repetir).
type Catalogo = Record<string, Record<string, string[]>>;
const CATALOGOS: Record<string, Catalogo> = { "cargos-fng-2026": cargosFng2026 as Catalogo };

/** Área → cargos (sin las tareas: es lo único que el formulario necesita para las listas). */
export function mapaCargos(id: string): MapaCargos | null {
  const c = CATALOGOS[id];
  return c ? Object.fromEntries(Object.entries(c).map(([a, cargos]) => [a, Object.keys(cargos)])) : null;
}

export function tareasDe(id: string, area: string, cargo: string): string[] {
  return CATALOGOS[id]?.[area]?.[cargo] ?? [];
}

/** Los mapas de los catálogos que usa un formulario. */
export function mapasDe(e: EsquemaForm): Record<string, MapaCargos> {
  const ids = new Set(e.campos.flatMap((c) => [c.catalogo?.id, ...(c.columnas ?? []).map((k) => k.catalogo?.id)]).filter((x): x is string => Boolean(x)));
  return Object.fromEntries([...ids].flatMap((id) => {
    const m = mapaCargos(id);
    return m ? [[id, m]] : [];
  }));
}
