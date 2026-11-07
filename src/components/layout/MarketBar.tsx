import { getMercado } from "@/lib/mercado";

// Cintillo de mercado arriba del encabezado: dólar, petróleo, bolsas, oro y ganado en pie, en movimiento continuo.
export async function MarketBar() {
  const q = await getMercado();
  if (q.length === 0) return null;
  const item = (c: (typeof q)[number], k: string, hidden: boolean) => (
    <span key={k} className="mk-item" aria-hidden={hidden}>
      <b>{c.label}</b> {c.value}{" "}
      <i className={c.change > 0 ? "up" : c.change < 0 ? "down" : ""}>{c.change > 0 ? "▲" : c.change < 0 ? "▼" : "•"} {Math.abs(c.change).toFixed(2)}%</i>
    </span>
  );
  return (
    <div className="mk" role="region" aria-label="Indicadores de mercado">
      <div className="mk-track">
        {q.map((c) => item(c, c.id, false))}
        {q.map((c) => item(c, `${c.id}-2`, true))}
      </div>
    </div>
  );
}
