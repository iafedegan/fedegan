import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { type PictogramName } from "@/components/ui/Pictogram";
import { WaveCard, type WaveAccent } from "@/components/ui/WaveCard";
import { FechasLimite } from "@/components/pagos/FechasLimite";
import { InstructivoTabs } from "@/components/pagos/InstructivoTabs";
import { NextDeadline } from "@/components/pagos/NextDeadline";

export const metadata: Metadata = { title: "Zona de pagos" };

const opciones: { icon: PictogramName; wave: WaveAccent; tags: string[]; title: string; quien: string; text: string; need: string[]; href: string; cta: string; external?: boolean }[] = [
  {
    icon: "pago",
    wave: "esmeralda",
    tags: ["PSE", "Planilla"],
    title: "Cuota de fomento · Leche",
    quien: "Recaudadores de leche",
    text: "Reporte los litros comprados por municipio y pague el recaudo del mes por PSE.",
    need: ["NIT o cédula de recaudador", "Litros y valor por municipio", "Mes de causación"],
    href: "/pagos/cuota?c=leche",
    cta: "Pagar cuota de leche",
  },
  {
    icon: "res",
    wave: "oro",
    tags: ["PSE", "Planilla"],
    title: "Cuota de fomento · Carne",
    quien: "Recaudadores de carne",
    text: "Reporte las cabezas sacrificadas por municipio, machos y hembras, y pague por PSE.",
    need: ["NIT o cédula de recaudador", "Cabezas por municipio", "Machos y hembras del mes"],
    href: "/pagos/cuota?c=carne",
    cta: "Pagar cuota de carne",
  },
  {
    icon: "biologico",
    wave: "turquesa",
    tags: ["Dosis", "Recaudo"],
    title: "Recaudo biológico",
    quien: "Vacunadores y organizaciones",
    text: "Recaudo de las dosis aplicadas: aftosa, aftosa más rabia y brucelosis RB51.",
    need: ["Dosis aplicadas del ciclo", "Datos de la organización"],
    href: "/pagos/biologico",
    cta: "Pagar recaudo biológico",
  },
];

export default function PagosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fondo Nacional del Ganado"
        title="Zona de pagos"
        description="Todos los pagos de FEDEGÁN–FNG en un solo lugar."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        facts={["PSE", "Cuota de fomento", "Recaudo biológico"]}
        breadcrumbs={[{ label: "Zona de pagos" }]}
        compact
      />

      <Container className="py-8 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-center">
          <div>
            <span className="eyebrow">Paso 1</span>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-bold text-[var(--text)] sm:text-4xl">¿Qué desea pagar?</h2>
          </div>
          <NextDeadline size="lg" />
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((o) => (
            <li key={o.title}>
              <WaveCard href={o.href} accent={o.wave} icon={o.icon} title={o.title} tags={o.tags} text={`${o.quien}. ${o.text}`} cta={o.cta} />
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <ShieldCheck size={20} className="shrink-0 text-[var(--fg-lime-400)]" />
          Los pagos se hacen por PSE – Pagos Seguros en Línea, que maneja archivos encriptados y lo envía a la página de su banco.
        </p>
      </Container>

      <Section id="calendario" eyebrow="Paso 2" title="Fechas límite de consignación 2026" intro="Consigne dentro de los primeros días del mes siguiente al recaudo. Pasada la fecha límite, el sistema liquida intereses de mora." tinted>
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <FechasLimite />
          <ul className="grid grid-cols-2 gap-4">
            {[
              { src: "/accesos/cuota-se-mantiene.webp", alt: "Comunicado a recaudadores: la cuota se mantiene", href: "https://storage.googleapis.com/static-fedegan/banners/bnn-2026/bnn-cfgl-se-mantiene/Comunicado-recaudadores.jpg", w: 960, h: 1200, t: "Comunicado a recaudadores" },
              { src: "/accesos/aviso-cuota.webp", alt: "Aviso importante sobre la cuota 2026", href: "https://storage.googleapis.com/static-fedegan/recaudo_cfgl/aviso_cuota_fgl-2026.jpg", w: 960, h: 1690, t: "Aviso sobre la cuota 2026" },
            ].map((a) => (
              <li key={a.src}>
                <a href={a.href} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[0.75rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] transition-colors hover:border-[var(--fg-lime-500)]">
                  <Image src={a.src} alt={a.alt} width={a.w} height={a.h} unoptimized className="h-auto w-full" />
                  <span className="flex items-center justify-between gap-2 p-3 text-sm font-bold text-[var(--text)]">
                    {a.t} <ArrowUpRight size={14} className="shrink-0 text-[var(--text-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Paso 3" title="Guía del botón de pago PSE" intro="Elija el concepto que va a pagar.">
        <InstructivoTabs />
      </Section>

      <CtaBand
        eyebrow="¿Necesita ayuda?"
        title="Resolvemos sus dudas sobre los pagos"
        text="Escríbanos o revise las preguntas frecuentes."
        actions={[
          { label: "Contacto", href: "/contacto" },
          { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
        ]}
      />
    </>
  );
}
