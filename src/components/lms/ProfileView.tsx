import Image from "next/image";
import Link from "next/link";
import { Award, BookOpenCheck, CheckCircle2, Clock, GraduationCap, IdCard, Mail, PlayCircle, Printer, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PrintButton } from "@/components/lms/PrintButton";
import { StudentCard } from "@/components/lms/StudentCard";
import { linkedinAddUrl, linkedinShareUrl } from "@/lib/lms/linkedin";
import { LEVELS, type Course } from "@/lib/lms/queries-types";

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.25rem] px-5 text-[0.74rem] font-bold uppercase tracking-[0.1em] transition-colors";
const btnPrimary = `${btn} bg-[var(--fg-lime-500)] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]`;
const btnGhost = `${btn} border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-lime-400)]`;

export type ProfileData = {
  me: { name: string; key: string };
  student: { code: string; since: string } | null;
  stats: { enrolled: number; certificates: number };
  mine: { course: Course; done: number; percent: number; completedAt: string | null; code: string | null; demo?: boolean }[];
  origin: string;
  carnetQr: string;
  inscrito?: string;
};

/** Vista del perfil del estudiante: resumen, cursos, certificados (con LinkedIn) y carnet. */
export function ProfileView({ me, student, stats, mine, origin, carnetQr, inscrito }: ProfileData) {
  const initials = me.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const lessonsDone = mine.reduce((a, m) => a + m.done, 0);
  const watched = mine.reduce((a, m) => a + Math.round((m.course.minutes * m.percent) / 100), 0);
  const certs = mine.filter((m) => m.completedAt && m.code && m.course.certificate);
  const next = mine.filter((m) => !m.completedAt).sort((a, b) => b.percent - a.percent)[0];
  const welcome = inscrito ? mine.find((m) => m.course.slug === inscrito) : undefined;
  const since = student ? new Date(student.since).toLocaleDateString("es-CO", { month: "long", year: "numeric" }) : "";
  const year = new Date().getFullYear();

  const kpis: [typeof Award, string, string | number][] = [
    [BookOpenCheck, "Cursos inscritos", stats.enrolled],
    [CheckCircle2, "Lecciones completadas", lessonsDone],
    [Clock, "Tiempo de estudio", watched ? fmtMin(watched) : "0 min"],
    [Award, "Certificados", certs.length],
  ];

  return (
    <>
      {/* Cabecera del perfil */}
      <section className="relative overflow-hidden border-b border-[var(--border)] print:hidden">
        <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(216,181,88,0.18),transparent)]" />
        <span aria-hidden className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(47,156,98,0.22),transparent)]" />
        <Container className="relative flex flex-col gap-8 py-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_200deg,#d8b558,#8a6d2f,#d8b558)] p-[3px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[var(--bg)] font-[var(--font-display)] text-4xl font-bold text-[var(--fg-lime-400)]">{initials}</span>
            </span>
            <div className="min-w-0 flex-1 basis-72">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--fg-lime-500)]">Estudiante UCG</p>
              <h1 className="mt-1 font-[var(--font-display)] text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">{me.name}</h1>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
                <li className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5"><Mail size={14} className="text-[var(--fg-lime-500)]" /> {me.key}</li>
                {student && <li className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5"><IdCard size={14} className="text-[var(--fg-lime-500)]" /> <span className="font-mono text-[var(--text)]">{student.code}</span></li>}
                {since && <li className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5"><GraduationCap size={14} className="text-[var(--fg-lime-500)]" /> Desde {since}</li>}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#carnet" className={btnGhost}><IdCard size={16} /> Mi carnet</a>
              <Link href="/escuela-virtual" className={btnPrimary}><GraduationCap size={16} /> Explorar cursos</Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm lg:grid-cols-4">
            {kpis.map(([Icon, label, value], i) => (
              <div key={label} className={`flex items-center gap-4 px-5 py-5 ${i % 2 === 1 ? "border-l border-[var(--border)]" : ""} ${i > 1 ? "border-t border-[var(--border)] lg:border-t-0" : ""} ${i > 0 ? "lg:border-l lg:border-[var(--border)]" : ""}`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(216,181,88,0.14)] text-[var(--fg-lime-400)]"><Icon size={20} /></span>
                <div className="min-w-0">
                  <dd className="font-[var(--font-display)] text-3xl font-bold leading-none tabular-nums text-[var(--text)]">{value}</dd>
                  <dt className="mt-1 text-xs text-[var(--text-muted)]">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Navegación interna */}
      <nav aria-label="Secciones del perfil" className="sticky top-16 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl print:hidden">
        <Container className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[["#cursos", "Mis cursos"], ["#certificados", "Certificados"], ["#carnet", "Carnet"]].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 rounded-full px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] transition-colors hover:bg-[rgba(216,181,88,0.12)] hover:text-[var(--fg-lime-400)]">{label}</a>
          ))}
        </Container>
      </nav>

      <Container className="flex flex-col gap-14 py-10 sm:py-12 print:py-0">
        {welcome && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--fg-lime-500)] bg-[rgba(216,181,88,0.08)] p-5 print:hidden">
            <p className="flex items-center gap-3 font-semibold text-[var(--text)]"><CheckCircle2 className="text-[var(--fg-lime-500)]" /> ¡Listo! Ya está inscrito en «{welcome.course.title}».</p>
            <Link href={`/escuela-virtual/${welcome.course.slug}/aula`} className={btnPrimary}><PlayCircle size={16} /> Empezar ahora</Link>
          </div>
        )}

        {/* Continuar */}
        {next ? (
          <section aria-labelledby="seguir" className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[linear-gradient(120deg,rgba(47,156,98,0.14),rgba(255,255,255,0.02))] md:grid-cols-[minmax(0,22rem)_1fr] print:hidden">
            <div className="relative min-h-48 md:min-h-full">{next.course.cover && <Image src={next.course.cover} alt="" fill sizes="(min-width: 768px) 22rem, 100vw" className="object-cover" />}<span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(5,16,11,0.55))] md:bg-[linear-gradient(90deg,transparent_60%,rgba(5,16,11,0.7))]" /></div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
              <p id="seguir" className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]"><Sparkles size={14} /> Continúe donde iba</p>
              <h2 className="font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">{next.course.title}</h2>
              {next.course.subtitle && <p className="max-w-xl text-[var(--text-muted)]">{next.course.subtitle}</p>}
              <div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#34a868,#d8b558)]" style={{ width: `${Math.max(next.percent, 2)}%` }} /></div>
                <p className="mt-2 text-xs text-[var(--text-faint)]">{next.done} de {next.course.lessons} lecciones · {next.percent} % completado</p>
              </div>
              <div><Link href={`/escuela-virtual/${next.course.slug}/aula`} className={btnPrimary}><PlayCircle size={17} /> {next.done ? "Continuar curso" : "Empezar curso"}</Link></div>
            </div>
          </section>
        ) : (
          mine.length > 0 && (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-strong)] p-6 print:hidden">
              <p className="font-semibold text-[var(--text)]">¡Muy bien! Terminó todos sus cursos. Siga aprendiendo con otro.</p>
              <Link href="/escuela-virtual" className={btnPrimary}>Explorar cursos</Link>
            </section>
          )
        )}

        {/* Mis cursos */}
        <section id="cursos" aria-labelledby="mis-cursos" className="scroll-mt-32 print:hidden">
          <div className="flex items-end justify-between gap-4">
            <h2 id="mis-cursos" className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Mis cursos</h2>
            <Link href="/escuela-virtual" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:underline">Ver el catálogo →</Link>
          </div>
          {mine.length === 0 ? (
            <div className="mt-5 flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] p-10 text-center">
              <Image src="/brand/mascota-beto.svg" alt="" width={1671} height={2388} unoptimized className="h-36 w-auto" />
              <p className="text-[var(--text-muted)]">Todavía no se ha inscrito a ningún curso.</p>
              <Link href="/escuela-virtual" className={btnPrimary}>Explorar los cursos</Link>
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-3">
              {mine.map(({ course, percent, done, completedAt }) => (
                <li key={course.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-3 pr-5 transition-colors hover:border-[var(--fg-lime-500)]">
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[0.4rem]">{course.cover && <Image src={course.cover} alt="" fill sizes="8rem" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">{LEVELS[course.level]} · {course.lessons} lecciones{course.minutes ? ` · ${fmtMin(course.minutes)}` : ""}</p>
                    <Link href={`/escuela-virtual/${course.slug}/aula`} className="mt-0.5 block font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)] hover:text-[var(--fg-lime-400)]">{course.title}</Link>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#34a868,#d8b558)]" style={{ width: `${percent}%` }} /></span>
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">{done}/{course.lessons} · {percent} %</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] ${completedAt ? "bg-[rgba(52,168,104,0.18)] text-[#7fdca4]" : percent ? "bg-[rgba(216,181,88,0.16)] text-[var(--fg-lime-400)]" : "border border-[var(--border-strong)] text-[var(--text-muted)]"}`}>{completedAt ? "Terminado" : percent ? "En curso" : "Sin empezar"}</span>
                  <Link href={`/escuela-virtual/${course.slug}/aula`} className={btnGhost}>{completedAt ? "Repasar" : percent ? "Continuar" : "Empezar"}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Certificados */}
        <section id="certificados" aria-labelledby="certs" className="scroll-mt-32 print:hidden">
          <h2 id="certs" className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Mis certificados</h2>
          <p className="mt-1 text-[var(--text-muted)]">Publíquelos en su perfil de LinkedIn con un clic: llevan un enlace para que cualquiera verifique que son auténticos.</p>
          {certs.length === 0 ? (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] p-10 text-center">
              <Award size={34} className="text-[var(--fg-lime-500)]" />
              <p className="max-w-md text-[var(--text-muted)]">Todavía no tiene certificados. Termine las lecciones de un curso y apruebe su evaluación para obtenerlo.</p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 lg:grid-cols-2">
              {certs.map(({ course, code, completedAt, demo }) => {
                const verifyUrl = `${origin}/escuela-virtual/verificar/${code}`;
                return (
                  <li key={course.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)]">
                    <div className="relative border-b-[6px] border-double border-[#b08f4f] bg-[#fbf8ee] px-6 py-6 text-[#11271d]">
                      {demo && <span className="absolute right-4 top-4 rounded-full border border-[#b08f4f] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#8a6d2f]">Demostración</span>}
                      <div className="flex items-center gap-4">
                        <Image src="/brand/ucg-escudo.svg" alt="" width={1893} height={2385} unoptimized className="h-16 w-auto shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-[#8a6d2f]">Certificado de finalización</p>
                          <p className="mt-1 font-[var(--font-display)] text-xl font-bold leading-snug">{course.title}</p>
                          <p className="mt-1 text-xs text-[#4a5a52]">{completedAt && fmtDate(completedAt)} · <span className="font-mono">{code}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4">
                      <Link href={`/escuela-virtual/${course.slug}/certificado`} className={btnGhost}>Ver certificado</Link>
                      <a href={linkedinAddUrl({ course: course.title, code: code!, date: completedAt!, verifyUrl, demo })} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#0a66c2] text-white hover:bg-[#0b5aa8]`}>Agregar a LinkedIn</a>
                      <a href={linkedinShareUrl(verifyUrl)} target="_blank" rel="noopener noreferrer" className={`${btn} border border-[#0a66c2] text-[#6fb1f2] hover:bg-[rgba(10,102,194,0.15)]`}>Compartir</a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Carnet */}
        {student && (
          <section id="carnet" aria-labelledby="carnet-titulo" className="scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
              <div>
                <h2 id="carnet-titulo" className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Mi carnet de estudiante</h2>
                <p className="mt-1 text-[var(--text-muted)]">Su identificación como estudiante de la UCG. El código QR permite verificarla.</p>
              </div>
              <PrintButton />
            </div>
            <div className="mt-6 grid justify-items-center gap-6 lg:grid-cols-2">
              <StudentCard d={{ name: me.name, email: me.key, code: student.code, since, year, enrolled: stats.enrolled, certificates: certs.length, qr: carnetQr }} />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[var(--text-faint)] print:hidden"><Printer size={12} /> Verificación pública: {origin}/escuela-virtual/verificar/{student.code}</p>
          </section>
        )}
      </Container>
    </>
  );
}
