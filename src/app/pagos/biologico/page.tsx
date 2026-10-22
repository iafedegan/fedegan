import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Pictogram } from "@/components/ui/Pictogram";

export const metadata: Metadata = { title: "Recaudo biológico" };

const dosis = [
  { t: "Aftosa", d: "Vacunación contra la fiebre aftosa." },
  { t: "Aftosa más rabia", d: "Dosis combinada de aftosa y rabia de origen silvestre." },
  { t: "Brucelosis RB51", d: "Vacunación contra la brucelosis bovina." },
];

export default function BiologicoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Zona de pagos"
        title="Recaudo biológico"
        description="Recaudo de las dosis aplicadas en los ciclos de vacunación."
        image="/headers/campo.jpg"
        imagePos="50% 60%"
        breadcrumbs={[{ label: "Zona de pagos", href: "/pagos" }, { label: "Recaudo biológico" }]}
        compact
      />
      <Container className="grid items-start gap-10 py-8 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div>
            <span className="text-[var(--fg-lime-400)]"><Pictogram name="biologico" size={52} /></span>
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)]">Recaudo de dosis aplicadas</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-[var(--text-muted)]">
              Los vacunadores y organizaciones que aplican las dosis de cada ciclo reportan y pagan aquí el recaudo biológico de las vacunas que aplicaron.
            </p>
          </div>
          <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {dosis.map((d) => (
              <li key={d.t} className="grid grid-cols-[1fr] gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <span className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{d.t}</span>
                <span className="text-[var(--text-muted)]">{d.d}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://micrositios.goupagos.com.co/fedegan-ma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[0.4rem] bg-[var(--fg-lime-500)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11] transition hover:bg-[var(--fg-lime-400)]"
            >
              Pagar el recaudo <ArrowUpRight size={16} />
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--text-faint)]">Por ahora el pago se hace en el sitio de pagos de FEDEGÁN; esta pantalla se conectará a ese sistema.</p>
          </div>
        </div>
        <Image src="/accesos/recaudo-biologico.webp" alt="Biológico: recaudo de dosis aplicadas, aftosa, aftosa más rabia y RB51" width={640} height={784} unoptimized className="h-auto w-full max-w-sm justify-self-center rounded-[0.9rem] border border-[var(--border-strong)] shadow-[0_24px_44px_-28px_rgba(0,0,0,0.85)] lg:justify-self-end" />
      </Container>
    </>
  );
}
