// Recibe las métricas Core Web Vitals de los visitantes reales (solo con consentimiento) y las deja en los
// registros de la plataforma, donde Vercel Logs / drains pueden graficarlas y alertar.
export async function POST(request: Request) {
  try {
    const m = (await request.json()) as { name?: string; value?: number; rating?: string; path?: string };
    if (!m.name || typeof m.value !== "number") return new Response(null, { status: 400 });
    // Solo letras, números y la ruta: lo que llega del navegador no puede partir ni falsificar líneas del registro.
    const limpio = (v: unknown, n: number) => String(v ?? "").replace(/[^\w\-./]/g, "").slice(0, n);
    if (!Number.isFinite(m.value)) return new Response(null, { status: 400 });
    console.log(`[vitals] ${limpio(m.name, 12)}=${Math.round(m.value * 100) / 100} ${limpio(m.rating, 20)} ${limpio(m.path, 120)}`);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
