import { aliadoAutenticado, noAutorizado, ok, resumenCurso } from "@/lib/lms/aliados";
import { getCourses } from "@/lib/lms/queries";

export const dynamic = "force-dynamic";

// Catálogo de cursos publicados, para aplicaciones aliadas.
export async function GET(req: Request) {
  if (!aliadoAutenticado(req.headers)) return noAutorizado();
  const cursos = await getCourses();
  return ok({ cursos: cursos.map(resumenCurso) });
}
