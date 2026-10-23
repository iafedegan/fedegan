import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, BookOpenCheck, CheckCircle2, Clock, GraduationCap, IdCard, PlayCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ensureStudent, getLearner, getMyCourses, getStudentStats } from "@/lib/lms/queries";

export const metadata: Metadata = { title: "Mi perfil de estudiante", robots: { index: false } };

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ inscrito?: string }> }) {
  const me = await getLearner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/perfil")}`);
  const { inscrito } = await searchParams;
  const [mine, student, stats] = await Promise.all([getMyCourses(me.key), ensureStudent(me), getStudentStats(me.key)]);
  const initials = me.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const lessonsDone = mine.reduce((a, m) => a + m.done, 0);
  const watched = mine.reduce((a, m) => a + Math.round((m.course.minutes * m.percent) / 100), 0);
  const certs = mine.filter((m) => m.completedAt && m.course.certificate);
  const inProgress = mine.filter((m) => !m.completedAt);
  const next = inProgress.sort((a, b) => b.percent - a.percent)[0];
  const welcome = inscrito ? mine.find((m) => m.course.slug === inscrito) : undefined;
  const since = student ? new Date(student.since).toLocaleDateString("es-CO", { month: "long", year: "numeric" }) : "";

  return (
    <>
      <section className="border-b border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fg-green-800)_28%,var(--bg)),var(--bg))]">
        <Container className="flex flex-wrap items-center gap-6 py-8 sm:py-10">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[var(--fg-lime-500)] bg-[var(--surface-solid)] font-[var(--font-display)] text-3xl font-bold text-[var(--fg-lime-400)]">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">Escuela Virtual · Estudiante</p>
            <h1 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">{me.name}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{me.key}{student && <> · Carnet <b className="font-mono text-[var(--text)]">{student.code}</b></>}{since && <> · Desde {since}</>}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/escuela-virtual/carnet" className="inline-flex items-center gap-2 rounded-[0.25rem] border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:border-[var(--fg-lime-500)]"><IdCard size={16} /> Mi carnet</Link>
            <Link href="/escuela-virtual" className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]"><GraduationCap size={16} /> Ver más cursos</Link>
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-10 py-8 sm:py-10">
        {welcome && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--fg-lime-500)] bg-[rgba(216,181,88,0.08)] p-5">
            <p className="flex items-center gap-3 font-semibold text-[var(--text)]"><CheckCircle2 className="text-[var(--fg-lime-500)]" /> ¡Listo! Ya está inscrito en «{welcome.course.title}».</p>
            <Link href={`/escuela-virtual/${welcome.course.slug}/aula`} className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11]"><PlayCircle size={16} /> Empezar ahora</Link>
          </div>
        )}

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [BookOpenCheck, "Cursos inscritos", stats.enrolled],
            [CheckCircle2, "Lecciones completadas", lessonsDone],
            [Clock, "Tiempo de estudio", watched ? fmtMin(watched) : "—"],
            [Award, "Certificados", stats.certificates],
          ].map(([Icon, label, value]) => {
            const I = Icon as typeof Award;
            return (
              <div key={String(label)} className="mx-stat">
                <I size={20} className="text-[var(--fg-lime-500)]" />
                <b>{String(value)}</b>
                <span>{String(label)}</span>
              </div>
            );
          })}
        </dl>

        {next && (
          <section aria-labelledby="seguir" className="mx-card flex flex-wrap items-center gap-5 !p-5">
            <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-[0.5rem]">{next.course.cover && <Image src={next.course.cover} alt="" fill sizes="10rem" className="object-cover" />}</div>
            <div className="min-w-0 flex-1 basis-60">
              <p id="seguir" className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">Continúe donde iba</p>
              <p className="mt-1 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{next.course.title}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full bg-[var(--fg-lime-500)]" style={{ width: `${next.percent}%` }} /></div>
              <p className="mt-1.5 text-xs text-[var(--text-faint)]">{next.done} de {next.course.lessons} lecciones · {next.percent} %</p>
            </div>
            <Link href={`/escuela-virtual/${next.course.slug}/aula`} className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]"><PlayCircle size={16} /> {next.done ? "Continuar" : "Empezar"}</Link>
          </section>
        )}

        <section aria-labelledby="mis-cursos">
          <h2 id="mis-cursos" className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Mis cursos</h2>
          {mine.length === 0 ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-10 text-center">
              <p className="text-[var(--text-muted)]">Todavía no se ha inscrito a ningún curso.</p>
              <Link href="/escuela-virtual" className="mt-3 inline-block font-bold text-[var(--fg-lime-400)] hover:underline">Explorar los cursos →</Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-5 md:grid-cols-2">
              {mine.map(({ course, percent, done, completedAt, code }) => (
                <li key={course.id} className="mx-card flex gap-4 !p-4">
                  <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-[0.5rem]">{course.cover && <Image src={course.cover} alt="" fill sizes="9rem" className="object-cover" />}</div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Link href={`/escuela-virtual/${course.slug}/aula`} className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)] hover:text-[var(--fg-lime-400)]">{course.title}</Link>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full bg-[var(--fg-lime-500)]" style={{ width: `${percent}%` }} /></div>
                    <p className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--text-faint)]">{done} de {course.lessons} lecciones · {percent} %
                      {completedAt && <span className="font-bold text-[var(--fg-lime-400)]">Terminado</span>}
                    </p>
                    {completedAt && code && course.certificate && <Link href={`/escuela-virtual/${course.slug}/certificado`} className="inline-flex items-center gap-1 text-xs font-bold text-[var(--fg-lime-400)] hover:underline"><Award size={13} /> Ver certificado</Link>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="certificados">
          <h2 id="certificados" className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Mis certificados</h2>
          {certs.length === 0 ? (
            <p className="mt-3 text-[var(--text-muted)]">Termine un curso y apruebe su evaluación para obtener su certificado.</p>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {certs.map(({ course, code, completedAt }) => (
                <li key={course.id} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border-strong)] p-4">
                  <Award size={28} className="shrink-0 text-[var(--fg-lime-500)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--text)]">{course.title}</p>
                    <p className="text-xs text-[var(--text-faint)]">{completedAt && new Date(completedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })} · <span className="font-mono">{code}</span></p>
                  </div>
                  <Link href={`/escuela-virtual/${course.slug}/certificado`} className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:underline">Ver</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </>
  );
}
