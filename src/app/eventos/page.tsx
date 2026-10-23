import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventsExplorer } from "@/components/blocks/EventsExplorer";
import { getEvents } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Eventos" };

export default async function EventosPage() {
  const events = await getEvents();
  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Webinars, seminarios y foros del sector ganadero colombiano."
        image="/headers/ia-eventos.jpg"
        imagePos="50% 50%"
        meta={`${events.length} ${events.length === 1 ? "evento" : "eventos"}`}
        breadcrumbs={[{ label: "Eventos" }]}
      />
      <Container className="py-5 sm:py-8">
        <EventsExplorer events={events} />
      </Container>
    </>
  );
}
