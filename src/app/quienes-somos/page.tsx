import type { Metadata } from "next";
import { type PictogramName } from "@/components/ui/Pictogram";
import { WaveCard } from "@/components/ui/WaveCard";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { CountUp } from "@/components/design/CountUp";
import { ScrollRail } from "@/components/design/ScrollRail";

export const metadata: Metadata = { title: "Quiénes somos" };

const FOUNDED = 1963;
const YEARS = new Date().getFullYear() - FOUNDED;

const pillars = [
  { icon: "amanecer" as PictogramName, acc: "92,205,134", title: "Visión", tags: ["Referente", "Innovación"], text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { icon: "brotes" as PictogramName, acc: "230,160,108", title: "Valores", tags: ["Servicio", "Compromiso"], text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { icon: "balanza" as PictogramName, acc: "112,214,196", title: "Buen gobierno", tags: ["Código", "Control"], text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
];

// Hitos tomados de los textos del portal institucional (programas, normatividad y parafiscalidad).
const milestones = [
  { year: "1963", title: "Nace FEDEGÁN", text: "Por decisión del IX Congreso Nacional de Ganaderos se crea la Federación como gremio sin ánimo de lucro.", acc: "216,181,88" },
  { year: "1993", title: "Leyes 89 y 101", text: "Nacen la cuota de fomento ganadero y lechero, el Fondo Nacional del Ganado y la base de los fondos de estabilización.", acc: "92,205,134" },
  { year: "1995", title: "Fomento al consumo", text: "Comienzan las donaciones de carne y leche a instituciones que atienden población vulnerable.", acc: "230,160,108" },
  { year: "1997", title: "Erradicación de la aftosa", text: "La Ley 395 declara de interés nacional la erradicación de la fiebre aftosa.", acc: "112,214,196" },
  { year: "2006", title: "PEGA 2019", text: "FEDEGÁN pone en marcha el Plan Estratégico de la Ganadería y se celebra el primer Día Nacional del Ganadero.", acc: "216,181,88" },
  { year: "2009", title: "País libre de aftosa", text: "La última certificación completa el estatus de libre con vacunación en todo el territorio.", acc: "92,205,134" },
];

const fronts = [
  { image: "/locales/programas.jpg", pos: "62% 50%", acc: "92,205,134", kicker: "Gremio", title: "FEDEGÁN", text: "Representación gremial, fortalecimiento regional y cámaras ganaderas.", href: "/seccion/programas/programa/fedegan", big: true },
  { image: "/locales/fng.jpg", pos: "50% 50%", acc: "216,181,88", kicker: "Parafiscal", title: "Fondo Nacional del Ganado", text: "Cuota de fomento invertida en sanidad, ciencia y consumo.", href: "/seccion/fng" },
  { image: "/headers/campo.jpg", pos: "50% 62%", acc: "230,160,108", kicker: "Mercados", title: "Fondo de Estabilización (FEP)", text: "Exportaciones de carne, leche y derivados.", href: "/seccion/fep" },
  { image: "/locales/publicaciones.jpg", pos: "60% 50%", acc: "112,214,196", kicker: "Social", title: "Fundagán", text: "Ganadería y derechos humanos, y responsabilidad social.", href: "/seccion/programas/programa/fundagan" },
];

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Quiénes somos"
        description="Federación Colombiana de Ganaderos: gremio sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país."
        image="/headers/ia-quienes-somos.jpg"
        imagePos="50% 50%"
        facts={[`Desde ${FOUNDED}`, "Fondo Nacional del Ganado", "Cobertura nacional"]}
        breadcrumbs={[{ label: "Quiénes somos" }]}
      />

      <Section>
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="mx-stat mx-rise"><b><CountUp to={YEARS} /></b><span>Años de trayectoria</span></li>
          <li className="mx-stat mx-rise"><b>4</b><span>Frentes del gremio</span></li>
          <li className="mx-stat mx-rise"><b><CountUp to={2009} from={1963} /></b><span>País libre de aftosa</span></li>
        </ul>
      </Section>

      <Section title="Lo que nos guía">
        <figure className="mx-quote mx-rise flex flex-col justify-between gap-6">
          <figcaption className="mx-kicker self-start">Misión</figcaption>
          <p style={{ fontFamily: "var(--font-display)" }} className="max-w-4xl text-2xl font-bold leading-snug text-[var(--text)] sm:text-[2rem] sm:leading-[1.2]">
            Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana.
          </p>
          <span aria-hidden className="mx-bar" />
        </figure>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.title}>
              <WaveCard accent={(["turquesa", "terracota", "esmeralda"] as const)[i]} icon={p.icon} title={p.title} tags={p.tags} text={p.text} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Nuestra historia" intro="Seis hitos que marcan el camino del gremio. Deslice o use las flechas.">
        <ScrollRail label="Línea de tiempo">
          {milestones.map((m, i) => (
            <WaveCard key={m.year} accent={(["oro", "esmeralda", "terracota", "turquesa"] as const)[i % 4]} glyph={m.year} title={m.title} text={m.text} tags={[`${String(i + 1).padStart(2, "0")} / ${String(milestones.length).padStart(2, "0")}`]} />
          ))}
        </ScrollRail>
      </Section>

      <Section title="Lo que hacemos" intro="Cada línea de valor tiene su propia sección con programas, normatividad y documentos.">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fronts.map((f) => (
            <li key={f.title}>
              <PhotoCard image={f.image} imagePos={f.pos} accent={f.acc} kicker={f.kicker} title={f.title} text={f.text} href={f.href} cta="Conocer" />
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        eyebrow="Siga explorando"
        title="Conozca el directorio del portal o escríbanos"
        text="Cada servicio, medio y línea de valor del ecosistema tiene su propio espacio."
        actions={[
          { label: "Directorio", href: "/directorio" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}
