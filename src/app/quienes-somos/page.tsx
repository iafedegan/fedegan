import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Pictogram, type PictogramName } from "@/components/ui/Pictogram";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { Spotlight } from "@/components/design/Spotlight";
import { CountUp } from "@/components/design/CountUp";
import { ScrollRail } from "@/components/design/ScrollRail";

export const metadata: Metadata = { title: "Quiénes somos" };

const FOUNDED = 1963;
const YEARS = new Date().getFullYear() - FOUNDED;

const pillars = [
  { icon: "amanecer" as PictogramName, acc: "92,205,134", title: "Visión", text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { icon: "brotes" as PictogramName, acc: "230,160,108", title: "Valores", text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { icon: "balanza" as PictogramName, acc: "112,214,196", title: "Buen gobierno", text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
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

const acc = (v: string) => ({ ["--acc-rgb" as string]: v }) as CSSProperties;

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Quiénes somos"
        description="Federación Colombiana de Ganaderos: gremio sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país."
        image="/locales/programas.jpg"
        imagePos="62% 50%"
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
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <figure className="mx-quote mx-rise flex flex-col justify-between gap-6">
            <figcaption className="mx-kicker self-start">Misión</figcaption>
            <p style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold leading-snug text-[var(--text)] sm:text-[2rem] sm:leading-[1.2]">
              Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana.
            </p>
            <span aria-hidden className="mx-bar" />
          </figure>
          <Spotlight as="ul" className="grid gap-4">
            {pillars.map((p) => (
              <li key={p.title} className="mx-card mx-lift mx-rise flex items-start gap-4" style={acc(p.acc)}>
                <span className="mx-icon shrink-0"><Pictogram name={p.icon} size={28} /></span>
                <div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{p.text}</p>
                </div>
              </li>
            ))}
          </Spotlight>
        </div>
      </Section>

      <Section title="Nuestra historia" intro="Seis hitos que marcan el camino del gremio. Deslice o use las flechas.">
        <ScrollRail label="Línea de tiempo">
          {milestones.map((m, i) => (
            <Spotlight as="div" key={m.year}>
              <article className="mx-card mx-lift h-full" style={acc(m.acc)}>
                <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-faint)]">{String(i + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}</p>
                <p className="mx-year mt-3">{m.year}</p>
                <h3 className="mt-3 text-lg font-bold text-[var(--text)]">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{m.text}</p>
              </article>
            </Spotlight>
          ))}
        </ScrollRail>
      </Section>

      <Section title="Lo que hacemos" intro="Cada línea de valor tiene su propia sección con programas, normatividad y documentos.">
        <ul className="grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fronts.map((f) => (
            <li key={f.title} className={f.big ? "lg:col-span-2 lg:row-span-2" : ""}>
              <Link href={f.href} className="mx-rise group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-[1.4rem] border border-[var(--border-strong)]" style={acc(f.acc)}>
                <Image src={f.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="-z-10 object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.07]" style={{ objectPosition: f.pos }} />
                <span aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(0deg, rgba(4,14,9,0.94) 0%, rgba(4,14,9,0.55) 45%, rgba(4,14,9,0.05) 80%), linear-gradient(135deg, rgba(var(--acc-rgb),0.3), transparent 55%)" }} />
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition-all duration-300 group-hover:bg-[rgb(var(--acc-rgb))] group-hover:text-[#11271d]">
                  <ArrowUpRight size={18} />
                </span>
                <div className="p-5">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[rgb(var(--acc-rgb))]">{f.kicker}</p>
                  <h3 className={`mt-1 font-[var(--font-display)] font-bold leading-snug text-white ${f.big ? "text-3xl" : "text-xl"}`}>{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/80">{f.text}</p>
                </div>
              </Link>
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
