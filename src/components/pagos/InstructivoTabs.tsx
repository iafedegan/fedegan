"use client";

import { useState } from "react";
import { importante, instructivos, type Paso } from "@/content/pagos";

type Clave = keyof typeof instructivos;

function Lista({ items }: { items: Paso["items"] }) {
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {items.map((it, i) =>
        typeof it === "string" ? (
          <li key={i} className="relative pl-5 leading-relaxed text-[var(--text-muted)] before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--fg-lime-500)]">
            {it}
          </li>
        ) : (
          <li key={i} className="mt-1">
            <p className="font-semibold text-[var(--text)]">{it.titulo}</p>
            <Lista items={it.items} />
          </li>
        ),
      )}
    </ul>
  );
}

// Instructivo paso a paso del botón de pago PSE, uno para leche y otro para carne.
export function InstructivoTabs() {
  const [tab, setTab] = useState<Clave>("leche");
  const data = instructivos[tab];
  return (
    <div>
      <div role="tablist" aria-label="Concepto del recaudo" className="inline-flex rounded-[0.25rem] border border-[var(--border-strong)] p-1">
        {(Object.keys(instructivos) as Clave[]).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-[0.25rem] px-6 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition-colors ${tab === k ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
          >
            {instructivos[k].titulo}
          </button>
        ))}
      </div>

      <ol className="mt-7 grid gap-x-12 gap-y-9 lg:grid-cols-2">
        {data.pasos.map((p) => (
          <li key={p.titulo} className="border-t border-[var(--border-strong)] pt-4">
            <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--fg-lime-400)]">{p.titulo}</h3>
            <Lista items={p.items} />
          </li>
        ))}
      </ol>

      <p className="mt-9 border-l-2 border-[var(--fg-lime-500)] pl-4 text-sm font-semibold leading-relaxed text-[var(--text)]">
        <span className="mr-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">Importante</span>
        {importante}
      </p>
    </div>
  );
}
