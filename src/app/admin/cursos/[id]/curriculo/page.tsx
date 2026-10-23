import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, ChevronRight, ExternalLink, FileText, HelpCircle, PlayCircle, Plus } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { CourseTabs } from "@/components/admin/CourseTabs";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { adminDb, readDb } from "@/lib/cms/client";
import { deleteLesson, deleteModule, deleteQuestion, moveLesson, moveModule, saveLesson, saveModule, saveQuestion } from "@/lib/lms/actions";

export const metadata: Metadata = { title: "Currículo del curso", robots: { index: false } };

type Row = Record<string, unknown>;
const KIND = { video: { label: "Video", icon: PlayCircle }, lectura: { label: "Lectura", icon: FileText }, quiz: { label: "Evaluación", icon: HelpCircle } } as const;

function Hidden({ course, id, moduleId }: { course: string; id?: string; moduleId?: string }) {
  return (
    <>
      <input type="hidden" name="course_id" value={course} />
      {id && <input type="hidden" name="id" value={id} />}
      {moduleId && <input type="hidden" name="module_id" value={moduleId} />}
    </>
  );
}

function LessonFields({ l }: { l?: Row }) {
  const v = (k: string) => (l?.[k] == null ? "" : String(l[k]));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Título
        <input name="title" required maxLength={140} defaultValue={v("title")} className="ad-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Tipo
        <select name="kind" defaultValue={v("kind") || "video"} className="ad-input">
          <option value="video">Video</option>
          <option value="lectura">Lectura</option>
          <option value="quiz">Evaluación (preguntas)</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Duración (minutos)
        <input name="duration_minutes" type="number" min={0} defaultValue={v("duration_minutes") || "0"} className="ad-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Dirección del video (YouTube, Vimeo o archivo)
        <input name="video_url" placeholder="https://www.youtube.com/watch?v=…" defaultValue={v("video_url")} className="ad-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Contenido o notas de la lección
        <textarea name="content" rows={5} maxLength={20000} defaultValue={v("content")} className="ad-input resize-y" placeholder="Texto de la lectura o resumen del video. Una línea en blanco separa los párrafos." />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Recurso descargable (enlace)
        <input name="resource_url" placeholder="https://…/guia.pdf" defaultValue={v("resource_url")} className="ad-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Nombre del recurso
        <input name="resource_label" maxLength={80} defaultValue={v("resource_label")} placeholder="Guía en PDF" className="ad-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Nota mínima de la evaluación (%)
        <input name="pass_score" type="number" min={1} max={100} defaultValue={v("pass_score") || "70"} className="ad-input" />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold">
        <input type="checkbox" name="free_preview" defaultChecked={l?.free_preview === true} className="h-4 w-4 accent-[#165a43]" /> Vista previa gratuita (visible sin inscripción)
      </label>
    </div>
  );
}

export default async function CurriculumPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { db, writable } = readDb();
  if (!db) notFound();
  const { data: course } = await db.from("lms_courses").select("id,title,slug,external_url").eq("id", id).maybeSingle();
  if (!course) notFound();
  const [{ data: ms }, { data: ls }] = await Promise.all([
    db.from("lms_modules").select("*").eq("course_id", id).order("sort_order", { ascending: true }),
    db.from("lms_lessons").select("*").eq("course_id", id).order("sort_order", { ascending: true }),
  ]);
  const modules = (ms ?? []) as Row[];
  const lessons = (ls ?? []) as Row[];
  const adm = adminDb();
  const { data: qs } = adm ? await adm.from("lms_quiz_questions").select("*").in("lesson_id", lessons.map((l) => l.id as string)).order("sort_order", { ascending: true }) : { data: [] };
  const questions = (qs ?? []) as Row[];
  const totalMin = lessons.reduce((a, l) => a + (Number(l.duration_minutes) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
          <Link href="/admin/cursos" className="hover:text-[#165a43]">Cursos</Link><ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Currículo</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{String(course.title)}</h1>
        <p className="mt-1.5 text-[#5d6e65]">{modules.length} módulos · {lessons.length} lecciones · {Math.floor(totalMin / 60)} h {totalMin % 60} min</p>
      </header>
      <CourseTabs id={id} active="curriculo" />

      {ok && <p role="status" className="flex items-center gap-2 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-3 text-sm text-[#14573a]"><CheckCircle2 size={18} /> {ok}.</p>}
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]"><AlertCircle size={18} /> {error}</p>}
      {!writable && <ConfigNotice compact />}
      {course.external_url && (
        <p className="flex items-start gap-2 rounded-xl border border-[#e8d9a8] bg-[#fbf5de] px-4 py-3 text-sm text-[#6b5518]">
          <ExternalLink size={18} className="mt-0.5 shrink-0" /> Este curso tiene un enlace externo ({String(course.external_url)}): el sitio abre esa plataforma. Para usar el aula propia, vacíe «Enlace externo» en la pestaña Información.
        </p>
      )}

      <div className="flex flex-col gap-5">
        {modules.map((m, mi) => {
          const mid = m.id as string;
          const mls = lessons.filter((l) => l.module_id === mid);
          return (
            <section key={mid} className="ad-card overflow-hidden">
              <div className="flex flex-wrap items-start gap-3 border-b border-[#eceae0] bg-[#faf9f4] p-4 sm:p-5">
                <span className="font-[var(--font-display)] text-2xl font-bold text-[#b08f4f]">{String(mi + 1).padStart(2, "0")}</span>
                <form action={saveModule} className="flex min-w-0 flex-1 basis-72 flex-col gap-2 sm:flex-row sm:items-end">
                  <Hidden course={id} id={mid} />
                  <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Módulo
                    <input name="title" required maxLength={120} defaultValue={String(m.title)} className="ad-input font-semibold" />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Resumen
                    <input name="summary" maxLength={300} defaultValue={String(m.summary ?? "")} className="ad-input" />
                  </label>
                  <button type="submit" disabled={!writable} className="ad-btn ad-btn-primary">Guardar</button>
                </form>
                <div className="flex items-center gap-1.5">
                  <form action={moveModule}><Hidden course={id} id={mid} /><input type="hidden" name="dir" value="up" /><button type="submit" aria-label="Subir módulo" disabled={!writable || mi === 0} className="ad-icon-btn"><ArrowUp size={16} /></button></form>
                  <form action={moveModule}><Hidden course={id} id={mid} /><input type="hidden" name="dir" value="down" /><button type="submit" aria-label="Bajar módulo" disabled={!writable || mi === modules.length - 1} className="ad-icon-btn"><ArrowDown size={16} /></button></form>
                  <form action={deleteModule}><Hidden course={id} id={mid} /><DeleteButton label={`módulo ${String(m.title)} y sus lecciones`} disabled={!writable} /></form>
                </div>
              </div>

              <ul className="divide-y divide-[#eceae0]">
                {mls.map((l, li) => {
                  const lid = l.id as string;
                  const K = KIND[(l.kind as keyof typeof KIND) ?? "video"] ?? KIND.video;
                  const qsl = questions.filter((q) => q.lesson_id === lid);
                  return (
                    <li key={lid} className="px-4 py-3 sm:px-5">
                      <details>
                        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
                          <K.icon size={18} className="shrink-0 text-[#165a43]" />
                          <span className="min-w-0 flex-1 basis-56 font-semibold">{String(l.title)}</span>
                          <span className="ad-pill ad-pill-off">{K.label}</span>
                          {l.free_preview === true && <span className="ad-pill ad-pill-ok">Vista previa</span>}
                          {l.kind === "quiz" && <span className="text-xs text-[#8a978f]">{qsl.length} preguntas</span>}
                          <span className="text-xs text-[#8a978f]">{Number(l.duration_minutes) || 0} min</span>
                        </summary>
                        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#e4e2d6] bg-white p-4">
                          <form action={saveLesson} className="flex flex-col gap-4">
                            <Hidden course={id} id={lid} moduleId={mid} />
                            <LessonFields l={l} />
                            <button type="submit" disabled={!writable} className="ad-btn ad-btn-primary self-start">Guardar lección</button>
                          </form>
                          <div className="flex items-center gap-2 border-t border-[#eceae0] pt-3">
                            <form action={moveLesson}><Hidden course={id} id={lid} moduleId={mid} /><input type="hidden" name="dir" value="up" /><button type="submit" aria-label="Subir lección" disabled={!writable || li === 0} className="ad-icon-btn"><ArrowUp size={16} /></button></form>
                            <form action={moveLesson}><Hidden course={id} id={lid} moduleId={mid} /><input type="hidden" name="dir" value="down" /><button type="submit" aria-label="Bajar lección" disabled={!writable || li === mls.length - 1} className="ad-icon-btn"><ArrowDown size={16} /></button></form>
                            <form action={deleteLesson}><Hidden course={id} id={lid} /><DeleteButton label={String(l.title)} disabled={!writable} /></form>
                          </div>

                          {l.kind === "quiz" && (
                            <div className="flex flex-col gap-3 border-t border-[#eceae0] pt-4">
                              <h3 className="font-semibold">Preguntas de la evaluación</h3>
                              {qsl.map((q, qi) => (
                                <div key={q.id as string} className="rounded-lg border border-[#e4e2d6] p-3 text-sm">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="font-semibold">{qi + 1}. {String(q.question)}</p>
                                    <form action={deleteQuestion}><Hidden course={id} id={q.id as string} /><DeleteButton label="esta pregunta" disabled={!writable} /></form>
                                  </div>
                                  <ol className="mt-2 list-[upper-alpha] pl-6 text-[#5d6e65]">
                                    {(q.options as string[]).map((o, oi) => (
                                      <li key={oi} className={oi === q.correct_index ? "font-semibold text-[#165a43]" : ""}>{o}{oi === q.correct_index ? " ✓" : ""}</li>
                                    ))}
                                  </ol>
                                </div>
                              ))}
                              <form action={saveQuestion} className="grid gap-2 rounded-lg bg-[#faf9f4] p-3 sm:grid-cols-2">
                                <input type="hidden" name="course_id" value={id} /><input type="hidden" name="lesson_id" value={lid} />
                                <input name="question" required maxLength={400} placeholder="Enunciado de la pregunta" className="ad-input sm:col-span-2" />
                                {[0, 1, 2, 3].map((i) => <input key={i} name={`option_${i}`} maxLength={200} placeholder={`Opción ${"ABCD"[i]}${i > 1 ? " (opcional)" : ""}`} className="ad-input" />)}
                                <label className="flex items-center gap-2 text-sm font-semibold">Respuesta correcta
                                  <select name="correct_index" className="ad-input !w-auto"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>
                                </label>
                                <input name="explanation" maxLength={400} placeholder="Explicación (se muestra si falla)" className="ad-input" />
                                <button type="submit" disabled={!writable} className="ad-btn ad-btn-gold sm:col-span-2 sm:justify-self-start"><Plus size={16} /> Agregar pregunta</button>
                              </form>
                            </div>
                          )}
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>

              <details className="border-t border-[#eceae0] px-4 py-3 sm:px-5">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#165a43]"><Plus size={16} /> Agregar lección a este módulo</summary>
                <form action={saveLesson} className="mt-4 flex flex-col gap-4 rounded-xl border border-[#e4e2d6] bg-white p-4">
                  <Hidden course={id} moduleId={mid} />
                  <LessonFields />
                  <button type="submit" disabled={!writable} className="ad-btn ad-btn-primary self-start">Crear lección</button>
                </form>
              </details>
            </section>
          );
        })}
      </div>

      <form action={saveModule} className="ad-card flex flex-wrap items-end gap-3 p-4 sm:p-5">
        <Hidden course={id} />
        <label className="flex min-w-0 flex-1 basis-60 flex-col gap-1 text-sm font-semibold">Nuevo módulo
          <input name="title" required maxLength={120} placeholder="Ej.: Introducción al manejo de praderas" className="ad-input" />
        </label>
        <label className="flex min-w-0 flex-1 basis-60 flex-col gap-1 text-sm font-semibold">Resumen (opcional)
          <input name="summary" maxLength={300} className="ad-input" />
        </label>
        <button type="submit" disabled={!writable} className="ad-btn ad-btn-gold"><Plus size={16} /> Agregar módulo</button>
      </form>
    </div>
  );
}
