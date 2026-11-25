import { adminDb } from "@/lib/cms/client";
import { aliadoAutenticado, claveEstudiante, malaSolicitud, noAutorizado, noEncontrado, ok, sinServicio } from "@/lib/lms/aliados";
import { flatLessons, getCourse, getEnrollment } from "@/lib/lms/queries";
import { markLessonDone } from "@/lib/lms/servicio";

export const dynamic = "force-dynamic";

// Marca una lección de video o lectura como vista. Las evaluaciones se completan aprobándolas.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string; leccion: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const body = (await req.json().catch(() => null)) as { usuario?: unknown } | null;
  const key = claveEstudiante(aliado, body?.usuario);
  if (!key) return malaSolicitud("El id de usuario no es válido.");
  const { slug, leccion } = await ctx.params;
  const curso = await getCourse(slug);
  const lesson = curso ? flatLessons(curso).find((l) => l.id === leccion) : undefined;
  if (!curso || !lesson) return noEncontrado("Esa lección no existe.");
  if (lesson.kind === "quiz") return malaSolicitud("Las evaluaciones se completan aprobándolas.");
  const db = adminDb();
  if (!db) return sinServicio();
  if (!(await getEnrollment(curso.id, key))) return Response.json({ error: "sin_inscripcion", mensaje: "La persona no está inscrita en el curso." }, { status: 403 });
  await markLessonDone(db, curso.id, lesson.id, key, null);
  const e = await getEnrollment(curso.id, key);
  return ok({ completada: true, terminado: e?.completedAt ?? null, certificado: e?.completedAt && e.code ? e.code : null });
}
