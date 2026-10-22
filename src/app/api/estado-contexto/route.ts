import { contextoCredentials } from "@/lib/contexto";

export const dynamic = "force-dynamic";

// Diagnóstico de la conexión con CONtexto: de dónde sale la clave y qué responde la API. Nunca devuelve la clave.
export async function GET() {
  const c = await contextoCredentials();
  const envConfigurada = Boolean(process.env.CONTEXTO_API_KEY);
  let estado: number | string | null = null;
  const probar = async (key: string) => {
    try {
      const r = await fetch(`${c.base}/articulos?portada=1`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
      return r.status;
    } catch {
      return "sin conexión";
    }
  };
  if (c.key) estado = await probar(c.key);
  const estadoEnv = envConfigurada && process.env.CONTEXTO_API_KEY !== c.key ? await probar(process.env.CONTEXTO_API_KEY as string) : undefined;
  return Response.json(
    { fuente: c.source, estado, envConfigurada, ...(estadoEnv !== undefined ? { estadoVariableDeEntorno: estadoEnv } : {}) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
