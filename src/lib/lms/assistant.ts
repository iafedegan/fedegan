"use server";

import { adminDb } from "@/lib/cms/client";
import { generar, isYouTube, proveedorActivo, type Prov } from "@/lib/lms/ia-modelo";
import { flatLessons, getCourse, getEnrollment, getLearner } from "@/lib/lms/queries";

export type ChatTurn = { role: "user" | "model"; text: string };
export type AssistantReply = { answer?: string; error?: string };

const PER_HOUR = 20;
const PER_DAY = 80;

type Prepared = { error: string } | { prov: Prov; me: { key: string }; course: NonNullable<Awaited<ReturnType<typeof getCourse>>>; lesson: ReturnType<typeof flatLessons>[number]; idx: number; context: string; db: ReturnType<typeof adminDb> };

/** Valida sesión, inscripción y límites de uso, y arma el contexto del curso. */
async function prepare(input: { courseId: string; lessonId: string; slug: string }, scope: "leccion" | "curso" = "curso"): Promise<Prepared> {
  const prov = await proveedorActivo();
  if (!prov) return { error: "El asistente aún no está activado en este sitio: falta cargar una clave de Claude o de Gemini en Conexiones." };
  const me = await getLearner();
  if (!me) return { error: "Ingrese para usar el asistente." };
  const course = await getCourse(input.slug);
  if (!course || course.id !== input.courseId) return { error: "Curso no encontrado." };
  const lessons = flatLessons(course);
  const idx = lessons.findIndex((l) => l.id === input.lessonId);
  if (idx < 0) return { error: "Lección no encontrada." };
  const lesson = lessons[idx];
  const enrolled = await getEnrollment(course.id, me.key);
  if (!enrolled && !lesson.freePreview) return { error: "Inscríbase al curso para usar el asistente." };

  const db = adminDb();
  if (db) {
    const since = (ms: number) => new Date(Date.now() - ms).toISOString();
    const [{ count: h }, { count: d }] = await Promise.all([
      db.from("lms_ai_log").select("id", { count: "exact", head: true }).eq("user_key", me.key).gte("created_at", since(3600_000)),
      db.from("lms_ai_log").select("id", { count: "exact", head: true }).eq("user_key", me.key).gte("created_at", since(86_400_000)),
    ]);
    if ((h ?? 0) >= PER_HOUR || (d ?? 0) >= PER_DAY) return { error: "Llegó al límite de usos por ahora. Intente de nuevo en un rato." };
  }

  const used = scope === "leccion" ? [{ l: lesson, i: idx }] : lessons.map((l, i) => ({ l, i }));
  const sources = used.map(({ l, i }) => `Lección ${i + 1}: ${l.title}${i === idx ? " (LECCIÓN ACTUAL)" : ""}${l.content ? `\n${l.content}` : ""}`).join("\n\n");
  const context = `CURSO: ${course.title}\n${course.description}\n\nFUENTES (lecciones del curso):\n${sources}\n\nEl estudiante está en la Lección ${idx + 1}: ${lesson.title}.`;
  return { prov, me, course, lesson, idx, context, db };
}

/** Pregunta al asistente del curso. Solo para inscritos (o lecciones con vista previa). Limita el uso por persona. */
export async function askAssistant(input: { courseId: string; lessonId: string; slug: string; question: string; history: ChatTurn[] }): Promise<AssistantReply> {
  const question = input.question.trim().slice(0, 600);
  if (!question) return { error: "Escriba su pregunta." };
  const p = await prepare(input);
  if ("error" in p) return p;
  const { prov, me, course, lesson, context, db } = p;

  const history = input.history.slice(-8).map((t) => ({ role: t.role, text: t.text.slice(0, 3000) }));
  const video = lesson.kind === "video" && isYouTube(lesson.videoUrl) ? lesson.videoUrl : null;

  try {
    const answer = await generar(prov, { text: `${context}\n\nPREGUNTA DEL ESTUDIANTE: ${question}`, history, video });
    if (!answer) return { error: "El asistente no pudo responder ahora. Intente de nuevo." };
    await db?.from("lms_ai_log").insert({ user_key: me.key, course_id: course.id, lesson_id: lesson.id });
    return { answer };
  } catch {
    return { error: "El asistente tardó demasiado. Intente de nuevo." };
  }
}
