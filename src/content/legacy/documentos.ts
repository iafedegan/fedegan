import raw from "./documentos.json";

// Inventario de documentos del portal actual (fedegan.org.co), generado el 6 de noviembre de 2026 recorriendo
// las 305 páginas migradas, sus tablas incrustadas (incluidos los enlaces cortos) y la versión en vivo de cada una.
//   total     documentos distintos que tiene la página en el original
//   enTablas  cuántos de ellos están dentro de tablas incrustadas (por ejemplo, Datos e indicadores)
//   faltan    documentos que se ven en el sitio actual pero que la copia migrada no trae: [nombre, url, tipo]
// noMigradas: páginas del sitio actual con documentos que todavía no existen en el portal nuevo.

export type DocFaltante = [nombre: string, url: string, tipo: string];
export type DocsPagina = { total: number; enTablas: number; faltan: DocFaltante[] };
export type PaginaNoMigrada = { titulo: string; url: string; docs: DocFaltante[] };

const data = raw as unknown as { generado: string; paginas: Record<string, DocsPagina>; noMigradas: PaginaNoMigrada[] };

export const inventarioFecha = data.generado;
export const paginasNoMigradas = data.noMigradas;

export function docsDePagina(key: string): DocsPagina | null {
  return data.paginas[key] ?? null;
}

export function resumenDocumentos() {
  const valores = Object.values(data.paginas);
  return {
    paginas: valores.length,
    documentos: valores.reduce((n, p) => n + p.total, 0),
    faltan: valores.reduce((n, p) => n + p.faltan.length, 0),
    paginasConFaltantes: valores.filter((p) => p.faltan.length > 0).length,
    noMigradas: data.noMigradas.length,
    docsNoMigradas: data.noMigradas.reduce((n, p) => n + p.docs.length, 0),
  };
}
