"use server";

import { adminDb } from "@/lib/cms/client";
import { flatLessons, getCourse, getEnrollment, getLearner } from "@/lib/lms/queries";

export type ChatTurn = { role: "user" | "model"; text: string };
export type AssistantReply = { answer?: string; error?: string };

const MODEL = process.env.GEMINI_ASSISTANT_MODEL ?? "gemini-3.5-flash";
const PER_HOUR = 20;
const PER_DAY = 80;

const SYSTEM = `Eres el asistente de estudio de la Escuela Virtual de FEDEGÁN–FNG, como un cuaderno de estudio del curso.
Reglas:
- Responde SIEMPRE en español sencillo, claro y cercano, pensando en productores, técnicos y estudiantes del campo colombiano.
- Basa tus respuestas ÚNICAMENTE en las FUENTES del curso que se te dan (el video de la lección actual, si viene adjunto, y los textos de las lecciones). No uses conocimiento externo para afirmar datos, dosis, cifras o normas.
- Si lo que preguntan no está en las fuentes, dilo con honestidad ("Eso no se trata en este curso") y sugiere la lección o el tema más cercano.
- Cita de dónde sale cada idea con el formato [Lección N: título].
- Sé breve y ordenado: usa listas cortas. No inventes información médica o veterinaria; ante casos de animales enfermos recomienda consultar a un médico veterinario.
- Si piden preguntas de práctica, hazlas de selección múltiple y da las respuestas al final.`;

function isYouTube(url: string | null) {
  return !!url && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

/** Pregunta al asistente del curso. Solo para inscritos (o lecciones con vista previa). Limita el uso por persona. */
export async function askAssistant(input: { courseId: string; lessonId: string; slug: string; question: string; history: ChatTurn[] }): Promise<AssistantReply> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "El asistente aún no está activado en este sitio." };
  const question = input.question.trim().slice(0, 600);
  if (!question) return { error: "Escriba su pregunta." };

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
    if ((h ?? 0) >= PER_HOUR || (d ?? 0) >= PER_DAY) return { error: "Llegó al límite de preguntas por ahora. Intente de nuevo en un rato." };
  }

  const sources = lessons
    .map((l, i) => `Lección ${i + 1}: ${l.title}${i === idx ? " (LECCIÓN ACTUAL)" : ""}${l.content ? `\n${l.content}` : ""}`)
    .join("\n\n");
  const context = `CURSO: ${course.title}\n${course.description}\n\nFUENTES (lecciones del curso):\n${sources}\n\nEl estudiante está en la Lección ${idx + 1}: ${lesson.title}.`;

  const contents = input.history.slice(-8).map((t) => ({ role: t.role, parts: [{ text: t.text.slice(0, 3000) }] }));
  const userParts: Record<string, unknown>[] = [];
  if (lesson.kind === "video" && isYouTube(lesson.videoUrl)) userParts.push({ fileData: { fileUri: lesson.videoUrl, mimeType: "video/*" } });
  userParts.push({ text: `${context}\n\nPREGUNTA DEL ESTUDIANTE: ${question}` });
  contents.push({ role: "user", parts: userParts as never });

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1500 } }),
      signal: AbortSignal.timeout(90_000),
    });
    const data = await res.json();
    if (!res.ok) return { error: "El asistente no pudo responder ahora. Intente de nuevo." };
    const answer = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
    if (!answer) return { error: "No pude generar una respuesta. Reformule su pregunta." };
    await db?.from("lms_ai_log").insert({ user_key: me.key, course_id: course.id, lesson_id: lesson.id });
    return { answer };
  } catch {
    return { error: "El asistente tardó demasiado. Intente de nuevo." };
  }
}
