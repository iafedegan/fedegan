// Lector de la página pública del Observatorio ganadero de CONtexto. Se usa UNA sola vez, desde el panel, para copiar el
// historial (desde 2021) y el inventario por departamento a la base de datos del portal. Después el portal ya no lo consulta.
// Puro (sin servidor): se prueba aparte.

import type { Indicador, Observatorio, Partes, Serie, Territorial } from "./tipos";

// Extrae el objeto JSON balanceado que empieza en `start`.
function balanceado(src: string, start: number): string | null {
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

/** Une los fragmentos «self.__next_f.push» de la página en un solo texto. */
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

/** null si la página no trae ningún indicador. */
export function leerObservatorioContexto(html: string): Observatorio | null {
  const payload = flight(html);
  const obs: Observatorio = { indicadores: {}, orientacion: {} };
  for (const m of payload.matchAll(/\{"clave":"([a-z0-9-]+)"/g)) {
    const raw = balanceado(payload, m.index!);
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
}

const ABR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «oct/2026» → número ordenable; «2025» → número ordenable; otra cosa → null. */
export function clavePeriodo(p: string | undefined): number | null {
  const t = (p ?? "").trim().toLowerCase();
  const m = /^([a-z]{3})\/(\d{4})$/.exec(t);
  if (m) {
    const k = ABR.indexOf(m[1]);
    return k < 0 ? null : Number(m[2]) * 12 + k;
  }
  return /^\d{4}$/.test(t) ? Number(t) * 12 : null;
}

const sinTildes = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const fin = (periodos: string[]) => clavePeriodo(periodos[periodos.length - 1]) ?? -1;

/** La página de CONtexto manda las celdas vacías como null; el portal las maneja como NaN. */
function numeros(v: unknown): number[] {
  return Array.isArray(v) ? v.map((x) => (typeof x === "number" && Number.isFinite(x) ? x : NaN)) : [];
}

/** Deja la copia lista para usar (sin null en las series) y descarta lo que venga mal formado. */
export function normalizarCopia(o: Observatorio): Observatorio {
  const indicadores: Record<string, Indicador> = {};
  for (const [k, i] of Object.entries(o.indicadores ?? {})) {
    if (!Array.isArray(i?.periodos) || !Array.isArray(i?.series)) continue;
    indicadores[k] = { ...i, series: i.series.map((s) => ({ nombre: String(s.nombre), valores: numeros(s.valores) })) };
  }
  const terr = (t?: Territorial): Territorial | undefined =>
    t && Array.isArray(t.periodos) && Array.isArray(t.departamentos)
      ? { ...t, nacional: numeros(t.nacional).map((v) => (Number.isFinite(v) ? v : 0)), departamentos: t.departamentos.map((d) => ({ nombre: String(d.nombre), valores: numeros(d.valores).map((v) => (Number.isFinite(v) ? v : 0)) })) }
      : undefined;
  return { indicadores, bovinos: terr(o.bovinos), predios: terr(o.predios), orientacion: { predios: o.orientacion?.predios, animales: o.orientacion?.animales } };
}

/**
 * Historial de la copia + lo más reciente de FEDEGÁN, periodo por periodo (si ambos traen el mismo periodo gana FEDEGÁN).
 * Las series se emparejan por nombre; si cada lado trae una sola, se emparejan entre sí. null si no se pueden unir con seguridad.
 */
function unirSeries(basePer: string[], base: Serie[], copiaPer: string[], copia: Serie[]): { periodos: string[]; series: Serie[] } | null {
  const claves = new Map<string, number>();
  for (const p of [...basePer, ...copiaPer]) {
    const k = clavePeriodo(p);
    if (k === null) return null;
    claves.set(p.trim().toLowerCase(), k);
  }
  const pares = new Map<Serie, Serie>();
  const libres = new Set(copia);
  for (const b of base) {
    const c = [...libres].find((x) => sinTildes(x.nombre) === sinTildes(b.nombre)) ?? (base.length === 1 && copia.length === 1 ? copia[0] : undefined);
    if (c) {
      pares.set(b, c);
      libres.delete(c);
    }
  }
  if (!pares.size) return null;
  const periodos = [...new Map([...basePer, ...copiaPer].map((p) => [p.trim().toLowerCase(), p])).entries()].sort((a, b) => claves.get(a[0])! - claves.get(b[0])!).map(([, p]) => p);
  const valor = (per: string[], v: number[], p: string) => {
    const i = per.findIndex((x) => x.trim().toLowerCase() === p.trim().toLowerCase());
    return i >= 0 ? v[i] : NaN;
  };
  const una = (nombre: string, b: Serie | undefined, c: Serie | undefined): Serie => ({
    nombre,
    valores: periodos.map((p) => {
      const vb = b ? valor(basePer, b.valores, p) : NaN;
      return Number.isFinite(vb) ? vb : c ? valor(copiaPer, c.valores, p) : NaN;
    }),
  });
  return { periodos, series: [...base.map((b) => una(b.nombre, b, pares.get(b))), ...[...libres].map((c) => una(c.nombre, undefined, c))] };
}

function unirIndicador(base: Indicador, copia: Indicador): Indicador {
  const u = unirSeries(base.periodos, base.series, copia.periodos, copia.series);
  if (u) return { ...base, periodos: u.periodos, series: u.series, destacadas: base.destacadas ?? copia.destacadas };
  // Sin forma segura de unirlas: se queda la que llega más reciente y, a igual fecha, la más larga.
  const gana = fin(copia.periodos) > fin(base.periodos) || (fin(copia.periodos) === fin(base.periodos) && copia.periodos.length > base.periodos.length);
  return gana ? { ...base, periodos: copia.periodos, series: copia.series, destacadas: copia.destacadas ?? base.destacadas } : base;
}

// Departamentos: la copia trae los 32 + Bogotá; se usa hasta que el HTML de FEDEGÁN traiga todos los departamentos de un año más reciente.
function elegirTerritorial(base?: Territorial, copia?: Territorial): Territorial | undefined {
  if (!base) return copia;
  if (!copia) return base;
  if (fin(base.periodos) > fin(copia.periodos) && base.departamentos.length >= copia.departamentos.length) return base;
  return copia.departamentos.length >= base.departamentos.length ? copia : base;
}

function elegirPartes(base?: Partes, copia?: Partes): Partes | undefined {
  if (!base) return copia;
  if (!copia) return base;
  return (clavePeriodo(copia.periodo) ?? -1) > (clavePeriodo(base.periodo) ?? -1) ? copia : base;
}

type ConInventario = Observatorio & { inventario: Indicador[] };

/**
 * Combina las cifras cargadas del HTML de FEDEGÁN (`base`) con la copia única de CONtexto (`copia`).
 * El historial sale de la copia; lo más reciente, de FEDEGÁN. Así el portal sigue al día aunque la copia no se actualice.
 */
export function fusionarConCopia(base: ConInventario | null, copia: Observatorio | null): ConInventario | null {
  if (!copia) return base;
  const c = normalizarCopia(copia);
  const sinNada = !Object.keys(c.indicadores).length && !c.bovinos && !c.predios;
  if (sinNada) return base;
  if (!base) return { ...c, inventario: [] };
  const indicadores: Record<string, Indicador> = { ...c.indicadores };
  for (const [k, i] of Object.entries(base.indicadores)) indicadores[k] = c.indicadores[k] ? unirIndicador(i, c.indicadores[k]) : i;
  const bovinos = elegirTerritorial(base.bovinos, c.bovinos);
  const predios = elegirTerritorial(base.predios, c.predios);
  return {
    indicadores,
    bovinos,
    predios,
    orientacion: { predios: elegirPartes(base.orientacion.predios, c.orientacion.predios), animales: elegirPartes(base.orientacion.animales, c.orientacion.animales) },
    inventario: bovinos || predios ? [] : base.inventario,
  };
}
