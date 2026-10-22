import "server-only";
import { cache } from "react";

// Cifras del Observatorio ganadero de CONtexto (datos oficiales de FEDEGÁN, sistema de información estadística).
// La API pública de CONtexto no tiene un endpoint del Observatorio: el servidor lee los datos que la propia página
// /observatorio publica, los guarda en caché unas horas y el portal los dibuja con su diseño.

const BASE = (process.env.CONTEXTO_API_URL ?? "https://contexto-olive.vercel.app/api/v1").replace(/\/api\/v1\/?$/, "");
export const OBSERVATORIO_URL = `${BASE}/observatorio`;
const REVALIDATE_SECONDS = 6 * 3600;

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

// Extrae el objeto JSON balanceado que empieza en `start`.
function balanced(src: string, start: number): string | null {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

function flight(html: string): string {
  const out: string[] = [];
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)) {
    try {
      out.push(JSON.parse(`"${m[1]}"`));
    } catch {
      /* fragmento ilegible: se omite */
    }
  }
  return out.join("");
}

export const getObservatorio = cache(async (): Promise<Observatorio | null> => {
  try {
    const res = await fetch(OBSERVATORIO_URL, { next: { revalidate: REVALIDATE_SECONDS }, headers: { Accept: "text/html" } });
    if (!res.ok) return null;
    const payload = flight(await res.text());
    const obs: Observatorio = { indicadores: {}, orientacion: {} };
    for (const m of payload.matchAll(/\{"clave":"([a-z0-9-]+)"/g)) {
      const raw = balanced(payload, m.index!);
      if (!raw) continue;
      let o: Record<string, unknown>;
      try {
        o = JSON.parse(raw);
      } catch {
        continue;
      }
      const clave = m[1];
      if (Array.isArray(o.partes)) {
        if (clave === "predios" || clave === "animales") obs.orientacion[clave] = o as unknown as Partes;
      } else if (Array.isArray(o.departamentos)) {
        if (clave === "bovinos" || clave === "predios") obs[clave] = o as unknown as Territorial;
      } else if (Array.isArray(o.series) && Array.isArray(o.periodos)) {
        obs.indicadores[clave] = o as unknown as Indicador;
      }
    }
    return Object.keys(obs.indicadores).length ? obs : null;
  } catch {
    return null;
  }
});

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «sep/2026» → «septiembre de 2026». */
export function periodoLargo(p: string): string {
  const [m, y] = p.split("/");
  const i = ABR.indexOf(m);
  return i >= 0 && y ? `${MESES[i]} de ${y}` : p;
}
