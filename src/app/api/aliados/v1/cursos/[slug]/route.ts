import { aliadoAutenticado, claveEstudiante, detalleCurso, malaSolicitud, noAutorizado, noEncontrado, ok } from "@/lib/lms/aliados";
import { getCourse, getEnrollment, getProgress, videoEmbed } from "@/lib/lms/queries";
import { siteOrigin } from "@/lib/lms/qr";

export const dynamic = "force-dynamic";

// Detalle de un curso. Con `?usuario=<id>` incluye la inscripción, el avance y, según corresponda,
// el video y el contenido de las lecciones que esa persona puede abrir.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const { slug } = await ctx.params;
  const curso = await getCourse(slug);
  if (!curso) return noEncontrado("Ese curso no existe o no está publicado.");

  const usuario = new URL(req.url).searchParams.get("usuario");
  let inscripcion = null;
  let progreso = new Map<string, number | null>();
  if (usuario !== null) {
    const key = claveEstudiante(aliado, usuario);
    if (!key) return malaSolicitud("El id de usuario no es válido.");
    inscripcion = await getEnrollment(curso.id, key);
    if (inscripcion) progreso = await getProgress(curso.id, key);
  }
  return ok(detalleCurso(curso, inscripcion, progreso, (u) => {
    const v = videoEmbed(u);
    return { tipo: v.type, src: v.src };
  }, await siteOrigin()));
}
