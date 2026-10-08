import Link from "next/link";
import { Clock, MapPin, CalendarPlus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { events } from "@/content/site";

export function EventsGrid() {
  return (
    <section className="py-8 sm:py-10">
      <Container>
        <SectionHeading eyebrow="Agenda" title="Eventos y agenda" action={{ label: "Ver todos los eventos", href: "/eventos" }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => (
            <Card key={e.slug} className="!flex-row items-stretch">
              <div className="w-20 shrink-0 bg-[var(--fg-green-900)] text-white flex flex-col items-center justify-center gap-0.5 py-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--fg-lime-400)]">
                  {e.month}
                </span>
                <span className="text-2xl font-extrabold font-[var(--font-display)]">{e.day}</span>
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <Badge tone="neutral" className="self-start">{e.kind}</Badge>
                <h3 className="font-bold text-[var(--text)] leading-snug">{e.title}</h3>
                <div className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {e.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={13} /> {e.place}</span>
                </div>
                <Link
                  href={`/eventos/${e.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-green-700)] hover:text-[var(--text)]"
                >
                  <CalendarPlus size={14} /> Agregar a mi calendario
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
