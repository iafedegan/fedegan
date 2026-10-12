import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "Quiénes somos" };

const pillars = [
  { title: "Misión", text: "Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana." },
  { title: "Visión", text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { title: "Valores", text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { title: "Buen gobierno", text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
];

// Hitos tomados de los textos del portal institucional (programas, normatividad y parafiscalidad).
const milestones = [
  { year: "1963", title: "Nace FEDEGÁN", text: "Por decisión del IX Congreso Nacional de Ganaderos se crea la Federación como gremio sin ánimo de lucro." },
  { year: "1993", title: "Leyes 89 y 101", text: "Nacen la cuota de fomento ganadero y lechero, el Fondo Nacional del Ganado y la base de los fondos de estabilización." },
  { year: "1995", title: "Fomento al consumo", text: "Comienzan las donaciones de carne y leche a instituciones que atienden población vulnerable." },
  { year: "1997", title: "Erradicación de la aftosa", text: "La Ley 395 declara de interés nacional la erradicación de la fiebre aftosa." },
  { year: "2006", title: "PEGA 2019", text: "FEDEGÁN pone en marcha el Plan Estratégico de la Ganadería y se celebra el primer Día Nacional del Ganadero." },
  { year: "2009", title: "País libre de aftosa", text: "La última certificación completa el estatus de libre con vacunación en todo el territorio." },
];

const fronts = [
  { title: "FEDEGÁN", text: "Representación gremial y fortalecimiento regional.", href: "/seccion/programas/programa/fedegan" },
  { title: "Fondo Nacional del Ganado", text: "Cuota de fomento invertida en sanidad, ciencia y consumo.", href: "/seccion/fng" },
  { title: "Fondo de Estabilización (FEP)", text: "Exportaciones de carne, leche y derivados.", href: "/seccion/fep" },
  { title: "Fundagán", text: "Ganadería y derechos humanos, y responsabilidad social.", href: "/seccion/programas/programa/fundagan" },
];

const card = "rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-5";

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        title="Quiénes somos"
        description="Federación Colombiana de Ganaderos: gremio sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país desde 1963."
        breadcrumbs={[{ label: "Quiénes somos" }]}
      />

      <Section title="Lo que nos guía">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <li key={p.title} className={card}>
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--fg-lime-400)]">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Nuestra historia">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m) => (
            <li key={m.year} className={card}>
              <p className="font-[var(--font-display)] text-2xl font-bold tabular-nums text-[var(--fg-lime-400)]">{m.year}</p>
              <h3 className="mt-1 font-bold text-[var(--text)]">{m.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{m.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Lo que hacemos">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fronts.map((f) => (
            <li key={f.title}>
              <Link href={f.href} className={`${card} group flex h-full flex-col gap-1.5 transition-colors hover:border-[var(--fg-lime-500)]`}>
                <h3 className="font-bold text-[var(--text)]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{f.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[var(--fg-lime-400)]">
                  Ver más <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="¿Quiere conocer más o escribirnos?"
        actions={[
          { label: "Directorio", href: "/directorio" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}
