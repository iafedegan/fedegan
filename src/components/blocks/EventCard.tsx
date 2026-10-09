import Link from "next/link";
import { CalendarPlus, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { eventAccents, type events } from "@/content/site";

type Evento = (typeof events)[number];

export function EventCard({ e, cta = "Ver evento" }: { e: Evento; cta?: string }) {
  const accent = eventAccents[e.kind] ?? "216,181,88";
  return (
    <Link href={`/eventos/${e.slug}`} className="group block h-full">
      <Card accent={accent}>
        <div className="flex flex-1">
          <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-[rgba(var(--acc-rgb),0.25)] bg-[rgba(var(--acc-rgb),0.12)] py-6 text-[rgb(var(--acc-rgb))]">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em]">{e.month}</span>
            <span className="font-[var(--font-display)] text-4xl font-bold leading-none text-[var(--text)]">{e.day}</span>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-5">
            <Badge tone="neutral" className="self-start">{e.kind}</Badge>
            <h3 className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{e.title}</h3>
            <div className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><Clock size={13} /> {e.time}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {e.place}</span>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
              <CalendarPlus size={14} /> {cta}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
