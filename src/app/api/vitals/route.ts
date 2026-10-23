// Recibe las métricas Core Web Vitals de los visitantes reales (solo con consentimiento) y las deja en los
// registros de la plataforma, donde Vercel Logs / drains pueden graficarlas y alertar.
export async function POST(request: Request) {
  try {
    const m = (await request.json()) as { name?: string; value?: number; rating?: string; path?: string };
    if (!m.name || typeof m.value !== "number") return new Response(null, { status: 400 });
    console.log(`[vitals] ${m.name}=${Math.round(m.value * 100) / 100} ${m.rating ?? ""} ${String(m.path ?? "").slice(0, 120)}`);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
