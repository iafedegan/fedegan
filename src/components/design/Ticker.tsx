"use client";

import type { TickerConfig } from "@/lib/design/regions";
import { useLiveDesign } from "./live";

// Cintillo de titulares con mensajes propios del editor. Se detiene si hay preferencia de movimiento reducido.
export function Ticker({ initial }: { initial: TickerConfig }) {
  const { value } = useLiveDesign(initial, (d) => d.ticker);
  const msgs = value.messages ?? [];
  if (!value.on || msgs.length === 0) return null;
  const duration = Math.max(12, msgs.join("").length * (0.42 - (value.speed ?? 5) * 0.03));
  const track = [...msgs, ...msgs];
  return (
    <div className="tk" role="region" aria-label="Avisos del portal">
      <div className="tk-track" style={{ animationDuration: `${duration}s` }}>
        {track.map((m, i) => (
          <span key={i} className="tk-item" aria-hidden={i >= msgs.length}>
            <span className="tk-dot" aria-hidden /> {m}
          </span>
        ))}
      </div>
    </div>
  );
}
