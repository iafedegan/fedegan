import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getPartners } from "@/lib/cms/content";

export async function PortalesAliados() {
  const portales = await getPartners();
  if (!portales.length) return null;
  return (
    <section aria-labelledby="portales-title" className="relative z-10">
      <Container>
        <div className="px-4 py-12 sm:px-8">
          <h2
            id="portales-title"
            className="mb-7 text-center text-sm font-bold uppercase tracking-[0.22em] text-[var(--fg-lime-500)]"
          >
            Portales aliados
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {portales.map((p) => (
              <li key={p.nombre}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 text-center outline-none"
                >
                  <span className="relative block h-28 w-28 overflow-hidden rounded-full border border-[var(--border-strong)] shadow-[0_18px_30px_-16px_rgba(0,0,0,0.7)] transition-all duration-500 [transition-timing-function:var(--ease-lux)] group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:shadow-[0_24px_36px_-14px_rgba(216,181,88,0.45)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--focus-ring)] sm:h-32 sm:w-32">
                    <Image src={p.logo} alt={`Logo de ${p.nombre}`} width={286} height={285} className="h-full w-full object-cover" />
                  </span>
                  <span className="flex flex-col items-center leading-tight">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text)]">
                      {p.nombre}
                      <ArrowUpRight size={13} className="text-[var(--text-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-xs text-[var(--text-faint)]">{p.detalle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
