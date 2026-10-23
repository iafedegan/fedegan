import { revalidatePath } from "next/cache";

// Lo llama el cron de Vercel cada madrugada (vercel.json): renueva las páginas para que el contenido
// con «Publicar desde» de hoy aparezca sin necesidad de un nuevo despliegue.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, at: new Date().toISOString() });
}
