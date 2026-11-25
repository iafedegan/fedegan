import { aliadoAutenticado, claveEstudiante, malaSolicitud, noAutorizado, ok, resumenCurso } from "@/lib/lms/aliados";
import { getMyCourses } from "@/lib/lms/queries";

export const dynamic = "force-dynamic";

// Cursos en los que está inscrita la persona, con su avance y el código de certificado si ya terminó.
export async function GET(req: Request, ctx: { params: Promise<{ usuario: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const key = claveEstudiante(aliado, (await ctx.params).usuario);
  if (!key) return malaSolicitud("El id de usuario no es válido.");
  const mios = await getMyCourses(key);
  return ok({
    cursos: mios.map((m) => ({
      ...resumenCurso(m.course),
      avance: { hechas: m.done, porcentaje: m.percent },
      desde: m.enrolledAt,
      terminado: m.completedAt,
      certificado: m.completedAt && m.code ? m.code : null,
    })),
  });
}
