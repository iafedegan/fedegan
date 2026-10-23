import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { PaymentLogin } from "@/components/pagos/PaymentLogin";
import { ley, pagosActual } from "@/content/pagos";

export const metadata: Metadata = { title: "Cuota de fomento: ingreso de recaudadores" };

const pasos = [
  { n: "1", t: "Ingrese", d: "Con su NIT o cédula de recaudador." },
  { n: "2", t: "Diligencie la planilla", d: "Mes de recaudo, orígenes y totales." },
  { n: "3", t: "Pague por PSE", d: "Elija su banco y siga el proceso seguro." },
];

export default async function CuotaPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const concepto = c === "carne" ? "carne" : "leche";
  return (
    <>
      <PageHeader
        eyebrow="Zona de pagos"
        title="Cuota de fomento ganadero y lechero"
        description="Ingreso para recaudadores del Fondo Nacional del Ganado."
        image="/headers/ia-cuota.jpg"
        imagePos="50% 50%"
        breadcrumbs={[{ label: "Zona de pagos", href: "/pagos" }, { label: "Cuota de fomento" }]}
        compact
      />
      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-5">
          <div role="tablist" aria-label="Concepto" className="inline-flex w-fit rounded-[0.25rem] border border-[var(--border-strong)] p-1">
            {(["leche", "carne"] as const).map((k) => (
              <Link
                key={k}
                role="tab"
                aria-selected={concepto === k}
                href={`/pagos/cuota?c=${k}`}
                className={`rounded-[0.25rem] px-6 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition-colors ${concepto === k ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                {k}
              </Link>
            ))}
          </div>
          <PaymentLogin />
          <Link href={`/pagos/planilla?c=${concepto}`} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)] hover:text-[var(--text)]">
            Ver la planilla de {concepto} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <p className="eyebrow">{ley.titulo}</p>
            <div className="mt-3 flex flex-col gap-3.5 leading-relaxed text-[var(--text-muted)]">
              {ley.parrafos.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <ol className="grid border-y border-[var(--border-strong)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
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
          <a href={pagosActual} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">
            Sistema actual de pagos <ArrowUpRight size={14} />
          </a>
        </div>
      </Container>
    </>
  );
}
