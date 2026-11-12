import { getConjuntos } from "@/lib/cms/estadisticas";
import type { IndicadorFedegan } from "@/lib/estadisticas/parse";
import { nf } from "@/components/observatorio/format";

// Cintillo superior con cifras ganaderas del sistema de estadísticas de FEDEGÁN (precios, inventario…): el último dato de cada
// indicador y su variación frente al periodo anterior, en movimiento continuo. Sin cifras cargadas, el cintillo no aparece.
const CODIGOS = ["046", "057", "058", "056", "069", "070", "080", "001"];
const ES_NUM = (n: number) => Number.isFinite(n);

function resumen(i: IndicadorFedegan) {
  const serie = i.series.find((s) => s.valores.filter(ES_NUM).length >= 1);
  if (!serie) return null;
  const v = serie.valores.filter(ES_NUM);
  const ultimo = v[v.length - 1];
  const previo = v.length > 1 ? v[v.length - 2] : null;
  const cambio = previo ? ((ultimo - previo) / Math.abs(previo)) * 100 : 0;
  const d = Math.abs(ultimo) >= 1000 ? 0 : Math.abs(ultimo) >= 100 ? 1 : 2;
  const valor = `${i.unidad.includes("$") ? "$" : ""}${nf(ultimo, d)}`;
  const etiqueta = i.titulo.replace(/\s*[-–(].*$/, "").trim();
  return { id: i.clave, label: etiqueta.length > 42 ? `${etiqueta.slice(0, 40)}…` : etiqueta, valor, cambio };
}

export async function CifrasBar() {
  const conjuntos = await getConjuntos().catch(() => []);
  const porCodigo = new Map<string, IndicadorFedegan>();
  for (const c of conjuntos) for (const i of c.indicadores) if (i.codigo && !porCodigo.has(i.codigo)) porCodigo.set(i.codigo, i);
  let items = CODIGOS.map((c) => porCodigo.get(c)).filter((x): x is IndicadorFedegan => Boolean(x)).map(resumen).filter((x) => x !== null);
  if (items.length === 0) {
    items = [...porCodigo.values()].map(resumen).filter((x) => x !== null).slice(0, 8);
  }
  if (items.length === 0) return null;
  const item = (c: (typeof items)[number], k: string, hidden: boolean) => (
    <span key={k} className="mk-item" aria-hidden={hidden}>
      <b>{c!.label}</b> {c!.valor}{" "}
      <i className={c!.cambio > 0 ? "up" : c!.cambio < 0 ? "down" : ""}>{c!.cambio > 0 ? "▲" : c!.cambio < 0 ? "▼" : "•"} {Math.abs(c!.cambio).toFixed(2).replace(".", ",")}%</i>
    </span>
  );
  return (
    <div className="mk mk-cifras" role="region" aria-label="Cifras ganaderas">
      <div className="mk-track">
        {items.map((c) => item(c, c!.id, false))}
        {items.map((c) => item(c, `${c!.id}-2`, true))}
      </div>
    </div>
  );
}
