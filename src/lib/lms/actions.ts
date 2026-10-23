"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { hasAnyRole } from "@/lib/access";
import { EDITOR_ROLES } from "@/lib/cms/guard";
import { adminDb, CMS_TAG } from "@/lib/cms/client";

type Row = Record<string, unknown>;
const NOT_CONFIGURED = "La Escuela Virtual aún no tiene la clave de servicio (SUPABASE_SERVICE_ROLE_KEY) en el servidor.";

async function learner() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return { key: email.toLowerCase(), name: session.user.name ?? email };
}

async function requireEditor() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");
  if (!hasAnyRole(session.user.roles, EDITOR_ROLES)) redirect("/admin");
  return session.user.email ?? session.user.name ?? "editor";
}

const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const int = (fd: FormData, k: string) => {
  const v = Number.parseInt(String(fd.get(k) ?? ""), 10);
  return Number.isNaN(v) ? 0 : Math.max(0, v);
};
const safeUrl = (v: string) => (!v ? null : /^(https:\/\/|http:\/\/|\/(?!\/))/.test(v) ? v : null);

function certificateCode() {
  return `UCG-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ---------------------------------------------------------------- estudiante

export async function enroll(fd: FormData) {
  const courseId = str(fd, "course_id", 60);
  const slug = str(fd, "slug", 100);
  const me = await learner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent(`/escuela-virtual/${slug}`)}`);
  const db = adminDb();
  if (!db) redirect(`/escuela-virtual/${slug}?error=${encodeURIComponent(NOT_CONFIGURED)}`);
  await db.from("lms_enrollments").upsert({ course_id: courseId, user_key: me.key, user_name: me.name }, { onConflict: "course_id,user_key", ignoreDuplicates: true });
  redirect(`/escuela-virtual/perfil?inscrito=${encodeURIComponent(slug)}`);
}

/** Marca la lección como vista y, si era la última, cierra el curso y emite el certificado. */
async function markDone(courseId: string, lessonId: string, key: string, score: number | null) {
  const db = adminDb()!;
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

export async function completeLesson(fd: FormData) {
  const courseId = str(fd, "course_id", 60);
  const lessonId = str(fd, "lesson_id", 60);
  const slug = str(fd, "slug", 100);
  const next = str(fd, "next", 60);
  const me = await learner();
  const db = adminDb();
  if (!me || !db) redirect(`/escuela-virtual/${slug}`);
  const { data: enr } = await db.from("lms_enrollments").select("id").eq("course_id", courseId).eq("user_key", me.key).maybeSingle();
  if (!enr) redirect(`/escuela-virtual/${slug}`);
  await markDone(courseId, lessonId, me.key, null);
  revalidatePath(`/escuela-virtual/${slug}`, "layout");
  redirect(next ? `/escuela-virtual/${slug}/aula/${next}` : `/escuela-virtual/${slug}/aula/${lessonId}?fin=1`);
}

export type QuizResult = { error?: string; score?: number; passed?: boolean; wrong?: { question: string; explanation: string }[] };

export async function submitQuiz(_prev: QuizResult, fd: FormData): Promise<QuizResult> {
  const courseId = str(fd, "course_id", 60);
  const lessonId = str(fd, "lesson_id", 60);
  const slug = str(fd, "slug", 100);
  const me = await learner();
  const db = adminDb();
  if (!me || !db) return { error: "Ingrese para presentar la evaluación." };
  const { data: enr } = await db.from("lms_enrollments").select("id").eq("course_id", courseId).eq("user_key", me.key).maybeSingle();
  if (!enr) return { error: "Inscríbase al curso para presentar la evaluación." };
  const [{ data: qs }, { data: les }] = await Promise.all([
    db.from("lms_quiz_questions").select("*").eq("lesson_id", lessonId).order("sort_order", { ascending: true }),
    db.from("lms_lessons").select("pass_score").eq("id", lessonId).maybeSingle(),
  ]);
  const questions = (qs ?? []) as Row[];
  if (!questions.length) return { error: "Esta evaluación aún no tiene preguntas." };
  let ok = 0;
  const wrong: NonNullable<QuizResult["wrong"]> = [];
  for (const q of questions) {
    if (Number(fd.get(`q_${q.id}`)) === q.correct_index) ok++;
    else wrong.push({ question: String(q.question), explanation: String(q.explanation ?? "") });
  }
  const score = Math.round((ok / questions.length) * 100);
  const passed = score >= (typeof les?.pass_score === "number" ? les.pass_score : 70);
  if (passed) {
    await markDone(courseId, lessonId, me.key, score);
    revalidatePath(`/escuela-virtual/${slug}`, "layout");
  }
  return { score, passed, wrong };
}

export async function submitReview(fd: FormData) {
  const courseId = str(fd, "course_id", 60);
  const slug = str(fd, "slug", 100);
  const rating = Math.min(5, Math.max(1, int(fd, "rating")));
  const me = await learner();
  const db = adminDb();
  if (!me || !db) redirect(`/escuela-virtual/${slug}`);
  const { data: enr } = await db.from("lms_enrollments").select("id").eq("course_id", courseId).eq("user_key", me.key).maybeSingle();
  if (enr) {
    await db.from("lms_reviews").upsert({ course_id: courseId, user_key: me.key, user_name: me.name, rating, comment: str(fd, "comment", 600) }, { onConflict: "course_id,user_key" });
    updateTag(CMS_TAG);
  }
  revalidatePath(`/escuela-virtual/${slug}`, "layout");
  redirect(`/escuela-virtual/${slug}#valoraciones`);
}

// ---------------------------------------------------------------- editor

function changed(courseId: string) {
  updateTag(CMS_TAG);
  revalidatePath("/escuela-virtual", "layout");
  revalidatePath(`/admin/cursos/${courseId}/curriculo`);
}
function back(courseId: string, msg: string, error = false): never {
  changed(courseId);
  redirect(`/admin/cursos/${courseId}/curriculo?${error ? "error" : "ok"}=${encodeURIComponent(msg)}`);
}

export async function saveModule(fd: FormData) {
  const actor = await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  const id = str(fd, "id", 60);
  const title = str(fd, "title", 120);
  if (!title) back(courseId, "Escriba el título del módulo.", true);
  if (id) {
    await db.from("lms_modules").update({ title, summary: str(fd, "summary", 300) }).eq("id", id);
  } else {
    const { data } = await db.from("lms_modules").select("sort_order").eq("course_id", courseId).order("sort_order", { ascending: false }).limit(1);
    await db.from("lms_modules").insert({ course_id: courseId, title, summary: str(fd, "summary", 300), sort_order: ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1 });
  }
  await db.from("audit_log").insert({ actor, action: id ? "editar" : "crear", entity: "modulo", entity_id: id || courseId, summary: title });
  back(courseId, id ? "Módulo guardado" : "Módulo creado");
}

export async function deleteModule(fd: FormData) {
  const actor = await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  await db.from("lms_modules").delete().eq("id", str(fd, "id", 60));
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: "modulo", entity_id: str(fd, "id", 60) });
  back(courseId, "Módulo eliminado");
}

async function swap(table: "lms_modules" | "lms_lessons", scope: { col: string; val: string }, id: string, dir: number) {
  const db = adminDb()!;
  const { data } = await db.from(table).select("id").eq(scope.col, scope.val).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) await db.from(table).update({ sort_order: k }).eq("id", ids[k]);
}

export async function moveModule(fd: FormData) {
  await requireEditor();
  const courseId = str(fd, "course_id", 60);
  if (!adminDb()) back(courseId, NOT_CONFIGURED, true);
  await swap("lms_modules", { col: "course_id", val: courseId }, str(fd, "id", 60), fd.get("dir") === "up" ? -1 : 1);
  back(courseId, "Orden actualizado");
}

export async function moveLesson(fd: FormData) {
  await requireEditor();
  const courseId = str(fd, "course_id", 60);
  if (!adminDb()) back(courseId, NOT_CONFIGURED, true);
  await swap("lms_lessons", { col: "module_id", val: str(fd, "module_id", 60) }, str(fd, "id", 60), fd.get("dir") === "up" ? -1 : 1);
  back(courseId, "Orden actualizado");
}

export async function saveLesson(fd: FormData) {
  const actor = await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  const id = str(fd, "id", 60);
  const moduleId = str(fd, "module_id", 60);
  const title = str(fd, "title", 140);
  if (!title) back(courseId, "Escriba el título de la lección.", true);
  const kind = ["video", "lectura", "quiz"].includes(str(fd, "kind", 10)) ? str(fd, "kind", 10) : "video";
  const videoUrl = str(fd, "video_url", 300);
  if (videoUrl && !safeUrl(videoUrl)) back(courseId, "El video debe ser una dirección https://.", true);
  const resourceUrl = str(fd, "resource_url", 300);
  if (resourceUrl && !safeUrl(resourceUrl)) back(courseId, "El recurso debe ser una dirección https:// o una ruta que empiece por /.", true);
  const row = {
    title, kind, video_url: kind === "video" ? safeUrl(videoUrl) : null, content: str(fd, "content", 20000),
    duration_minutes: int(fd, "duration_minutes"), free_preview: fd.get("free_preview") === "on",
    resource_url: safeUrl(resourceUrl), resource_label: str(fd, "resource_label", 80), pass_score: Math.min(100, Math.max(1, int(fd, "pass_score") || 70)),
  };
  if (id) {
    await db.from("lms_lessons").update(row).eq("id", id);
  } else {
    const { data } = await db.from("lms_lessons").select("sort_order").eq("module_id", moduleId).order("sort_order", { ascending: false }).limit(1);
    await db.from("lms_lessons").insert({ ...row, module_id: moduleId, course_id: courseId, sort_order: ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1 });
  }
  await db.from("audit_log").insert({ actor, action: id ? "editar" : "crear", entity: "leccion", entity_id: id || moduleId, summary: title });
  back(courseId, id ? "Lección guardada" : "Lección creada");
}

export async function deleteLesson(fd: FormData) {
  const actor = await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  await db.from("lms_lessons").delete().eq("id", str(fd, "id", 60));
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: "leccion", entity_id: str(fd, "id", 60) });
  back(courseId, "Lección eliminada");
}

export async function saveQuestion(fd: FormData) {
  await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  const lessonId = str(fd, "lesson_id", 60);
  const options = [0, 1, 2, 3].map((i) => str(fd, `option_${i}`, 200)).filter(Boolean);
  const correct = int(fd, "correct_index");
  const question = str(fd, "question", 400);
  if (!question || options.length < 2 || correct >= options.length) back(courseId, "La pregunta necesita enunciado, al menos 2 opciones y una respuesta correcta válida.", true);
  const { data } = await db.from("lms_quiz_questions").select("sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: false }).limit(1);
  await db.from("lms_quiz_questions").insert({ lesson_id: lessonId, question, options, correct_index: correct, explanation: str(fd, "explanation", 400), sort_order: ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1 });
  back(courseId, "Pregunta agregada");
}

export async function deleteQuestion(fd: FormData) {
  await requireEditor();
  const db = adminDb();
  const courseId = str(fd, "course_id", 60);
  if (!db) back(courseId, NOT_CONFIGURED, true);
  await db.from("lms_quiz_questions").delete().eq("id", str(fd, "id", 60));
  back(courseId, "Pregunta eliminada");
}
