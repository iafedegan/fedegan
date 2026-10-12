import type { Metadata } from "next";
import Image from "next/image";
import { Clock, GraduationCap, Signal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Escuela Virtual" };

const courses = [
  { accent: "92,205,134", title: "Manejo sanitario del hato bovino", level: "Básico", duration: "6 horas" },
  { accent: "216,181,88", title: "Sistemas silvopastoriles aplicados", level: "Intermedio", duration: "10 horas" },
  { accent: "230,160,108", title: "Gestión financiera de la finca ganadera", level: "Intermedio", duration: "8 horas" },
];

export default function EscuelaVirtualPage() {
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual FEDEGÁN"
        description="Capacitación técnica y gerencial para productores, técnicos y profesionales del sector ganadero colombiano."
        image="/locales/sig.jpg"
        imagePos="45% 50%"
        meta={`${courses.length} cursos`}
        breadcrumbs={[{ label: "Escuela Virtual" }]}
      />

      <Section>
        <div className="relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)]">
          <Image src="/locales/sig.jpg" alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="-z-10 object-cover" style={{ objectPosition: "45% 40%" }} />
          <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,16,11,0.94)_0%,rgba(5,16,11,0.78)_50%,rgba(5,16,11,0.35)_100%)]" />
          <div className="flex flex-col items-start gap-6 p-7 sm:p-10 lg:max-w-2xl">
            <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[rgba(216,181,88,0.14)] text-[var(--fg-lime-400)]">
              <GraduationCap size={26} strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">Aprenda a su ritmo, desde la finca</h2>
              <p className="mt-3 text-lg leading-relaxed text-[var(--text-muted)]">
                Acceda a la plataforma de formación actual de la Escuela Virtual FEDEGÁN para inscribirse y tomar sus cursos.
              </p>
            </div>
            <Button variant="lime">Ir a la plataforma →</Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Catálogo" title="Cursos destacados" tinted>
        <ul className="grid gap-5 md:grid-cols-3">
          {courses.map((c) => (
            <li
              key={c.title}
              className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-6 pt-7"
              style={{ ["--acc-rgb" as string]: c.accent } as React.CSSProperties}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[rgb(var(--acc-rgb))]" />
              <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{c.title}</h3>
              <div className="mt-auto flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.08em]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--acc-rgb),0.55)] px-3 py-1.5 text-[rgb(var(--acc-rgb))]">
                  <Signal size={13} aria-hidden /> {c.level}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-[var(--text-muted)]">
                  <Clock size={13} aria-hidden /> {c.duration}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        eyebrow="Acompañamiento"
        title="¿Dudas sobre su inscripción o los cursos?"
        actions={[
          { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}
