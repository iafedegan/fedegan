import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Pictogram, type PictogramName } from "@/components/ui/Pictogram";
import { NextDeadline } from "@/components/pagos/NextDeadline";

const options: { icon: PictogramName; title: string; text: string; href: string }[] = [
  { icon: "pago", title: "Cuota de fomento · Leche", text: "Planilla de recaudo mensual y pago por PSE.", href: "/pagos/cuota?c=leche" },
  { icon: "res", title: "Cuota de fomento · Carne", text: "Cabezas sacrificadas y pago por PSE.", href: "/pagos/cuota?c=carne" },
  { icon: "biologico", title: "Recaudo biológico", text: "Dosis aplicadas: aftosa, rabia y brucelosis.", href: "/pagos/biologico" },
  { icon: "libro", title: "Calendario y guía", text: "Fechas límite 2026 e instructivo paso a paso.", href: "/pagos#calendario" },
];

// Portada: una sola franja con todo lo que se paga, en lugar de un banner por cada pago.
export function PaymentsBand() {
  return (
    <section aria-labelledby="pagos-band" className="border-y border-[var(--border)] bg-[var(--bg-muted)] py-10 sm:py-14">
      <Container className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span className="eyebrow">Zona de pagos</span>
          <h2 id="pagos-band" className="mt-3 text-balance font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
            Pague la cuota y sus recaudos en un solo lugar
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-[var(--text-muted)]">Elija qué va a pagar, diligencie la planilla y termine por PSE, con sus fechas límite siempre a la vista.</p>
          <div className="mt-6">
            <NextDeadline />
          </div>
          <Link href="/pagos" className="mt-7 inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11] transition hover:bg-[var(--fg-lime-400)]">
            Entrar a la zona de pagos <ArrowRight size={16} />
          </Link>
        </div>

        <ul className="grid border-t border-[var(--border-strong)] sm:grid-cols-2 sm:gap-x-8">
          {options.map((o) => (
            <li key={o.href}>
              <Link href={o.href} className="group grid grid-cols-[2.75rem_1fr_auto] items-center gap-4 border-b border-[var(--border)] py-5 transition-colors hover:bg-[rgba(216,181,88,0.05)]">
                <span className="flex justify-center text-[var(--fg-lime-400)]"><Pictogram name={o.icon} size={34} /></span>
                <span className="min-w-0">
                  <span className="block font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{o.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--text-muted)]">{o.text}</span>
                </span>
                <ArrowRight size={18} className="text-[var(--text-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--fg-lime-400)]" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
