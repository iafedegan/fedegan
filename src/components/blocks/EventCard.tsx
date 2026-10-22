import { WaveCard, type WaveAccent } from "@/components/ui/WaveCard";
import type { Evento } from "@/lib/cms/content";

const WAVES: Record<string, WaveAccent> = { Webinar: "turquesa", Seminario: "oro", Foro: "terracota" };

// Evento como ficha con ola: la fecha en grande arriba; al pasar el cursor, la hora y el lugar.
export function EventCard({ e, cta = "Ver evento" }: { e: Evento; cta?: string }) {
  return (
    <WaveCard
      href={`/eventos/${e.slug}`}
      accent={WAVES[e.kind] ?? "esmeralda"}
      glyph={
        <>
          <small>{e.month}</small>
          {e.day}
        </>
      }
      title={e.title}
      tags={[e.kind]}
      text={`${e.time} · ${e.place}`}
      cta={cta}
    />
  );
}
