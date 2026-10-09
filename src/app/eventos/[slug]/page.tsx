import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarPlus, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { events, eventAccents } from "@/content/site";

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
  const accent = eventAccents[event.kind] ?? "216,181,88";

  return (
    <>
      <PageHeader
        eyebrow={event.kind}
        title={event.title}
        breadcrumbs={[{ label: "Eventos", href: "/eventos" }, { label: event.kind }]}
      />
      <Container className="max-w-3xl py-14 sm:py-20">
        <Card accent={accent} hover={false}>
          <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[rgba(var(--acc-rgb),0.45)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
              <span className="text-xs font-bold uppercase tracking-[0.16em]">{event.month}</span>
              <span className="font-[var(--font-display)] text-5xl font-bold leading-none text-[var(--text)]">{event.day}</span>
            </div>
            <div className="flex flex-col gap-3">
              <Badge tone="neutral" className="self-start">{event.kind}</Badge>
              <p className="flex items-center gap-2 text-[var(--text-muted)]"><Clock size={16} className="text-[rgb(var(--acc-rgb))]" /> {event.time}</p>
              <p className="flex items-center gap-2 text-[var(--text-muted)]"><MapPin size={16} className="text-[rgb(var(--acc-rgb))]" /> {event.place}</p>
            </div>
          </div>
        </Card>
        <p className="mt-8 text-lg leading-relaxed text-[var(--text-muted)]">
          Espacio organizado por FEDEGÁN–FNG dirigido a productores, técnicos y aliados del sector ganadero. Cupos limitados; se recomienda inscripción previa.
        </p>
        <Button className="mt-8">
          <CalendarPlus size={16} /> Agregar a mi calendario
        </Button>
      </Container>
    </>
  );
}
