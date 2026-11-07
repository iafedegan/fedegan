// Cotizaciones para el cintillo de mercado (dólar, petróleo, bolsas, oro y ganado en pie).
// Se piden al servidor y se guardan 10 minutos; si la fuente falla, el cintillo simplemente no aparece.
export type Cotizacion = { id: string; label: string; value: string; change: number };

const num0 = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
const SIMBOLOS: { id: string; label: string; symbol: string; fmt: (n: number) => string }[] = [
  { id: "usd", label: "Dólar (COP)", symbol: "COP=X", fmt: (n) => `$${n.toLocaleString("es-CO", { maximumFractionDigits: 2 })}` },
  { id: "wti", label: "Petróleo WTI", symbol: "CL=F", fmt: (n) => `US$${n.toFixed(2)}` },
  { id: "brent", label: "Brent", symbol: "BZ=F", fmt: (n) => `US$${n.toFixed(2)}` },
  { id: "sp", label: "S&P 500", symbol: "^GSPC", fmt: num0 },
  { id: "dow", label: "Dow Jones", symbol: "^DJI", fmt: num0 },
  { id: "nasdaq", label: "Nasdaq", symbol: "^IXIC", fmt: num0 },
  { id: "oro", label: "Oro", symbol: "GC=F", fmt: (n) => `US$${num0(n)}` },
  { id: "ganado", label: "Ganado en pie (CME)", symbol: "LE=F", fmt: (n) => `${n.toFixed(1)} ¢/lb` },
];

async function una(s: (typeof SIMBOLOS)[number]): Promise<Cotizacion | null> {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.symbol)}?range=1d&interval=1d`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FEDEGAN-portal)" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const m = (await r.json())?.chart?.result?.[0]?.meta;
    const p = Number(m?.regularMarketPrice);
    const prev = Number(m?.chartPreviousClose);
    if (!Number.isFinite(p)) return null;
    return { id: s.id, label: s.label, value: s.fmt(p), change: Number.isFinite(prev) && prev ? ((p - prev) / prev) * 100 : 0 };
  } catch {
    return null;
  }
}

export async function getMercado(): Promise<Cotizacion[]> {
  const all = await Promise.all(SIMBOLOS.map(una));
  return all.filter((x): x is Cotizacion => x !== null);
}
