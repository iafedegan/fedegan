import { Container } from "@/components/ui/Container";
import { EventCard } from "@/components/blocks/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { events } from "@/content/site";

export function EventsGrid() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Agenda" title="Eventos y agenda" action={{ label: "Ver todos los eventos", href: "/eventos" }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.slug} e={e} />
          ))}
        </div>
      </Container>
    </section>
  );
}
