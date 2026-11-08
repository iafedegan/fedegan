"use server";

import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { adminDb } from "@/lib/cms/client";
import { proveedorActivo } from "@/lib/lms/ia-modelo";
import { flatLessons, getCourse, getEnrollment, getLearner } from "@/lib/lms/queries";
import { colaStudio, generarCurso, generarLeccion, leerMateriales, type EstadoStudio } from "@/lib/lms/studio";
import type { Contenido } from "@/lib/lms/studio-tipos";

const POR_HORA = 20;

/** Para un estudiante: si los materiales de la lección o del curso todavía no se generaron, los prepara (una sola vez) y los deja guardados. */
export async function prepararMateriales(input: { courseId: string; lessonId: string; slug: string; scope: "leccion" | "curso" }): Promise<{ ok: boolean; contenido?: Contenido; error?: string }> {
  const me = await getLearner();
  if (!me) return { ok: false, error: "Ingrese para preparar los materiales." };
  const course = await getCourse(input.slug);
  if (!course || course.id !== input.courseId) return { ok: false, error: "Curso no encontrado." };
  const lesson = flatLessons(course).find((l) => l.id === input.lessonId);
  if (!lesson) return { ok: false, error: "Lección no encontrada." };
  if (!(await getEnrollment(course.id, me.key)) && !lesson.freePreview) return { ok: false, error: "Inscríbase al curso para usar el Studio." };

  // Si otra persona ya los generó, se devuelven sin gastar nada.
  const ya = await leerMateriales(course.id, lesson.id);
  const hay = input.scope === "leccion" ? ya.leccion : ya.curso;
  if (hay) return { ok: true, contenido: hay };

  if (!(await proveedorActivo("gemini"))) return { ok: false, error: "Los materiales de este curso aún no están disponibles." };
  const db = adminDb();
  if (db) {
    const { count } = await db.from("lms_ai_log").select("id", { count: "exact", head: true }).eq("user_key", me.key).gte("created_at", new Date(Date.now() - 3600_000).toISOString());
    if ((count ?? 0) >= POR_HORA) return { ok: false, error: "Llegó al límite de usos por ahora. Intente de nuevo en un rato." };
  }
  const r = input.scope === "leccion" ? await generarLeccion(course, lesson.id) : await generarCurso(course);
  // El estudiante no necesita saber de migraciones: si falta la tabla, solo se le dice que aún no están.
  if (!r.ok) return { ok: false, error: /014-studio/.test(r.error) ? "Los materiales de este curso aún no están disponibles." : r.error };
  await db?.from("lms_ai_log").insert({ user_key: me.key, course_id: course.id, lesson_id: lesson.id });
  return { ok: true, contenido: r.contenido };
}

// ---------- Administración ----------

// Generar con IA gasta cupo del proveedor: solo administradores.
async function admin() {
  const s = await auth();
  return s?.user && hasAnyRole(s.user.roles, [ROLES.portalAdmin]) ? (s.user.email ?? s.user.name ?? "admin") : null;
}

export async function avanceStudio(): Promise<EstadoStudio | null> {
  if (!(await admin())) return null;
  return (await colaStudio()).estado;
}

export type ResultadoStudio = { ok: boolean; message?: string; hechos: string[]; errores: { clave: string; titulo: string; error: string }[]; estado?: EstadoStudio };

/** Genera los materiales que faltan, de dos en dos (cada uno son tres llamadas al modelo en paralelo). El panel la repite hasta que no quede nada. */
export async function generarFaltantes(omitir: string[] = []): Promise<ResultadoStudio> {
  if (!(await admin())) return { ok: false, message: "Solo los administradores del portal pueden generar los materiales.", hechos: [], errores: [] };
  const { estado, pendientes } = await colaStudio(omitir.slice(0, 400));
  if (!estado.iaLista) return { ok: false, message: "Falta cargar una clave de Gemini en Conexiones.", hechos: [], errores: [], estado };
  if (!estado.tablaLista) return { ok: false, message: "Falta crear la tabla de materiales: ejecute docs/migraciones/014-studio.sql en Supabase.", hechos: [], errores: [], estado };
  const lote = pendientes.slice(0, 2);
  const hechos: string[] = [];
  const errores: ResultadoStudio["errores"] = [];
  await Promise.all(
    lote.map(async (x) => {
      const curso = await getCourse(x.slug);
      if (!curso) return void errores.push({ clave: x.clave, titulo: x.titulo, error: "Curso no encontrado." });
      const r = x.tipo === "leccion" && x.lessonId ? await generarLeccion(curso, x.lessonId) : await generarCurso(curso);
      if (r.ok) hechos.push(x.titulo);
      else errores.push({ clave: x.clave, titulo: x.titulo, error: r.error });
    }),
  );
  return { ok: true, hechos, errores, estado: (await colaStudio(omitir)).estado };
}
