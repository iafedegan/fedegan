"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/blocks/EventCard";
import { EmptyResults, FilterToolbar } from "@/components/ui/FilterToolbar";
import type { Evento } from "@/lib/cms/content";

export function EventsExplorer({ events }: { events: Evento[] }) {
  const [kind, setKind] = useState("all");

  const options = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1));
    return [{ value: "all", label: "Todos", count: events.length }, ...[...counts].map(([value, count]) => ({ value, label: value, count }))];
  }, [events]);

  const shown = kind === "all" ? events : events.filter((e) => e.kind === kind);

  return (
    <>
      <FilterToolbar options={options} value={kind} onChange={setKind} summary={`${shown.length} de ${events.length} eventos`} />
      {shown.length === 0 ? (
        <EmptyResults onReset={() => setKind("all")}>No hay eventos de este tipo.</EmptyResults>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <EventCard key={e.slug} e={e} />
          ))}
        </div>
      )}
    </>
  );
}
