import type { Indicador } from "@/lib/observatorio";

export const PALETTE = ["#D8B558", "#2F9C62", "#9FB7A8", "#E7CF8C", "#5BBF8A", "#6F8F7E", "#B89A4A", "#7FD1A6", "#4C7A62"];

export const nf = (v: number, d = 0) => v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Texto de la unidad sin el «$$» doble del origen. */
export const unidadLimpia = (u: string) => u.replace(/\$\$/g, "$");

/** Formatea un valor según el formato y el prefijo del indicador. */
export function fmtValor(ind: Pick<Indicador, "formato" | "prefijo" | "unidad">, v: number): string {
  const d = ind.formato === "decimal2" ? 2 : ind.formato === "decimal1" ? 1 : ind.formato === "entero" ? 0 : Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 100 ? 1 : 2;
  const prefijo = ind.prefijo ?? (ind.unidad.includes("$") ? "$" : "");
  return `${prefijo}${nf(v, d)}`;
}

/** Etiqueta corta de un periodo: «sep/2026» → «sep ’26»; los años quedan igual. */
export const etiqueta = (p: string) => {
  const [m, y] = p.split("/");
  return y ? `${m} ’${y.slice(2)}` : p;
};

export function ticks(min: number, max: number, n = 4): number[] {
  if (min === max) return [min];
  const raw = (max - min) / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const out: number[] = [];
  // La última marca debe cubrir el máximo, o la gráfica recorta los datos más altos.
  for (let v = start; ; v += step) {
    out.push(Number(v.toFixed(10)));
    if (v >= max - step * 0.001) break;
  }
  return out;
}

export const variacion = (now: number, prev: number) => (prev ? ((now - prev) / Math.abs(prev)) * 100 : 0);
export const signo = (v: number) => `${v >= 0 ? "▲" : "▼"} ${v >= 0 ? "+" : "−"}${nf(Math.abs(v), 1)} %`;
