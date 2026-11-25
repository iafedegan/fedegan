import { adminDb } from "@/lib/cms/client";
import { aliadoAutenticado, claveEstudiante, malaSolicitud, noAutorizado, noEncontrado, ok, sinServicio } from "@/lib/lms/aliados";
import { getCourse } from "@/lib/lms/queries";
import { enrollLearner } from "@/lib/lms/servicio";

export const dynamic = "force-dynamic";

// Inscribe a la persona en el curso (gratuito). Es idempotente: repetirla no cambia nada.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const body = (await req.json().catch(() => null)) as { usuario?: unknown; nombre?: unknown } | null;
  const key = claveEstudiante(aliado, body?.usuario);
  if (!key) return malaSolicitud("El id de usuario no es válido.");
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim().slice(0, 80) : "";
  if (nombre.length < 3) return malaSolicitud("Falta el nombre completo de la persona.");
  const { slug } = await ctx.params;
  const curso = await getCourse(slug);
  if (!curso) return noEncontrado("Ese curso no existe o no está publicado.");
  if (curso.externalUrl && curso.lessons === 0) return malaSolicitud("Este curso se toma en otra plataforma.");
  const db = adminDb();
  if (!db) return sinServicio();
  await enrollLearner(db, curso.id, key, `${nombre}`);
  return ok({ inscrito: true });
}
