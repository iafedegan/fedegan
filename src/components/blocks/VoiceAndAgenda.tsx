import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PresidentQuote } from "@/components/blocks/Accesos";
import { getEvents } from "@/lib/cms/content";

// Dos voces en una sola franja: la columna del presidente y los próximos eventos.
export async function VoiceAndAgenda() {
  const events = (await getEvents()).slice(0, 4);
  return (
    <section data-region="cards" className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Gremio" title="La voz del presidente y la agenda" />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <PresidentQuote />
          <div>
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">Próximos eventos</p>
            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {events.map((e) => (
                <li key={e.slug}>
                  <Link href={`/eventos/${e.slug}`} className="group grid grid-cols-[4rem_1fr] items-center gap-4 py-4">
                    <span className="flex flex-col items-center rounded-[0.6rem] border border-[var(--border-strong)] py-2 transition-colors group-hover:border-[var(--fg-lime-500)]">
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">{e.month}</span>
                      <span className="font-[var(--font-display)] text-2xl font-bold leading-none text-[var(--text)]">{e.day}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-[var(--font-display)] text-base font-bold leading-snug text-[var(--text)] sm:text-lg">
                        <span className="lnk">{e.title}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Clock size={12} /> {e.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {e.place}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/eventos" className="group mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
              Ver la agenda completa <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
