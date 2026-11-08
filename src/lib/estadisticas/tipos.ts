// Tipos y utilidades de las cifras del sector (las gráficas, las tarjetas y el explorador territorial las comparten).
// Los datos salen del HTML del sistema de estadísticas de FEDEGÁN que se carga en el panel; ya nada se lee de servicios externos.

export type Serie = { nombre: string; valores: number[] };
export type Indicador = {
  clave: string;
  titulo: string;
  unidad: string;
  descripcion?: string;
  fuente?: string;
  forma?: "linea" | "area" | "barras";
  grupo?: string;
  formato?: string;
  prefijo?: string;
  periodos: string[];
  series: Serie[];
  destacadas?: string[];
};
export type Territorial = {
  clave: string;
  titulo: string;
  unidad: string;
  nacional: number[];
  periodos: string[];
  departamentos: { nombre: string; valores: number[] }[];
};
export type Partes = { titulo: string; periodo: string; partes: { nombre: string; valor: number }[] };

export type Observatorio = {
  indicadores: Record<string, Indicador>;
  bovinos?: Territorial;
  predios?: Territorial;
  orientacion: { predios?: Partes; animales?: Partes };
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «sep/2026» → «septiembre de 2026». */
export function periodoLargo(p: string): string {
  const [m, y] = p.split("/");
  const i = ABR.indexOf(m);
  return i >= 0 && y ? `${MESES[i]} de ${y}` : p;
}
