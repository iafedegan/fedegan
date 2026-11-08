import "server-only";
import { adminDb, publicDb } from "@/lib/cms/client";
import { PROVEEDORES } from "@/lib/ia";
import { generar, isYouTube, proveedorActivo, type Prov } from "@/lib/lms/ia-modelo";
import { flatLessons, getCourse, getCourses, type CourseFull } from "@/lib/lms/queries";
import { cuantos, KINDS, leerJson, normalizarContenido, type Contenido, type StudioKind } from "@/lib/lms/studio-tipos";

// Materiales del Studio (resumen, guía, mapa mental, tarjetas, cuestionario, preguntas frecuentes, línea de tiempo, glosario e informe).
// Se generan UNA vez por lección y por curso (el modelo ve el video de la lección), se guardan en `lms_studio`
// (docs/migraciones/014-studio.sql) y el estudiante los abre al instante. Nada se genera cuando el estudiante hace clic en un material.

/** Con menos materiales que estos, la lección se considera incompleta y se vuelve a pedir lo que falta. */
const COMPLETO = 7;

const SYSTEM_STUDIO = `Eres el equipo pedagógico de la Escuela Virtual de FEDEGÁN–FNG (Federación Colombiana de Ganaderos). Preparas materiales de estudio para ganaderos, técnicos y estudiantes del campo colombiano.
Reglas:
- Español sencillo, claro y cercano. Frases cortas.
- Basa TODO únicamente en el video de la lección (si viene adjunto) y en los textos del curso que se te dan. No agregues datos, cifras, dosis, normas ni nombres que no estén ahí. Si algo no se dice, no lo incluyas.
- No des indicaciones veterinarias para casos concretos: ante animales enfermos, recomienda consultar a un médico veterinario.
- Respondes ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después y sin bloques de código.`;

// Cada material tiene su forma y su cantidad. Se piden en tres grupos (tres llamadas en paralelo) para que cada una termine antes de 1 minuto.
const ESQ: Record<StudioKind, string> = {
  resumen: `{ "idea": "una frase con la idea central", "puntos": [ { "titulo": "2 a 5 palabras", "texto": "una o dos frases" } ], "cierre": "una frase práctica para la finca" }  // 5 a 7 puntos`,
  guia: `{ "objetivos": ["Al terminar podrá …"], "conceptos": [ { "termino": "…", "definicion": "…" } ], "repaso": [ { "pregunta": "…", "respuesta": "…" } ], "antes": ["qué repasar antes de la evaluación"] }  // 3 a 5 objetivos, 5 a 8 conceptos, 5 preguntas de repaso, 3 a 4 cosas para repasar`,
  informe: `{ "titulo": "…", "introduccion": "…", "secciones": [ { "titulo": "…", "texto": "uno o dos párrafos" } ], "conclusiones": ["…"] }  // 3 a 4 secciones`,
  mapa: `{ "t": "tema central", "hijos": [ { "t": "rama principal", "hijos": [ { "t": "sub-rama" } ] } ] }  // 4 a 6 ramas y 2 a 4 sub-ramas por rama; cada nodo de 2 a 8 palabras, sin viñetas ni numeración`,
  tarjetas: `[ { "q": "pregunta o término", "a": "respuesta breve" } ]  // 10 a 12 tarjetas`,
  cuestionario: `[ { "q": "pregunta", "options": ["A", "B", "C", "D"], "correct": 0, "why": "por qué es la correcta" } ]  // 6 preguntas con 4 opciones; reparte la correcta entre las posiciones 0 a 3 ("correct" es el índice)`,
  faq: `[ { "q": "pregunta frecuente", "a": "respuesta corta" } ]  // 6 preguntas`,
  linea: `[ { "etiqueta": "paso, etapa o hito", "texto": "qué pasa en ese momento" } ]  // 5 a 8 pasos en orden`,
  glosario: `[ { "termino": "…", "definicion": "definición sencilla" } ]  // 8 a 12 términos`,
};
const GRUPOS: StudioKind[][] = [
  ["resumen", "guia", "informe"],
  ["mapa", "tarjetas", "cuestionario"],
  ["faq", "linea", "glosario"],
];
const MAX_LLAMADA_MS = 44_000; // las acciones del panel tienen 60 s (y antes y después consultan la base)

export const claveLeccion = (lessonId: string) => `leccion:${lessonId}`;
export const claveCurso = (courseId: string) => `curso:${courseId}`;

/** Materiales ya guardados de una lección y de su curso (null si todavía no se generaron o si la tabla no existe). */
export async function leerMateriales(courseId: string, lessonId: string): Promise<{ leccion: Contenido | null; curso: Contenido | null }> {
  const db = publicDb();
  if (!db) return { leccion: null, curso: null };
  try {
    const { data, error } = await db.from("lms_studio").select("clave,contenido").in("clave", [claveLeccion(lessonId), claveCurso(courseId)]);
    if (error) return { leccion: null, curso: null };
    const por = new Map((data ?? []).map((r) => [String(r.clave), normalizarContenido(r.contenido)]));
    const l = por.get(claveLeccion(lessonId));
    const c = por.get(claveCurso(courseId));
    return { leccion: l && cuantos(l) ? l : null, curso: c && cuantos(c) ? c : null };
  } catch {
    return { leccion: null, curso: null };
  }
}

type Db = NonNullable<ReturnType<typeof adminDb>>;

async function previoDe(db: Db, clave: string): Promise<Contenido> {
  const { data } = await db.from("lms_studio").select("contenido").eq("clave", clave).maybeSingle();
  return data ? normalizarContenido(data.contenido) : {};
}

async function guardar(db: Db, f: { clave: string; course_id: string; lesson_id: string | null; contenido: Contenido; modelo: string }): Promise<string | null> {
  const { error } = await db.from("lms_studio").upsert({ ...f, generado_en: new Date().toISOString() }, { onConflict: "clave" });
  if (!error) return null;
  return /lms_studio|does not exist|schema cache/i.test(error.message) ? "Falta crear la tabla de materiales (docs/migraciones/014-studio.sql)." : "No se pudo guardar el material.";
}

const etiquetaModelo = (prov: Prov) => `${prov.p}:${prov.p === "gemini" ? PROVEEDORES.gemini.modelo : (process.env.CLAUDE_ASSISTANT_MODEL ?? "claude-sonnet-5-5")}`;

/** Pide al modelo los materiales que faltan (un grupo por llamada, en paralelo) y los suma a lo que ya había. */
async function completar(p: Prov, base: string, video: string | null, previo: Contenido): Promise<{ contenido: Contenido; errores: string[] }> {
  const grupos = GRUPOS.filter((g) => g.some((k) => previo[k] === undefined));
  const resultados = await Promise.all(
    grupos.map(async (g) => {
      const esquema = `{\n${g.map((k) => `  "${k}": ${ESQ[k]}`).join(",\n")}\n}`;
      try {
        const bruto = await generar(p, { text: `${base}\n\nResponde SOLO con este JSON (mismas claves):\n${esquema}`, video, json: true, tokens: 7000, system: SYSTEM_STUDIO, timeoutMs: MAX_LLAMADA_MS, detalle: true, videoBaja: true });
        return bruto ? { c: normalizarContenido(leerJson(bruto)), e: "" } : { c: {} as Contenido, e: video ? "el modelo no pudo leer el video (puede ser privado o no estar disponible)" : "el modelo no respondió" };
      } catch (e) {
        const tiempo = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
        return { c: {} as Contenido, e: tiempo ? "el modelo tardó demasiado" : `el modelo respondió: ${e instanceof Error ? e.message : "error desconocido"}` };
      }
    }),
  );
  const contenido: Contenido = { ...previo };
  for (const r of resultados) Object.assign(contenido, r.c);
  return { contenido, errores: [...new Set(resultados.map((r) => r.e).filter(Boolean))] };
}

export type Resultado = { ok: true; contenido: Contenido; kinds: number } | { ok: false; error: string };

async function terminar(db: Db, p: Prov, clave: string, ids: { course_id: string; lesson_id: string | null }, previo: Contenido, res: { contenido: Contenido; errores: string[] }): Promise<Resultado> {
  const n = cuantos(res.contenido);
  if (n === 0 || n === cuantos(previo)) return { ok: false, error: `No se generó material${res.errores.length ? `: ${res.errores.join(" · ")}` : ""}.` };
  const err = await guardar(db, { clave, ...ids, contenido: res.contenido, modelo: etiquetaModelo(p) });
  if (err) return { ok: false, error: err };
  // Se guardó lo que salió bien; si quedó incompleto se avisa para reintentar.
  return n >= COMPLETO ? { ok: true, contenido: res.contenido, kinds: n } : { ok: false, error: `Quedó incompleto (${n} de ${KINDS.length})${res.errores.length ? `: ${res.errores.join(" · ")}` : ""}.` };
}

/** Genera y guarda los materiales de una lección (el modelo ve el video si es de YouTube). Si ya había algunos, solo pide los que faltan. */
export async function generarLeccion(course: CourseFull, lessonId: string, prov?: Prov | null): Promise<Resultado> {
  const p = prov ?? (await proveedorActivo("gemini"));
  if (!p) return { ok: false, error: "Falta cargar una clave de Gemini (o de Claude) en Conexiones." };
  const db = adminDb();
  if (!db) return { ok: false, error: "Falta la clave de servicio de Supabase en este entorno." };
  const lessons = flatLessons(course);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return { ok: false, error: "Lección no encontrada." };
  const lesson = lessons[idx];
  const video = lesson.kind === "video" && isYouTube(lesson.videoUrl) ? lesson.videoUrl : null;
  if (video && p.p !== "gemini" && lesson.content.length < 400) return { ok: false, error: "Para leer el video de la lección hace falta la clave de Gemini." };

  const otras = lessons.map((l, i) => `${i + 1}. ${l.title}`).join("\n");
  const base = `CURSO: ${course.title}\n${course.description}\n\nLECCIÓN ${idx + 1} de ${lessons.length}: ${lesson.title}${lesson.content ? `\nTexto de la lección: ${lesson.content}` : ""}\n\nTodas las lecciones del curso (solo para ubicar el tema):\n${otras}\n\nTAREA: ${video ? "mira el video adjunto y " : ""}prepara los materiales de estudio de ESTA lección.`;
  const clave = claveLeccion(lesson.id);
  const previo = await previoDe(db, clave);
  return terminar(db, p, clave, { course_id: course.id, lesson_id: lesson.id }, previo, await completar(p, base, video, previo));
}

/** Genera y guarda los materiales de todo el curso, a partir de lo ya generado para cada lección. */
export async function generarCurso(course: CourseFull, prov?: Prov | null): Promise<Resultado> {
  const p = prov ?? (await proveedorActivo("gemini"));
  if (!p) return { ok: false, error: "Falta cargar una clave de Gemini (o de Claude) en Conexiones." };
  const db = adminDb();
  if (!db) return { ok: false, error: "Falta la clave de servicio de Supabase en este entorno." };
  const lessons = flatLessons(course);
  const { data } = await db.from("lms_studio").select("lesson_id,contenido").eq("course_id", course.id).not("lesson_id", "is", null);
  const previos = new Map((data ?? []).map((r) => [String(r.lesson_id), normalizarContenido(r.contenido)]));
  const fuentes = lessons
    .map((l, i) => {
      const c = previos.get(l.id);
      const idea = c?.resumen?.idea || c?.resumen?.puntos?.map((x) => x.titulo).join(", ") || l.content;
      return `Lección ${i + 1}: ${l.title}${idea ? ` — ${idea}` : ""}`;
    })
    .join("\n");
  const base = `CURSO: ${course.title}\n${course.description}\n\nLECCIONES Y SUS IDEAS:\n${fuentes}\n\nTAREA: prepara los materiales de estudio de TODO EL CURSO (una visión general que une las lecciones, en el orden del curso).`;
  const clave = claveCurso(course.id);
  const previo = await previoDe(db, clave);
  return terminar(db, p, clave, { course_id: course.id, lesson_id: null }, previo, await completar(p, base, null, previo));
}

// ---------- Estado y cola (panel de administración) ----------

export type Pendiente = { tipo: "leccion" | "curso"; clave: string; courseId: string; slug: string; lessonId?: string; titulo: string };
export type EstadoStudio = {
  tablaLista: boolean;
  iaLista: boolean;
  proveedor: string | null;
  cursos: { id: string; slug: string; titulo: string; lecciones: number; hechas: number; curso: boolean }[];
  total: number;
  hechos: number;
  pendientes: number;
};

/** Qué hay generado y qué falta, en el orden en que se generará (las lecciones de cada curso y, al final de cada uno, el curso). */
export async function colaStudio(omitir: string[] = []): Promise<{ estado: EstadoStudio; pendientes: Pendiente[] }> {
  const db = adminDb() ?? publicDb();
  const prov = await proveedorActivo("gemini");
  const vacio: EstadoStudio = { tablaLista: false, iaLista: Boolean(prov), proveedor: prov ? PROVEEDORES[prov.p].label : null, cursos: [], total: 0, hechos: 0, pendientes: 0 };
  if (!db) return { estado: vacio, pendientes: [] };
  const cursos = await getCourses();
  const { data, error } = await db.from("lms_studio").select("clave,contenido");
  const listos = new Set<string>();
  for (const r of data ?? []) if (cuantos(normalizarContenido(r.contenido)) >= COMPLETO) listos.add(String(r.clave));
  const pendientes: Pendiente[] = [];
  const resumen: EstadoStudio["cursos"] = [];
  const skip = new Set(omitir);
  for (const c of cursos) {
    const full = await getCourse(c.slug);
    if (!full) continue;
    const ls = flatLessons(full);
    const hechas = ls.filter((l) => listos.has(claveLeccion(l.id))).length;
    resumen.push({ id: c.id, slug: c.slug, titulo: c.title, lecciones: ls.length, hechas, curso: listos.has(claveCurso(c.id)) });
    for (const l of ls) if (!listos.has(claveLeccion(l.id)) && !skip.has(claveLeccion(l.id))) pendientes.push({ tipo: "leccion", clave: claveLeccion(l.id), courseId: c.id, slug: c.slug, lessonId: l.id, titulo: `${c.title} · ${l.title}` });
    // El material de todo el curso se arma cuando ya están todas sus lecciones.
    if (hechas === ls.length && ls.length > 0 && !listos.has(claveCurso(c.id)) && !skip.has(claveCurso(c.id))) pendientes.push({ tipo: "curso", clave: claveCurso(c.id), courseId: c.id, slug: c.slug, titulo: `${c.title} · todo el curso` });
  }
  const total = resumen.reduce((n, c) => n + c.lecciones + 1, 0);
  const hechos = resumen.reduce((n, c) => n + c.hechas + (c.curso ? 1 : 0), 0);
  return { estado: { ...vacio, tablaLista: !error, cursos: resumen, total, hechos, pendientes: total - hechos }, pendientes };
}
