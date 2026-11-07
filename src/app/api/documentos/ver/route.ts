import { MAX_COPIA, esOrigenPropio, extensionDe, tipoMime } from "@/lib/cms/documentos-copia-util";

// Entrega un documento para la vista previa del portal. Los archivos del sitio anterior se sirven como «descarga»
// (application/octet-stream) y desde otro origen, por eso el navegador no puede mostrarlos ni leerlos: aquí se piden
// al origen y se devuelven con su tipo correcto desde el propio portal.
// Solo acepta documentos de los orígenes de FEDEGÁN y del depósito «documentos» de Supabase (nada de direcciones arbitrarias).

const SUPABASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

function permitido(u: URL): boolean {
  if (!/^https:$/.test(u.protocol)) return false;
  if (esOrigenPropio(u)) return true;
  try {
    const s = SUPABASE ? new URL(SUPABASE) : null;
    return Boolean(s && u.hostname === s.hostname && u.pathname.startsWith("/storage/v1/object/public/documentos/"));
  } catch {
    return false;
  }
}

const SOLO = /\.(pdf|xlsx|docx)$/i; // lo que el portal sabe mostrar

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("u") ?? "";
  let destino: URL;
  try {
    destino = new URL(raw);
  } catch {
    return new Response("Dirección no válida", { status: 400 });
  }
  if (!permitido(destino) || !SOLO.test(decodeURIComponent(destino.pathname))) return new Response("Documento no permitido", { status: 403 });

  let res: Response;
  try {
    res = await fetch(destino.href, { redirect: "manual", signal: AbortSignal.timeout(25_000), headers: { "User-Agent": "Mozilla/5.0 (vista previa FEDEGAN-FNG)" } });
  } catch {
    return new Response("No se pudo obtener el documento", { status: 502 });
  }
  if (!res.ok || !res.body) return new Response("El documento no está disponible", { status: res.status === 404 ? 404 : 502 });
  const largo = Number(res.headers.get("content-length") ?? 0);
  if (largo > MAX_COPIA) return new Response("El documento es demasiado pesado para la vista previa", { status: 413 });

  const nombre = decodeURIComponent(destino.pathname.split("/").pop() ?? `documento.${extensionDe(destino.href)}`).replace(/[^\w.\- ]+/g, "_");
  return new Response(res.body, {
    headers: {
      "Content-Type": tipoMime(destino.href),
      "Content-Disposition": `inline; filename="${nombre}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      ...(largo ? { "Content-Length": String(largo) } : {}),
    },
  });
}
