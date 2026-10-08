import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, MapPin, CalendarPlus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { events } from "@/content/site";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  return { title: event?.title ?? "Evento" };
}

export default async function EventoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <>
      <PageHeader
        eyebrow={event.kind}
        title={event.title}
        breadcrumbs={[{ label: "Eventos", href: "/eventos" }, { label: event.kind }]}
      />
      <Container className="py-12 max-w-2xl flex flex-col gap-6">
        <Badge tone="neutral" className="self-start">{event.kind}</Badge>
        <div className="flex flex-col gap-2 text-[var(--text-muted)]">
          <span className="flex items-center gap-2"><Clock size={16} className="text-[var(--fg-green-700)]" /> {event.time}</span>
          <span className="flex items-center gap-2"><MapPin size={16} className="text-[var(--fg-green-700)]" /> {event.place}</span>
        </div>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Espacio organizado por FEDEGÁN–FNG dirigido a productores, técnicos y aliados del sector
          ganadero. Cupos limitados; se recomienda inscripción previa.
        </p>
        <Button className="self-start">
          <CalendarPlus size={16} /> Agregar a mi calendario
        </Button>
      </Container>
    </>
  );
}
