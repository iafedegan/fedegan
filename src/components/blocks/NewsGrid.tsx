import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHomeNews } from "@/lib/contexto";

// Últimas noticias en formato editorial: una nota grande y una lista con las siguientes.
export async function NewsGrid() {
  const { latest } = await getHomeNews();
  if (latest.length === 0) return null;
  const [lead, ...rest] = latest;

  return (
    <section data-region="cards" className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Actualidad" title="Últimas noticias" action={{ label: "Todas las noticias", href: "/noticias" }} />
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <Link href={`/noticias/${lead.slug}`} className="group block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg-sunken)]">
              {lead.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lead.image} alt={lead.imageAlt ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.04]" />
              )}
            </div>
            <p className="mt-5 flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">
              {lead.section} <span aria-hidden className="h-px w-6 bg-current opacity-60" /> <span className="text-[var(--text-faint)]">{lead.date}</span>
            </p>
            <h3 className="mt-2 text-balance font-[var(--font-display)] text-2xl font-bold leading-[1.15] text-[var(--text)] sm:text-[2rem]">
              <span className="lnk">{lead.title}</span>
            </h3>
            <p className="mt-3 line-clamp-3 max-w-2xl leading-relaxed text-[var(--text-muted)]">{lead.dek}</p>
          </Link>

          <ul className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)] self-start">
            {rest.slice(0, 5).map((n) => (
              <li key={n.slug}>
                <Link href={`/noticias/${n.slug}`} className="group grid grid-cols-[5.5rem_1fr] gap-4 py-4 sm:grid-cols-[7rem_1fr]">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[0.25rem] bg-[var(--bg-sunken)]">
                    {n.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-110" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">{n.section}</span>
                    <span className="mt-1 block font-[var(--font-display)] text-base font-bold leading-snug text-[var(--text)] sm:text-lg">
                      <span className="lnk">{n.title}</span>
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-faint)]">{n.date}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/noticias" className="group flex items-center justify-between py-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
                Ver todas las noticias <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
