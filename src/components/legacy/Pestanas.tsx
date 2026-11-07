"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Parrafos } from "./comun";

// Textos en pestañas: se ve uno a la vez; se navega con el ratón o con las flechas del teclado.
export function Pestanas({ items }: { items: { titulo: string; texto: string }[] }) {
  const id = useId();
  const [activa, setActiva] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  const ir = (i: number) => {
    const n = (i + items.length) % items.length;
    setActiva(n);
    botones.current[n]?.focus();
  };
  const teclas = (e: KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight") ir(i + 1);
    else if (e.key === "ArrowLeft") ir(i - 1);
    else if (e.key === "Home") ir(0);
    else if (e.key === "End") ir(items.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="my-6">
      {/* En pantallas angostas las pestañas se deslizan de lado en una sola fila (no se parten en dos). */}
      <div className="border-b border-[var(--border)]">
        <div role="tablist" aria-label="Pestañas" className="flex gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => (
            <button
              key={i}
              ref={(el) => {
                botones.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-t${i}`}
              aria-selected={i === activa}
              aria-controls={`${id}-p${i}`}
              tabIndex={i === activa ? 0 : -1}
              onClick={(e) => {
                setActiva(i);
                e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
              }}
              onKeyDown={(e) => teclas(e, i)}
              className={`shrink-0 whitespace-nowrap rounded-t-[var(--radius-md)] border border-b-0 px-4 py-2.5 text-sm font-bold transition-colors ${i === activa ? "border-[var(--border)] bg-[var(--surface-solid)] text-[var(--fg-green-800)] shadow-[inset_0_3px_0_var(--fg-lime-500)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {it.titulo}
            </button>
          ))}
        </div>
      </div>
      {items.map((it, i) => (
        <div key={i} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`} hidden={i !== activa} className="py-5 leading-relaxed text-[var(--text-muted)]">
          <Parrafos texto={it.texto} />
        </div>
      ))}
    </div>
  );
}
