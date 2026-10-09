import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MallRibbon } from "./MallRibbon";
import { MallArt } from "./MallArt";
import { pisos } from "@/content/site";

export function MallDirectory({ showLink = true }: { showLink?: boolean }) {
  return (
    <section data-theme="esmeralda" aria-labelledby="locales-title" className="mr-stage py-16 sm:py-24">
      <div className="relative flex flex-col gap-14">
        {pisos.map((piso, p) => (
          <div key={piso.id} className="flex flex-col gap-10">
            <Container className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--fg-lime-500)]">
                  <span className="h-px w-6 bg-[var(--fg-lime-500)]" />
                  Directorio del portal
                </span>
                <h2 id={p === 0 ? "locales-title" : undefined} className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-[1.08] text-[var(--text)] sm:text-5xl">
                  {piso.nombre}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{piso.descripcion}</p>
              </div>
              {showLink && p === 0 && (
                <Link
                  href="/directorio"
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
                >
                  Ver directorio completo
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </Container>

            <MallRibbon
              locales={piso.locales}
              arts={piso.locales.map((l, i) => (
                <MallArt key={l.id} seed={i * 1.7 + 0.6} />
              ))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
