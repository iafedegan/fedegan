import { adminDb } from "@/lib/cms/client";
import { aliadoAutenticado, claveEstudiante, malaSolicitud, noAutorizado, noEncontrado, ok, sinServicio } from "@/lib/lms/aliados";
import { flatLessons, getCourse, getEnrollment, getQuiz } from "@/lib/lms/queries";
import { submitQuizFor } from "@/lib/lms/servicio";

export const dynamic = "force-dynamic";

async function contexto(slug: string, leccion: string) {
  const curso = await getCourse(slug);
  const lesson = curso ? flatLessons(curso).find((l) => l.id === leccion) : undefined;
  return curso && lesson && lesson.kind === "quiz" ? { curso, lesson } : null;
}

// Preguntas de la evaluación, sin la respuesta correcta. Solo para personas inscritas.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string; leccion: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const key = claveEstudiante(aliado, new URL(req.url).searchParams.get("usuario"));
  if (!key) return malaSolicitud("El id de usuario no es válido.");
  const { slug, leccion } = await ctx.params;
  const c = await contexto(slug, leccion);
  if (!c) return noEncontrado("Esa evaluación no existe.");
  if (!(await getEnrollment(c.curso.id, key))) return Response.json({ error: "sin_inscripcion", mensaje: "La persona no está inscrita en el curso." }, { status: 403 });
  const preguntas = await getQuiz(c.lesson.id);
  return ok({ notaMinima: c.lesson.passScore, preguntas: preguntas.map((p) => ({ id: p.id, pregunta: p.question, opciones: p.options })) });
}

// Califica la evaluación en el servidor. `respuestas` es { <id de pregunta>: <índice de la opción> }.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string; leccion: string }> }) {
  const aliado = aliadoAutenticado(req.headers);
  if (!aliado) return noAutorizado();
  const body = (await req.json().catch(() => null)) as { usuario?: unknown; respuestas?: unknown } | null;
  const key = claveEstudiante(aliado, body?.usuario);
  if (!key) return malaSolicitud("El id de usuario no es válido.");
  if (!body?.respuestas || typeof body.respuestas !== "object" || Array.isArray(body.respuestas)) return malaSolicitud("Faltan las respuestas.");
  const { slug, leccion } = await ctx.params;
  const c = await contexto(slug, leccion);
  if (!c) return noEncontrado("Esa evaluación no existe.");
  const db = adminDb();
  if (!db) return sinServicio();
  const r = await submitQuizFor(db, { courseId: c.curso.id, lessonId: c.lesson.id, key, answers: body.respuestas as Record<string, unknown> });
  if (r.error) return Response.json({ error: "no_se_pudo", mensaje: r.error }, { status: r.error.startsWith("Inscríbase") ? 403 : 400 });
  const e = await getEnrollment(c.curso.id, key);
  return ok({ nota: r.score, aprobado: r.passed, errores: r.wrong, terminado: e?.completedAt ?? null, certificado: e?.completedAt && e.code ? e.code : null });
}
