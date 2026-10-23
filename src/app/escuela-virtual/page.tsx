import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Escuela Virtual" };

const MPG_URL = "https://mpg.fedegan.org.co/";
const ACCENTS = ["92,205,134", "216,181,88", "230,160,108", "112,214,196"];

// Manual Práctico Ganadero (M.V. Esp. Ricardo Arenas Ovalle): 11 bloques, 165 videos y más de 40 horas.
const courses = [
  { title: "Fundamentos de la Ganadería Colombiana", desc: "Bases históricas, sostenibilidad y cultura sanitaria", videos: 8 },
  { title: "Alimentación Animal y Manejo de Praderas", desc: "Praderas, pastoreo, conservación y suplementación", videos: 29 },
  { title: "Ganadería Sostenible y Medio Ambiente", desc: "Sistemas silvopastoriles, agua, ecosistemas y energías", videos: 12 },
  { title: "Salud Animal", desc: "Enfermedades, primeros auxilios y manejo del animal", videos: 18 },
  { title: "Genética y Reproducción", desc: "Mejoramiento genético, reproducción y biotecnologías", videos: 21 },
  { title: "Etapas de la Producción Ganadera", desc: "Cría, levante y ceba del ganado", videos: 16 },
  { title: "Productos de Ganadería", desc: "Carne, leche, agroindustria cárnica y láctea", videos: 24 },
  { title: "Administración Ganadera", desc: "Registros, recurso humano, gremialidad y animales asociados", videos: 10 },
  { title: "Razas Bovinas", desc: "Razas de leche y carne para trópico alto y bajo", videos: 4 },
  { title: "Búfalos", desc: "Producción, manejo, nutrición y mercados bufaleros", videos: 8 },
  { title: "Buenas Prácticas Ganaderas y Sello Ambiental", desc: "BPG, trazabilidad, bienestar animal y sellos NTC-6550", videos: 15 },
].map((c, i) => ({ ...c, n: String(i + 1).padStart(2, "0"), accent: ACCENTS[i % ACCENTS.length] }));

export default function EscuelaVirtualPage() {
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual FEDEGÁN"
        description="Capacitación técnica y gerencial para productores, técnicos y profesionales del sector ganadero colombiano."
        image="/locales/sig.jpg"
        imagePos="45% 50%"
        meta={`${courses.length} cursos · 165 videos`}
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
                Los 11 cursos del Manual Práctico Ganadero: más de 40 horas y 165 videos sobre ganadería bovina y bufalina tropical, con lenguaje sencillo y total rigurosidad técnica.
              </p>
            </div>
            <Button variant="lime" href={MPG_URL} external>Ir a la plataforma →</Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Catálogo" title="Los 11 cursos" tinted>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li key={c.title} className="h-full">
              <a
                href={MPG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-6 pt-7 transition-colors hover:border-[rgb(var(--acc-rgb))]"
                style={{ ["--acc-rgb" as string]: c.accent } as React.CSSProperties}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[rgb(var(--acc-rgb))]" />
                <span className="font-mono text-xs tracking-[0.14em] text-[rgb(var(--acc-rgb))]">CURSO {c.n}</span>
                <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{c.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{c.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full border border-[rgba(var(--acc-rgb),0.55)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[rgb(var(--acc-rgb))]">
                  <PlayCircle size={13} aria-hidden /> {c.videos} videos
                </span>
              </a>
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
