import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BarChart3, Check, ChevronRight, Clock, ExternalLink, FileText, HelpCircle, Infinity as Forever, Lock, PlayCircle, Star, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LEVELS, flatLessons, getCourse, getEnrollment, getLearner, getProgress, getReviews, videoEmbed } from "@/lib/lms/queries";
import { enroll, submitReview } from "@/lib/lms/actions";

type P = { slug: string };

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const c = await getCourse((await params).slug);
  return c ? { title: c.title, description: c.subtitle, alternates: { canonical: `/escuela-virtual/${c.slug}` } } : { title: "Curso" };
}

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
const ICON = { video: PlayCircle, lectura: FileText, quiz: HelpCircle } as const;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= Math.round(value) ? "fill-[var(--fg-lime-500)] text-[var(--fg-lime-500)]" : "text-[var(--border-strong)]"} />)}
    </span>
  );
}

export default async function CoursePage({ params, searchParams }: { params: Promise<P>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params;
  const { error } = await searchParams;
  const course = await getCourse(slug);
  if (!course) notFound();
  const me = await getLearner();
  const [enrollment, progress, reviews] = await Promise.all([me ? getEnrollment(course.id, me.key) : null, me ? getProgress(course.id, me.key) : new Map(), getReviews(course.id)]);
  const lessons = flatLessons(course);
  const done = lessons.filter((l) => progress.has(l.id)).length;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const hasContent = lessons.length > 0;
  const promo = course.promoVideo ? videoEmbed(course.promoVideo) : null;
  const mine = me ? reviews.find((r) => r.name === me.name) : null;

  const cta = course.externalUrl && !hasContent ? (
    <a href={course.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
      Ir al curso <ExternalLink size={16} />
    </a>
  ) : !hasContent ? (
    <p className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] p-3 text-center text-sm text-[var(--text-muted)]">Contenido en preparación.</p>
  ) : enrollment ? (
    <Link href={`/escuela-virtual/${course.slug}/aula`} className="inline-flex w-full items-center justify-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
      {percent === 0 ? "Empezar el curso" : percent === 100 ? "Repasar el curso" : "Continuar donde iba"} <ChevronRight size={16} />
    </Link>
  ) : (
    <form action={enroll}>
      <input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="slug" value={course.slug} />
      <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
        {me ? "Inscribirme gratis" : "Ingresar e inscribirme"}
      </button>
    </form>
  );

  return (
    <>
      <section className="border-b border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fg-green-800)_28%,var(--bg)),var(--bg))]">
        <Container className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <div className="flex flex-col gap-4">
            <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--fg-lime-400)]">Inicio</Link><ChevronRight size={12} />
              <Link href="/escuela-virtual" className="hover:text-[var(--fg-lime-400)]">Escuela Virtual</Link><ChevronRight size={12} />
              <span className="font-semibold text-[var(--text)]">{course.category}</span>
            </nav>
            <h1 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">{course.title}</h1>
            {course.subtitle && <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">{course.subtitle}</p>}
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--text-muted)]">
              {course.ratings > 0 && <li className="flex items-center gap-2"><b className="text-[var(--fg-lime-400)]">{course.rating.toFixed(1)}</b><Stars value={course.rating} /><span>({course.ratings})</span></li>}
              <li className="flex items-center gap-1.5"><BarChart3 size={15} /> {LEVELS[course.level]}</li>
              {(lessons.length > 0 || course.externalVideos > 0) && <li className="flex items-center gap-1.5"><PlayCircle size={15} /> {lessons.length || course.externalVideos} {lessons.length ? "lecciones" : "videos"}</li>}
              {course.minutes > 0 && <li className="flex items-center gap-1.5"><Clock size={15} /> {fmtMin(course.minutes)}</li>}
            </ul>
            {course.instructor && <p className="text-sm text-[var(--text-muted)]">Instructor: <b className="text-[var(--text)]">{course.instructor}</b></p>}
            {enrollment && hasContent && (
              <div className="max-w-md" aria-label={`Avance ${percent} %`}>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full bg-[var(--fg-lime-500)]" style={{ width: `${percent}%` }} /></div>
                <p className="mt-1.5 text-xs text-[var(--text-faint)]">{done} de {lessons.length} lecciones · {percent} %</p>
              </div>
            )}
          </div>

          <aside className="lg:row-span-1">
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] shadow-[var(--shadow-lg)] lg:sticky lg:top-28">
              {promo ? (
                <div className="aspect-video bg-black">
                  {promo.type === "iframe" ? <iframe src={promo.src} title="Presentación del curso" allowFullScreen loading="lazy" className="h-full w-full" /> : <video src={promo.src} controls className="h-full w-full" />}
                </div>
              ) : course.cover ? (
                <div className="relative aspect-video"><Image src={course.cover} alt="" fill sizes="22rem" className="object-cover" /></div>
              ) : null}
              <div className="flex flex-col gap-4 p-5">
                {error && <p role="alert" className="rounded-[0.25rem] border border-[#f0b5b5] bg-[#fdecec] px-3 py-2 text-sm text-[#7a1f1f]">{error}</p>}
                {cta}
                <ul className="flex flex-col gap-2.5 text-sm text-[var(--text-muted)]">
                  <li className="flex items-center gap-2.5"><Forever size={16} className="text-[var(--fg-lime-500)]" /> Gratis, a su ritmo y de por vida</li>
                  {course.certificate && <li className="flex items-center gap-2.5"><Award size={16} className="text-[var(--fg-lime-500)]" /> Certificado al terminar</li>}
                  <li className="flex items-center gap-2.5"><Users size={16} className="text-[var(--fg-lime-500)]" /> Para productores, técnicos y estudiantes</li>
                </ul>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      <Container className="grid gap-12 py-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-12">
          {course.learnPoints.length > 0 && (
            <section>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Lo que aprenderá</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] p-6 sm:grid-cols-2">
                {course.learnPoints.map((p) => <li key={p} className="flex items-start gap-3 text-[var(--text-muted)]"><Check size={18} className="mt-0.5 shrink-0 text-[var(--fg-lime-500)]" />{p}</li>)}
              </ul>
            </section>
          )}

          {course.modules.length > 0 && (
            <section>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Contenido del curso</h2>
              <p className="mt-1 text-sm text-[var(--text-faint)]">{course.modules.length} módulos · {lessons.length} lecciones{course.minutes ? ` · ${fmtMin(course.minutes)}` : ""}</p>
              <div className="mt-4 flex flex-col gap-3">
                {course.modules.map((m, i) => (
                  <details key={m.id} open={i === 0} className="group rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                      <span className="font-semibold text-[var(--text)]"><span className="mr-2 font-mono text-xs text-[var(--fg-lime-500)]">{String(i + 1).padStart(2, "0")}</span>{m.title}</span>
                      <span className="shrink-0 text-xs text-[var(--text-faint)]">{m.lessons.length} lecciones</span>
                    </summary>
                    <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {m.lessons.map((l) => {
                        const I = ICON[l.kind];
                        const open = Boolean(enrollment) || l.freePreview;
                        return (
                          <li key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                            {progress.has(l.id) ? <Check size={16} className="shrink-0 text-[var(--fg-lime-500)]" /> : <I size={16} className="shrink-0 text-[var(--text-faint)]" />}
                            {open && hasContent ? <Link href={`/escuela-virtual/${course.slug}/aula/${l.id}`} className="min-w-0 flex-1 text-[var(--text)] hover:text-[var(--fg-lime-400)]">{l.title}</Link> : <span className="min-w-0 flex-1 text-[var(--text-muted)]">{l.title}</span>}
                            {l.freePreview && !enrollment && <span className="rounded-full border border-[var(--fg-lime-500)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-lime-400)]">Vista previa</span>}
                            {!open && <Lock size={13} className="text-[var(--text-faint)]" />}
                            {l.minutes > 0 && <span className="shrink-0 text-xs text-[var(--text-faint)]">{l.minutes} min</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          {course.requirements.length > 0 && (
            <section>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Requisitos</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[var(--text-muted)]">{course.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
          )}

          {course.description && (
            <section>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Descripción</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-[var(--text-muted)]">{course.description.split(/\n{2,}/).map((p) => <p key={p}>{p}</p>)}</div>
            </section>
          )}

          {course.instructor && (
            <section>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Instructor</h2>
              <div className="mt-3 flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--fg-lime-500)] font-[var(--font-display)] text-xl font-bold text-[#0a1a11]">{course.instructor.replace(/^((M\.V\.|Esp\.|Dr\.|Dra\.|Ing\.)\s*)+/, "").slice(0, 1)}</span>
                <div><p className="font-semibold text-[var(--text)]">{course.instructor}</p>{course.instructorBio && <p className="mt-1 leading-relaxed text-[var(--text-muted)]">{course.instructorBio}</p>}</div>
              </div>
            </section>
          )}

          <section id="valoraciones">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Valoraciones</h2>
            {course.ratings > 0 ? <p className="mt-1 flex items-center gap-2 text-[var(--text-muted)]"><b className="text-2xl text-[var(--fg-lime-400)]">{course.rating.toFixed(1)}</b><Stars value={course.rating} size={18} /> {course.ratings} {course.ratings === 1 ? "valoración" : "valoraciones"}</p> : <p className="mt-1 text-[var(--text-muted)]">Aún no hay valoraciones.</p>}
            {enrollment && hasContent && (
              <form action={submitReview} className="mt-4 flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] p-5">
                <input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="slug" value={course.slug} />
                <fieldset className="flex flex-wrap items-center gap-2"><legend className="mb-1 text-sm font-semibold text-[var(--text)]">{mine ? "Actualice su valoración" : "Valore este curso"}</legend>
                  {[5, 4, 3, 2, 1].map((n) => <label key={n} className="cursor-pointer text-sm text-[var(--text-muted)]"><input type="radio" name="rating" value={n} required defaultChecked={mine?.rating === n} className="mr-1 accent-[var(--fg-lime-500)]" />{n} ★</label>)}
                </fieldset>
                <textarea name="comment" rows={3} maxLength={600} placeholder="Cuéntenos qué le pareció (opcional)" defaultValue={mine?.comment} className="rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] p-3 text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]" />
                <button type="submit" className="self-start rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">Enviar valoración</button>
              </form>
            )}
            <ul className="mt-5 flex flex-col gap-4">
              {reviews.filter((r) => r.comment).map((r) => (
                <li key={r.at + r.name} className="border-b border-[var(--border)] pb-4">
                  <p className="flex items-center gap-2 text-sm"><b className="text-[var(--text)]">{r.name}</b><Stars value={r.rating} size={13} /></p>
                  <p className="mt-1 text-[var(--text-muted)]">{r.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
