// Reglas de la Escuela Virtual que comparten el portal (acciones del estudiante) y la API de aliados.
// Reciben el cliente de base de datos y no dependen de Next ni de la sesión, para poder probarlas.
import type { SupabaseClient } from "@supabase/supabase-js";

type Db = Pick<SupabaseClient, "from">;
type Row = Record<string, unknown>;

export function certificateCode(): string {
  return `FED-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Inscribe a la persona (clave de estudiante) si todavía no lo está. */
export async function enrollLearner(db: Db, courseId: string, key: string, name: string): Promise<void> {
  await db.from("lms_enrollments").upsert({ course_id: courseId, user_key: key, user_name: name }, { onConflict: "course_id,user_key", ignoreDuplicates: true });
}

/** Marca la lección como vista y, si era la última, cierra el curso y emite el certificado. */
export async function markLessonDone(db: Db, courseId: string, lessonId: string, key: string, score: number | null): Promise<void> {
  await db.from("lms_progress").upsert({ course_id: courseId, lesson_id: lessonId, user_key: key, score }, { onConflict: "user_key,lesson_id" });
  const [{ count: total }, { count: done }] = await Promise.all([
    db.from("lms_lessons").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    db.from("lms_progress").select("id", { count: "exact", head: true }).eq("course_id", courseId).eq("user_key", key),
  ]);
  if (total && done && done >= total) {
    const { data } = await db.from("lms_enrollments").select("completed_at").eq("course_id", courseId).eq("user_key", key).maybeSingle();
    if (data && !data.completed_at) {
      await db.from("lms_enrollments").update({ completed_at: new Date().toISOString(), certificate_code: certificateCode() }).eq("course_id", courseId).eq("user_key", key);
    }
  }
}

export type QuizResult = { error?: string; score?: number; passed?: boolean; wrong?: { question: string; explanation: string }[] };

/** Califica una evaluación: `answers` trae, por pregunta, el índice de la opción elegida. */
export function gradeQuiz(questions: Row[], answers: Record<string, unknown>, passScore: number): Required<Pick<QuizResult, "score" | "passed" | "wrong">> {
  let ok = 0;
  const wrong: { question: string; explanation: string }[] = [];
  for (const q of questions) {
    if (Number(answers[String(q.id)]) === q.correct_index) ok++;
    else wrong.push({ question: String(q.question), explanation: String(q.explanation ?? "") });
  }
  const score = questions.length ? Math.round((ok / questions.length) * 100) : 0;
  return { score, passed: score >= passScore, wrong };
}

/** Presenta la evaluación de una lección: califica en el servidor y, si aprueba, marca la lección. */
export async function submitQuizFor(db: Db, input: { courseId: string; lessonId: string; key: string; answers: Record<string, unknown> }): Promise<QuizResult> {
  const { data: enr } = await db.from("lms_enrollments").select("id").eq("course_id", input.courseId).eq("user_key", input.key).maybeSingle();
  if (!enr) return { error: "Inscríbase al curso para presentar la evaluación." };
  const [{ data: qs }, { data: les }] = await Promise.all([
    db.from("lms_quiz_questions").select("*").eq("lesson_id", input.lessonId).order("sort_order", { ascending: true }),
    db.from("lms_lessons").select("pass_score").eq("id", input.lessonId).maybeSingle(),
  ]);
  const questions = (qs ?? []) as Row[];
  if (!questions.length) return { error: "Esta evaluación aún no tiene preguntas." };
  const result = gradeQuiz(questions, input.answers, typeof les?.pass_score === "number" ? les.pass_score : 70);
  if (result.passed) await markLessonDone(db, input.courseId, input.lessonId, input.key, result.score);
  return result;
}
