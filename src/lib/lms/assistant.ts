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

type Prepared = { error: string } | { key: string; me: { key: string }; course: NonNullable<Awaited<ReturnType<typeof getCourse>>>; lesson: ReturnType<typeof flatLessons>[number]; idx: number; context: string; db: ReturnType<typeof adminDb> };

/** Valida sesión, inscripción y límites de uso, y arma el contexto del curso. */
async function prepare(input: { courseId: string; lessonId: string; slug: string }, scope: "leccion" | "curso" = "curso"): Promise<Prepared> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "El asistente aún no está activado en este sitio." };
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
  return { key, me, course, lesson, idx, context, db };
}

async function gemini(key: string, parts: Record<string, unknown>[], extra: { history?: unknown[]; json?: boolean; tokens?: number } = {}) {
  const contents = [...(extra.history ?? []), { role: "user", parts }];
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { temperature: 0.3, maxOutputTokens: extra.tokens ?? 1500, ...(extra.json ? { responseMimeType: "application/json" } : {}) } }),
    signal: AbortSignal.timeout(90_000),
  });
  const data = await res.json();
  if (!res.ok) return null;
  return (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim() || null;
}

/** Pregunta al asistente del curso. Solo para inscritos (o lecciones con vista previa). Limita el uso por persona. */
export async function askAssistant(input: { courseId: string; lessonId: string; slug: string; question: string; history: ChatTurn[] }): Promise<AssistantReply> {
  const question = input.question.trim().slice(0, 600);
  if (!question) return { error: "Escriba su pregunta." };
  const p = await prepare(input);
  if ("error" in p) return p;
  const { key, me, course, lesson, context, db } = p;

  const history = input.history.slice(-8).map((t) => ({ role: t.role, parts: [{ text: t.text.slice(0, 3000) }] }));
  const userParts: Record<string, unknown>[] = [];
  if (lesson.kind === "video" && isYouTube(lesson.videoUrl)) userParts.push({ fileData: { fileUri: lesson.videoUrl, mimeType: "video/*" } });
  userParts.push({ text: `${context}\n\nPREGUNTA DEL ESTUDIANTE: ${question}` });

  try {
    const answer = await gemini(key, userParts, { history });
    if (!answer) return { error: "El asistente no pudo responder ahora. Intente de nuevo." };
    await db?.from("lms_ai_log").insert({ user_key: me.key, course_id: course.id, lesson_id: lesson.id });
    return { answer };
  } catch {
    return { error: "El asistente tardó demasiado. Intente de nuevo." };
  }
}

export type StudioKind = "resumen" | "guia" | "faq" | "linea" | "glosario" | "mapa" | "tarjetas" | "cuestionario" | "informe";
export type StudioReply = { kind: StudioKind; text?: string; error?: string };

const STUDIO_PROMPT: Record<StudioKind, string> = {
  resumen: "Escribe un RESUMEN claro y ordenado (máximo 220 palabras) con los puntos más importantes. Usa listas cortas y negritas.",
  guia: "Crea una GUÍA DE ESTUDIO: objetivos de aprendizaje, conceptos clave con definición breve, 5 preguntas de repaso con su respuesta y qué repasar antes de la evaluación.",
  faq: "Crea 6 PREGUNTAS FRECUENTES con su respuesta corta. Formato: **Pregunta** y debajo la respuesta.",
  linea: "Crea una LÍNEA DE TIEMPO con los hitos, etapas o pasos en orden. Formato de cada línea: **etiqueta** — descripción breve. Si no hay fechas, ordena por secuencia del proceso.",
  glosario: "Crea un GLOSARIO de 8 a 12 términos técnicos. Formato de cada línea: **Término** — definición sencilla.",
  mapa: "Crea un MAPA MENTAL como lista con sangría de 2 espacios por nivel: la primera línea es el tema central, luego ramas principales (máximo 6) y sub-ramas (máximo 4 cada una). Solo texto corto, sin viñetas ni numeración ni negritas.",
  tarjetas: 'Crea 10 TARJETAS DIDÁCTICAS (flashcards). Responde SOLO un arreglo JSON: [{"q":"pregunta o término","a":"respuesta breve"}].',
  cuestionario: 'Crea un CUESTIONARIO de 6 preguntas de selección múltiple con 4 opciones y una correcta. Responde SOLO un arreglo JSON: [{"q":"...","options":["...","...","...","..."],"correct":0,"why":"explicación breve"}] (correct es el índice 0-3).',
  informe: "Redacta un INFORME DE ESTUDIO tipo documento: título, introducción, 3 a 5 secciones con subtítulos en negrita y conclusiones prácticas para la finca.",
};

/** Genera un material de estudio (panel Studio) a partir de la lección actual o de todo el curso. */
export async function generateStudio(input: { courseId: string; lessonId: string; slug: string; kind: StudioKind; scope: "leccion" | "curso" }): Promise<StudioReply> {
  const kind = input.kind;
  if (!(kind in STUDIO_PROMPT)) return { kind, error: "Material no disponible." };
  const p = await prepare(input, input.scope);
  if ("error" in p) return { kind, error: p.error };
  const { key, me, course, lesson, context, db } = p;
  const parts: Record<string, unknown>[] = [];
  if (input.scope === "leccion" && lesson.kind === "video" && isYouTube(lesson.videoUrl)) parts.push({ fileData: { fileUri: lesson.videoUrl, mimeType: "video/*" } });
  parts.push({ text: `${context}\n\nTAREA (${input.scope === "leccion" ? "solo la lección actual" : "todo el curso"}): ${STUDIO_PROMPT[kind]}` });
  try {
    const text = await gemini(key, parts, { json: kind === "tarjetas" || kind === "cuestionario", tokens: 3000 });
    if (!text) return { kind, error: "No se pudo generar el material. Intente de nuevo." };
    await db?.from("lms_ai_log").insert({ user_key: me.key, course_id: course.id, lesson_id: lesson.id });
    return { kind, text };
  } catch {
    return { kind, error: "Tardó demasiado. Intente de nuevo." };
  }
}
