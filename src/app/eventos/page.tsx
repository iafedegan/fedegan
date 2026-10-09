import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventCard } from "@/components/blocks/EventCard";
import { events } from "@/content/site";

export const metadata: Metadata = { title: "Eventos" };

export default function EventosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Webinars, seminarios y foros del sector ganadero colombiano."
        image="/locales/cifras.jpg"
        imagePos="30% 50%"
        breadcrumbs={[{ label: "Eventos" }]}
      />
      <Container className="grid gap-6 py-14 sm:grid-cols-2 sm:py-20 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.slug} e={e} />
        ))}
      </Container>
    </>
  );
}
