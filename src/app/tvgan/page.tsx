import type { Metadata } from "next";
import Image from "next/image";
import { CalendarClock, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "TVGAN" };

const programs = [
  { accent: "216,181,88", title: "Tu Vitrina Ganadera", schedule: "Lunes a viernes · 6:00 p. m." },
  { accent: "92,205,134", title: "Manual Práctico Ganadero", schedule: "Capítulo semanal" },
];

export default function TvganPage() {
  return (
    <>
      <PageHeader
        eyebrow="Medios"
        title="TVGAN"
        description="El canal del ganadero colombiano: programas, entrevistas y contenido audiovisual del sector."
        image="/headers/prensa.jpg"
        imagePos="55% 40%"
        meta="Canal"
        breadcrumbs={[{ label: "TVGAN" }]}
      />

      <Section>
        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          <div className="relative isolate aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)]">
            <Image src="/headers/prensa.jpg" alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="-z-10 object-cover" style={{ objectPosition: "55% 40%" }} />
            <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(5,15,9,0.85)_0%,rgba(5,15,9,0.3)_55%,rgba(5,15,9,0.45)_100%)]" />
            <button
              type="button"
              aria-label="Reproducir Tu Vitrina Ganadera"
              className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[rgba(216,181,88,0.22)] text-[var(--fg-lime-400)] backdrop-blur transition-transform duration-500 [transition-timing-function:var(--ease-lux)] hover:scale-110"
            >
              <Play size={30} className="translate-x-0.5" />
            </button>
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-400)]">Destacado</p>
              <p className="font-[var(--font-display)] text-xl font-bold text-[var(--text)] sm:text-2xl">Tu Vitrina Ganadera</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Programación</h2>
            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {programs.map((p) => (
                <li key={p.title} className="flex items-start gap-4 py-5" style={{ ["--acc-rgb" as string]: p.accent } as React.CSSProperties}>
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                    <CalendarClock size={19} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{p.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{p.schedule}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Más contenido"
        title="Noticias y periodismo del sector en CONtexto Ganadero"
        actions={[
          { label: "Ir a CONtexto Ganadero", href: "https://www.contextoganadero.com/" },
          { label: "Ver noticias", href: "/noticias" },
        ]}
      />
    </>
  );
}
