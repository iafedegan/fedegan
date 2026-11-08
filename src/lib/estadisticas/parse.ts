// Convierte el HTML del sistema de estadísticas de FEDEGÁN (estadisticas.fedegan.org.co) en indicadores limpios.
// Sin dependencias: lo usan el servidor (al guardar) y las pruebas. El HTML de origen trae, por indicador, un bloque
// «title» con «NNN-Nombre» y una «Tabla de Datos»; algunos solo traen una NOTA (informes y presentaciones).

export type Serie = { nombre: string; valores: number[] };
export type IndicadorFedegan = {
  clave: string;
  codigo: string;
  titulo: string;
  unidad: string;
  periodos: string[];
  series: Serie[];
  nota?: string;
  forma?: "linea" | "area" | "barras";
};

const ENT: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", uuml: "ü" };

export function limpiar(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENT[n] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** «2.196.342» → 2196342; «6,2» → 6.2; vacío o «-» → NaN. */
export function numero(s: string): number {
  const t = limpiar(s).replace(/\s/g, "");
  if (!t || t === "-" || t === "--") return NaN;
  const pct = t.replace(/%$/, "");
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(pct)) return Number(pct.replace(/\./g, "").replace(",", "."));
  if (/^-?\d+(,\d+)?$/.test(pct)) return Number(pct.replace(",", "."));
  if (/^-?\d+(\.\d+)?$/.test(pct)) return Number(pct);
  return NaN;
}

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

// Unidad común entre los encabezados: «Sacrificio (miles cab)» y «Informal (miles cab)» → «miles cab».
function unidadComun(nombres: string[]): string {
  const us = nombres.map((n) => /\(([^()]+)\)\s*$/.exec(n)?.[1]?.trim() ?? "");
  return us.length && us[0] && us.every((u) => u === us[0]) ? us[0] : "";
}

function tablaDe(bloque: string) {
  const t = /<table[^>]*class="table_list"[\s\S]*?<\/table>/i.exec(bloque)?.[0];
  if (!t) return null;
  const filas = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  let cab: string[] = [];
  const datos: { posx: string; celdas: string[] }[] = [];
  for (const f of filas) {
    if (/<th/i.test(f)) {
      cab = [...f.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => limpiar(m[1]));
      continue;
    }
    const celdas = [...f.matchAll(/<td[^>]*class="list"[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => limpiar(m[1]));
    if (!celdas.length) continue;
    const posx = limpiar(/<td[^>]*class="posx"[^>]*>([\s\S]*?)<\/td>/i.exec(f)?.[1] ?? "");
    datos.push({ posx, celdas });
  }
  return cab.length && datos.length ? { cab, datos } : null;
}

export function parseIndicadores(html: string): IndicadorFedegan[] {
  const bloques = html.split(/(?=<form[^>]*name="doc\d+")/i).slice(1);
  const out: IndicadorFedegan[] = [];
  const usadas = new Set<string>();
  for (const b of bloques) {
    const tit = /class="title"[^>]*>([\s\S]*?)<\/td>/i.exec(b)?.[1];
    if (!tit) continue;
    const completo = limpiar(tit);
    const m = /^(\d+(?:-\d+)?)\s*-\s*(.+)$/.exec(completo);
    const codigo = m?.[1] ?? "";
    const titulo = (m?.[2] ?? completo).trim();
    let clave = slug(codigo ? `${codigo}-${titulo}` : titulo);
    while (usadas.has(clave)) clave += "-2";
    usadas.add(clave);
    const nota = limpiar(/title_field[^>]*>\s*NOTA:?\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i.exec(b)?.[1] ?? "") || undefined;
    const tabla = tablaDe(b);
    if (!tabla) {
      out.push({ clave, codigo, titulo, unidad: "", periodos: [], series: [], nota });
      continue;
    }
    const { cab, datos } = tabla;
    // Formato «largo»: primera columna vacía (categoría), luego Fecha y las mediciones.
    const largo = datos.some((d) => d.posx) || cab[0] === "";
    const colFecha = cab.findIndex((c) => /^fecha$/i.test(c));
    const ini = (colFecha >= 0 ? colFecha : 0) + 1;
    const medidas = cab.slice(ini);
    const periodos: string[] = [];
    const series = new Map<string, number[]>();
    const idx = new Map<string, number>();
    let unidad = unidadComun(medidas);
    for (const d of datos) {
      const per = d.celdas[0] ?? "";
      if (!idx.has(per)) { idx.set(per, periodos.length); periodos.push(per); }
      const i = idx.get(per)!;
      medidas.forEach((nombreMedida, k) => {
        const clase = largo && d.posx && medidas.length === 1 ? d.posx : largo && d.posx && datos.some((x) => x.posx !== d.posx) ? `${d.posx} · ${nombreMedida}` : nombreMedida;
        if (!series.has(clase)) series.set(clase, []);
        const arr = series.get(clase)!;
        while (arr.length < periodos.length) arr.push(NaN);
        arr[i] = numero(d.celdas[k + 1] ?? "");
      });
      if (largo && d.posx && !unidad && new Set(datos.map((x) => x.posx)).size === 1) unidad = d.posx;
    }
    const lista = [...series].map(([nombre, v]) => {
      while (v.length < periodos.length) v.push(NaN);
      return { nombre, valores: v };
    }).filter((s) => s.valores.some((v) => Number.isFinite(v)));
    // Sin ningún dato numérico: se deja como nota.
    if (!lista.length) { out.push({ clave, codigo, titulo, unidad: "", periodos: [], series: [], nota }); continue; }
    out.push({ clave, codigo, titulo, unidad, periodos, series: lista, nota, forma: periodos.length <= 12 && !periodos.some((p) => p.includes("/")) ? "barras" : "linea" });
  }
  return out;
}
