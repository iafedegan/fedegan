import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, PhotoTile, PrincipleList, Section, Timeline } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "Quiénes somos" };

const principles = [
  { title: "Visión", text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { title: "Valores", text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { title: "Buen gobierno", text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
];

// Hitos tomados de los textos del portal institucional (programas, normatividad y parafiscalidad).
const milestones = [
  { year: "1963", title: "Nace FEDEGÁN", text: "El 13 de diciembre, por decisión del IX Congreso Nacional de Ganaderos, se crea la Federación como organización gremial sin ánimo de lucro." },
  { year: "1993", title: "Leyes 89 y 101", text: "La Ley 89 crea la cuota de fomento ganadero y lechero y la cuenta especial Fondo Nacional del Ganado; la Ley 101 abre la puerta a los fondos de estabilización de precios." },
  { year: "1995", title: "Fomento al consumo", text: "Comienza el programa de donaciones de carne y leche a instituciones que atienden población vulnerable." },
  { year: "1997", title: "Erradicación de la aftosa", text: "La Ley 395 declara de interés nacional la erradicación de la fiebre aftosa, meta que el gremio convierte en propósito ganadero." },
  { year: "2006", title: "PEGA 2019 y Día del Ganadero", text: "FEDEGÁN pone en marcha el Plan Estratégico de la Ganadería y se celebra el primer Día Nacional del Ganadero, con el Premio Nacional de la Ganadería." },
  { year: "2009", title: "Todo el país libre de aftosa", text: "Tras la primera zona certificada en 2001, la última certificación completa el estatus de libre con vacunación para todo el territorio." },
];

const fronts = [
  { image: "/locales/programas.jpg", pos: "62% 50%", accent: "92,205,134", kicker: "Gremio", title: "FEDEGÁN", text: "Representación gremial, fortalecimiento regional y cámaras ganaderas.", href: "/seccion/programas/programa/fedegan" },
  { image: "/locales/fng.jpg", pos: "50% 50%", accent: "216,181,88", kicker: "Parafiscal", title: "Fondo Nacional del Ganado", text: "Cuota de fomento ganadero y lechero invertida en sanidad, ciencia y consumo.", href: "/seccion/fng" },
  { image: "/headers/campo.jpg", pos: "50% 62%", accent: "230,160,108", kicker: "Mercados", title: "Fondo de Estabilización (FEP)", text: "Exportaciones de carne, leche y derivados y mecanismo de compensaciones.", href: "/seccion/fep" },
  { image: "/locales/publicaciones.jpg", pos: "60% 50%", accent: "190,222,203", kicker: "Social", title: "Fundagán", text: "Ganadería y derechos humanos, y responsabilidad social en el campo.", href: "/seccion/programas/programa/fundagan" },
];

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Quiénes somos"
        description="Federación Colombiana de Ganaderos: entidad gremial sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país desde 1963."
        image="/locales/programas.jpg"
        imagePos="70% 50%"
        breadcrumbs={[{ label: "Quiénes somos" }]}
        meta="Desde 1963"
      />

      <Section id="identidad" eyebrow="Identidad" title="Lo que nos guía">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <figure>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Misión</p>
            <p style={{ fontFamily: "var(--font-display)" }} className="mt-3 border-l-2 border-[var(--fg-lime-500)] pl-5 text-2xl font-bold leading-snug text-[var(--text)] sm:pl-7 sm:text-[2rem] sm:leading-[1.25]">
              Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana.
            </p>
          </figure>
          <PrincipleList items={principles} />
        </div>
      </Section>

      <Section id="historia" eyebrow="Nuestra historia" title="Más de seis décadas junto al ganadero" tinted>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Timeline items={milestones} />
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)]">
              <Image src="/locales/fng.jpg" alt="Ganadero y funcionario atendiendo una res en el corral de una finca" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" style={{ objectPosition: "50% 50%" }} />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,16,11,0.7)_0%,transparent_55%)]" />
              <span className="absolute bottom-4 left-4 rounded-full border border-[var(--border-strong)] bg-[rgba(4,12,8,0.6)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-400)] backdrop-blur">
                Sanidad animal en el campo
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-faint)]">
              Hitos tomados de los textos institucionales de FEDEGÁN–FNG sobre programas, normatividad y parafiscalidad.
            </p>
          </div>
        </div>
      </Section>

      <Section id="frentes" eyebrow="Lo que hacemos" title="Cuatro frentes del gremio" intro="Cada línea de valor tiene su propia sección con programas, normatividad y documentos.">
        <div className="grid gap-5 sm:grid-cols-2">
          {fronts.map((f) => (
            <PhotoTile key={f.title} {...f} className="min-h-[17rem]" />
          ))}
        </div>
      </Section>

      <CtaBand
        eyebrow="Siga explorando"
        title="Conozca el directorio del portal o escríbanos"
        text="Cada servicio, medio y línea de valor del ecosistema tiene su propio espacio."
        actions={[
          { label: "Ver directorio", href: "/directorio" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}
