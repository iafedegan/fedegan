"use client";

import { useState } from "react";
import type { Indicador } from "@/lib/observatorio";
import { IndicatorChart } from "./IndicatorChart";

// Varios indicadores de un mismo tema con pestañas; cada uno con su propia gráfica interactiva.
export function IndicatorTabs({ indicadores }: { indicadores: Indicador[] }) {
  const [i, setI] = useState(0);
  if (!indicadores.length) return null;
  const ind = indicadores[Math.min(i, indicadores.length - 1)];
  return (
    <div>
      {indicadores.length > 1 && (
        <div role="tablist" aria-label="Indicador" className="flex flex-wrap gap-x-1 gap-y-1 border-b border-[var(--border-strong)]">
          {indicadores.map((x, k) => (
            <button
              key={x.clave}
              role="tab"
              type="button"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`relative px-4 py-3 text-sm font-bold transition-colors ${k === i ? "text-[var(--fg-lime-400)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {x.titulo}
              <span aria-hidden className={`absolute inset-x-3 -bottom-px h-[2px] bg-[var(--fg-lime-500)] transition-transform duration-300 ${k === i ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          ))}
        </div>
      )}
      <div className="mt-5">
        <p className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{ind.titulo}</p>
        {ind.descripcion && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{ind.descripcion}</p>}
        <div className="mt-4">
          <IndicatorChart key={ind.clave} ind={ind} />
        </div>
      </div>
    </div>
  );
}
