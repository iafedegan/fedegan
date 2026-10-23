import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Award, Check, ChevronLeft, ChevronRight, Download, FileText, HelpCircle, PartyPopper, PlayCircle, Sparkles } from "lucide-react";
import { CourseAssistant, OpenAssistantLink } from "@/components/lms/CourseAssistant";
import { QuizForm } from "@/components/lms/QuizForm";
import { completeLesson } from "@/lib/lms/actions";
import { flatLessons, getCourse, getEnrollment, getLearner, getProgress, getQuiz, videoEmbed } from "@/lib/lms/queries";

export const metadata: Metadata = { title: "Aula", robots: { index: false } };
const ICON = { video: PlayCircle, lectura: FileText, quiz: HelpCircle } as const;

export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string; lessonId: string }>; searchParams: Promise<{ fin?: string }> }) {
  const { slug, lessonId } = await params;
  const { fin } = await searchParams;
  const course = await getCourse(slug);
  if (!course) notFound();
  const lessons = flatLessons(course);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const lesson = lessons[idx];
  const me = await getLearner();
  const enrollment = me ? await getEnrollment(course.id, me.key) : null;
  if (!enrollment && !lesson.freePreview) redirect(me ? `/escuela-virtual/${slug}` : `/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent(`/escuela-virtual/${slug}/aula/${lessonId}`)}`);

  const progress = me ? await getProgress(course.id, me.key) : new Map<string, number | null>();
  const done = progress.has(lesson.id);
  const percent = lessons.length ? Math.round((lessons.filter((l) => progress.has(l.id)).length / lessons.length) * 100) : 0;
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const video = lesson.videoUrl ? videoEmbed(lesson.videoUrl) : null;
  const questions = lesson.kind === "quiz" && enrollment ? await getQuiz(lesson.id) : [];
  const finished = Boolean(enrollment?.completedAt);

  return (
    <div className="mx-auto grid w-full max-w-[96rem] gap-0 lg:grid-cols-[1fr_24rem]">
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-8">
          <Link href={`/escuela-virtual/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]"><ChevronLeft size={16} /> {course.title}</Link>
          {enrollment && (
            <div className="flex items-center gap-4 text-xs text-[var(--text-faint)]" aria-label={`Avance ${percent} %`}>
              <span className="h-2 w-40 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full bg-[var(--fg-lime-500)]" style={{ width: `${percent}%` }} /></span>{percent} %
              <OpenAssistantLink />
              <Link href="/escuela-virtual/perfil" className="font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:underline">Mi perfil</Link>
            </div>
          )}
        </div>

        {video && (
          <div className="aspect-video w-full bg-black">
            {video.type === "iframe" ? <iframe src={video.src} title={lesson.title} allowFullScreen loading="lazy" className="h-full w-full" /> : <video src={video.src} controls className="h-full w-full" />}
          </div>
        )}

        <div className="flex flex-col gap-6 px-4 py-8 sm:px-8">
          {(fin || finished) && enrollment && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--fg-lime-500)] bg-[rgba(216,181,88,0.08)] p-5">
              <p className="flex items-center gap-3 font-semibold text-[var(--text)]"><PartyPopper className="text-[var(--fg-lime-500)]" /> ¡Terminó el curso!</p>
              {course.certificate && <Link href={`/escuela-virtual/${slug}/certificado`} className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11]"><Award size={16} /> Ver mi certificado</Link>}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-500)]">Lección {idx + 1} de {lessons.length}</p>
            <h1 className="mt-1 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)]">{lesson.title}</h1>
          </div>
          {lesson.content && <div className="max-w-3xl space-y-4 text-[1.02rem] leading-relaxed text-[var(--text-muted)]">{lesson.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
          {lesson.resourceUrl && (
            <a href={lesson.resourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-[0.25rem] border border-[var(--border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--fg-lime-500)]"><Download size={16} /> {lesson.resourceLabel || "Descargar recurso"}</a>
          )}

          {lesson.kind === "quiz" && enrollment && (questions.length ? <QuizForm courseId={course.id} lessonId={lesson.id} slug={slug} questions={questions} passScore={lesson.passScore} done={done} /> : <p className="text-[var(--text-muted)]">Esta evaluación aún no tiene preguntas.</p>)}

          {me && (enrollment || lesson.freePreview) && (
            <CourseAssistant courseId={course.id} lessonId={lesson.id} slug={slug} lessonTitle={lesson.title} sources={lessons.map((l, i) => ({ n: i + 1, title: l.title, current: l.id === lesson.id }))} enabled={Boolean(process.env.GEMINI_API_KEY)} />
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            {prev && <Link href={`/escuela-virtual/${slug}/aula/${prev.id}`} className="inline-flex items-center gap-1.5 rounded-[0.25rem] border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--text)]"><ChevronLeft size={15} /> Anterior</Link>}
            {enrollment && lesson.kind !== "quiz" && (
              <form action={completeLesson}>
                <input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="lesson_id" value={lesson.id} /><input type="hidden" name="slug" value={slug} /><input type="hidden" name="next" value={next?.id ?? ""} />
                <button type="submit" className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
                  <Check size={15} /> {done ? "Ya completada · continuar" : next ? "Completar y continuar" : "Completar el curso"}
                </button>
              </form>
            )}
            {next && (done || lesson.kind === "quiz" || !enrollment) && <Link href={`/escuela-virtual/${slug}/aula/${next.id}`} className="inline-flex items-center gap-1.5 rounded-[0.25rem] border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--text)]">Siguiente <ChevronRight size={15} /></Link>}
          </div>
        </div>
      </div>

      <aside className="border-t border-[var(--border)] lg:border-l lg:border-t-0">
        <div className="lg:sticky lg:top-16 lg:max-h-[calc(100svh-4rem)] lg:overflow-y-auto">
          <p className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Contenido del curso</p>
          {course.modules.map((m, mi) => (
            <details key={m.id} open={m.lessons.some((l) => l.id === lesson.id) || mi === 0} className="border-t border-[var(--border)]">
              <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-semibold text-[var(--text)]"><span className="mr-2 font-mono text-xs text-[var(--fg-lime-500)]">{String(mi + 1).padStart(2, "0")}</span>{m.title}</summary>
              <ul>
                {m.lessons.map((l) => {
                  const I = ICON[l.kind];
                  const current = l.id === lesson.id;
                  return (
                    <li key={l.id}>
                      <Link href={`/escuela-virtual/${slug}/aula/${l.id}`} aria-current={current ? "page" : undefined} className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${current ? "bg-[rgba(216,181,88,0.12)] text-[var(--text)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"}`}>
                        {progress.has(l.id) ? <Check size={15} className="shrink-0 text-[var(--fg-lime-500)]" /> : <I size={15} className="shrink-0 text-[var(--text-faint)]" />}
                        <span className="min-w-0 flex-1">{l.title}</span>
                        {l.minutes > 0 && <span className="shrink-0 text-xs text-[var(--text-faint)]">{l.minutes} min</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </aside>
    </div>
  );
}
