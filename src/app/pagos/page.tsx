import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { PaymentLogin } from "@/components/pagos/PaymentLogin";
import { FechasLimite } from "@/components/pagos/FechasLimite";
import { InstructivoTabs } from "@/components/pagos/InstructivoTabs";
import { ley, pagosActual } from "@/content/pagos";

export const metadata: Metadata = { title: "Pago en línea de la cuota de fomento" };

const pasos = [
  { n: "1", t: "Ingrese", d: "Con su NIT o cédula de recaudador." },
  { n: "2", t: "Diligencie la planilla", d: "Mes de recaudo, orígenes y totales de leche o carne." },
  { n: "3", t: "Pague por PSE", d: "Elija su banco y siga el proceso seguro." },
];

export default function PagosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fondo Nacional del Ganado"
        title="Pago en línea"
        description="Recaudo de la cuota de fomento ganadero y lechero para los recaudadores."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        facts={["PSE", "Leche y carne", "Fechas límite 2026"]}
        breadcrumbs={[{ label: "Pagos y trámites", href: "/accesos" }, { label: "Pago en línea" }]}
        compact
      />

      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <PaymentLogin />

        <div className="flex flex-col gap-7">
          <div>
            <p className="eyebrow">{ley.titulo}</p>
            <div className="mt-3 flex flex-col gap-3.5 leading-relaxed text-[var(--text-muted)]">
              {ley.parrafos.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>

          <ol className="grid gap-0 border-y border-[var(--border-strong)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
            {pasos.map((p) => (
              <li key={p.n} className="flex gap-3 py-4 sm:flex-col sm:gap-1.5 sm:px-4 sm:first:pl-0">
                <span className="font-[var(--font-display)] text-3xl font-bold leading-none text-[var(--fg-lime-400)]">{p.n}</span>
                <span>
                  <span className="block font-bold text-[var(--text)]">{p.t}</span>
                  <span className="block text-sm leading-snug text-[var(--text-muted)]">{p.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/pagos/planilla" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)] hover:text-[var(--text)]">
              Ver la planilla de recaudo <ArrowRight size={16} />
            </Link>
            <a href={pagosActual} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">
              Sistema actual de pagos <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </Container>

      <Section eyebrow="Calendario" title="Fechas límite de consignación 2026" intro="Consigne dentro de los primeros días del mes siguiente al recaudo. Pasada la fecha límite, el sistema liquida intereses de mora." tinted>
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

      <Section eyebrow="Paso a paso" title="Instructivo del botón de pago PSE" intro="Elija el concepto que va a pagar.">
        <InstructivoTabs />
      </Section>

      <CtaBand
        eyebrow="¿Necesita ayuda?"
        title="Resolvemos sus dudas sobre el recaudo"
        text="Escríbanos o revise las preguntas frecuentes."
        actions={[
          { label: "Contacto", href: "/contacto" },
          { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
        ]}
      />
    </>
  );
}
