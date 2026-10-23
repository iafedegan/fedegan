import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { adminDb, publicDb } from "@/lib/cms/client";

export type Level = "basico" | "intermedio" | "avanzado";
export const LEVELS: Record<Level, string> = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" };

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  learnPoints: string[];
  requirements: string[];
  category: string;
  level: Level;
  instructor: string;
  instructorBio: string;
  cover: string | null;
  promoVideo: string | null;
  certificate: boolean;
  externalUrl: string | null;
  externalVideos: number;
  lessons: number;
  minutes: number;
  rating: number;
  ratings: number;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  kind: "video" | "lectura" | "quiz";
  videoUrl: string | null;
  content: string;
  minutes: number;
  freePreview: boolean;
  resourceUrl: string | null;
  resourceLabel: string;
  passScore: number;
};
export type Module = { id: string; title: string; summary: string; lessons: Lesson[] };
export type CourseFull = Course & { modules: Module[] };

type Row = Record<string, unknown>;
const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const n = (v: unknown) => (typeof v === "number" ? v : 0);
const lines = (v: unknown) => s(v).split("\n").map((x) => x.trim()).filter(Boolean);

function toCourse(r: Row, stats?: { lessons: number; minutes: number }, rate?: { sum: number; count: number }): Course {
  return {
    id: s(r.id), slug: s(r.slug), title: s(r.title), subtitle: s(r.subtitle), description: s(r.description),
    learnPoints: lines(r.learn_points), requirements: lines(r.requirements), category: s(r.category, "General"),
    level: (["basico", "intermedio", "avanzado"].includes(s(r.level)) ? s(r.level) : "basico") as Level,
    instructor: s(r.instructor), instructorBio: s(r.instructor_bio),
    cover: typeof r.cover_image === "string" && r.cover_image ? r.cover_image : null,
    promoVideo: typeof r.promo_video === "string" && r.promo_video ? r.promo_video : null,
    certificate: r.certificate !== false,
    externalUrl: typeof r.external_url === "string" && r.external_url ? r.external_url : null,
    externalVideos: n(r.external_videos),
    lessons: stats?.lessons ?? 0, minutes: stats?.minutes ?? 0,
    rating: rate && rate.count ? rate.sum / rate.count : 0, ratings: rate?.count ?? 0,
  };
}

const toLesson = (r: Row): Lesson => ({
  id: s(r.id), moduleId: s(r.module_id), title: s(r.title),
  kind: (["video", "lectura", "quiz"].includes(s(r.kind)) ? s(r.kind) : "video") as Lesson["kind"],
  videoUrl: typeof r.video_url === "string" && r.video_url ? r.video_url : null, content: s(r.content),
  minutes: n(r.duration_minutes), freePreview: r.free_preview === true,
  resourceUrl: typeof r.resource_url === "string" && r.resource_url ? r.resource_url : null,
  resourceLabel: s(r.resource_label), passScore: n(r.pass_score) || 70,
});

/** Catálogo público: cursos publicados con su número de lecciones, duración y valoración. */
export const getCourses = cache(async (): Promise<Course[]> => {
  const db = publicDb();
  if (!db) return [];
  const [{ data: cs }, { data: ls }, { data: rs }] = await Promise.all([
    db.from("lms_courses").select("*").order("sort_order", { ascending: true }),
    db.from("lms_lessons").select("course_id,duration_minutes"),
    db.from("lms_reviews").select("course_id,rating"),
  ]);
  const st = new Map<string, { lessons: number; minutes: number }>();
  for (const l of (ls ?? []) as Row[]) {
    const k = s(l.course_id);
    const a = st.get(k) ?? { lessons: 0, minutes: 0 };
    a.lessons++;
    a.minutes += n(l.duration_minutes);
    st.set(k, a);
  }
  const rt = new Map<string, { sum: number; count: number }>();
  for (const r of (rs ?? []) as Row[]) {
    const k = s(r.course_id);
    const a = rt.get(k) ?? { sum: 0, count: 0 };
    a.sum += n(r.rating);
    a.count++;
    rt.set(k, a);
  }
  return ((cs ?? []) as Row[]).map((c) => toCourse(c, st.get(s(c.id)), rt.get(s(c.id))));
});

export const getCourse = cache(async (slug: string): Promise<CourseFull | null> => {
  const course = (await getCourses()).find((c) => c.slug === slug);
  const db = publicDb();
  if (!course || !db) return null;
  const [{ data: ms }, { data: ls }] = await Promise.all([
    db.from("lms_modules").select("*").eq("course_id", course.id).order("sort_order", { ascending: true }),
    db.from("lms_lessons").select("*").eq("course_id", course.id).order("sort_order", { ascending: true }),
  ]);
  const lessons = ((ls ?? []) as Row[]).map(toLesson);
  const modules = ((ms ?? []) as Row[]).map((m) => ({ id: s(m.id), title: s(m.title), summary: s(m.summary), lessons: lessons.filter((l) => l.moduleId === s(m.id)) }));
  return { ...course, modules };
});

export const flatLessons = (c: CourseFull) => c.modules.flatMap((m) => m.lessons);

// ---------- Estudiante ----------

export type Learner = { key: string; name: string };

export async function getLearner(): Promise<Learner | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return { key: email.toLowerCase(), name: session.user.name ?? email };
}

export type Enrollment = { enrolledAt: string; completedAt: string | null; code: string | null };

export async function getEnrollment(courseId: string, key: string): Promise<Enrollment | null> {
  const db = adminDb();
  if (!db) return null;
  const { data } = await db.from("lms_enrollments").select("*").eq("course_id", courseId).eq("user_key", key).maybeSingle();
  if (!data) return null;
  return { enrolledAt: s(data.enrolled_at), completedAt: typeof data.completed_at === "string" ? data.completed_at : null, code: typeof data.certificate_code === "string" ? data.certificate_code : null };
}

export async function getProgress(courseId: string, key: string): Promise<Map<string, number | null>> {
  const db = adminDb();
  const out = new Map<string, number | null>();
  if (!db) return out;
  const { data } = await db.from("lms_progress").select("lesson_id,score").eq("course_id", courseId).eq("user_key", key);
  for (const r of (data ?? []) as Row[]) out.set(s(r.lesson_id), typeof r.score === "number" ? r.score : null);
  return out;
}

/** Cursos en los que está inscrita la persona, con su avance. */
export async function getMyCourses(key: string) {
  const db = adminDb();
  if (!db) return [];
  const [{ data: es }, { data: ps }, courses] = await Promise.all([
    db.from("lms_enrollments").select("course_id,enrolled_at,completed_at,certificate_code").eq("user_key", key).order("enrolled_at", { ascending: false }),
    db.from("lms_progress").select("course_id").eq("user_key", key),
    getCourses(),
  ]);
  const done = new Map<string, number>();
  for (const p of (ps ?? []) as Row[]) done.set(s(p.course_id), (done.get(s(p.course_id)) ?? 0) + 1);
  return ((es ?? []) as Row[])
    .map((e) => {
      const course = courses.find((c) => c.id === s(e.course_id));
      if (!course) return null;
      const d = done.get(course.id) ?? 0;
      return { course, done: d, percent: course.lessons ? Math.min(100, Math.round((d / course.lessons) * 100)) : 0, completedAt: typeof e.completed_at === "string" ? e.completed_at : null, code: typeof e.certificate_code === "string" ? e.certificate_code : null, enrolledAt: s(e.enrolled_at) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function getReviews(courseId: string) {
  const db = publicDb();
  if (!db) return [];
  const { data } = await db.from("lms_reviews").select("user_name,rating,comment,created_at").eq("course_id", courseId).order("created_at", { ascending: false }).limit(20);
  return ((data ?? []) as Row[]).map((r) => ({ name: s(r.user_name, "Estudiante"), rating: n(r.rating), comment: s(r.comment), at: s(r.created_at) }));
}

/** Preguntas de una evaluación sin la respuesta correcta (la calificación se hace en el servidor). */
export async function getQuiz(lessonId: string) {
  const db = adminDb();
  if (!db) return [];
  const { data } = await db.from("lms_quiz_questions").select("id,question,options,sort_order").eq("lesson_id", lessonId).order("sort_order", { ascending: true });
  return ((data ?? []) as Row[]).map((q) => ({ id: s(q.id), question: s(q.question), options: Array.isArray(q.options) ? (q.options as string[]) : [] }));
}

/** Convierte una dirección de YouTube/Vimeo en la de inserción; los demás archivos se reproducen directo. */
export function videoEmbed(url: string): { type: "iframe" | "file"; src: string } {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` };
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (host === "vimeo.com") return { type: "iframe", src: `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}` };
  } catch {
    /* dirección relativa o inválida: se trata como archivo */
  }
  return { type: "file", src: url };
}

// ---------- Carnet y verificación ----------

/** Código de carnet de la persona; se crea la primera vez que abre su carnet. */
export async function ensureStudent(me: Learner): Promise<{ code: string; since: string } | null> {
  const db = adminDb();
  if (!db) return null;
  const { data } = await db.from("lms_students").select("code,created_at").eq("user_key", me.key).maybeSingle();
  if (data) return { code: s(data.code), since: s(data.created_at) };
  for (let i = 0; i < 5; i++) {
    const code = `UCG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0")}`;
    const { data: ins, error } = await db.from("lms_students").insert({ user_key: me.key, code, name: me.name }).select("code,created_at").single();
    if (!error && ins) return { code: s(ins.code), since: s(ins.created_at) };
  }
  return null;
}

export async function getStudentStats(key: string) {
  const db = adminDb();
  if (!db) return { enrolled: 0, certificates: 0 };
  const { data } = await db.from("lms_enrollments").select("completed_at").eq("user_key", key);
  const rows = (data ?? []) as Row[];
  return { enrolled: rows.length, certificates: rows.filter((r) => r.completed_at).length };
}

export type CodeLookup =
  | { type: "carnet"; name: string; since: string; certificates: number }
  | { type: "certificado"; name: string; course: string; date: string }
  | null;

/** Verifica un código de carnet o de certificado (página pública de verificación). */
export async function lookupCode(code: string): Promise<CodeLookup> {
  const db = adminDb();
  if (!db || !/^UCG-\d{4}-[A-Z0-9]{6}$/i.test(code)) return null;
  const c = code.toUpperCase();
  const { data: st } = await db.from("lms_students").select("user_key,name,created_at").eq("code", c).maybeSingle();
  if (st) {
    const { certificates } = await getStudentStats(s(st.user_key));
    return { type: "carnet", name: s(st.name), since: s(st.created_at), certificates };
  }
  const { data: en } = await db.from("lms_enrollments").select("user_name,completed_at,course_id").eq("certificate_code", c).maybeSingle();
  if (en && en.completed_at) {
    const { data: co } = await db.from("lms_courses").select("title").eq("id", en.course_id).maybeSingle();
    return { type: "certificado", name: s(en.user_name), course: s(co?.title), date: s(en.completed_at) };
  }
  return null;
}
