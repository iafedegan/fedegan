"use client";

import { useEffect, useState } from "react";

type Item = { id: string; n: string; t: string };

// Menú «En esta página»: vertical y fijo a la izquierda en pantallas grandes (resalta la sección que se está
// leyendo); en móvil queda como barra horizontal fija arriba.
export function ObservatorioNav({ items }: { items: Item[] }) {
  const [activo, setActivo] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visibles = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActivo(visibles[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl lg:hidden">
        <nav aria-label="En esta página" className="mx-auto flex max-w-[var(--container,80rem)] items-center gap-5 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={activo === s.id ? "true" : undefined} className={`shrink-0 text-sm font-semibold transition-colors hover:text-[var(--fg-lime-400)] ${activo === s.id ? "text-[var(--fg-lime-400)]" : "text-[var(--text-muted)]"}`}>
              <span className="mr-1.5 text-[var(--fg-lime-500)]">{s.n}</span>
              {s.t}
            </a>
          ))}
        </nav>
      </div>

      <nav aria-label="En esta página" className="sticky top-28 hidden self-start py-10 lg:block">
        <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">En esta página</p>
        <ul className="flex flex-col border-l border-[var(--border-strong)]">
          {items.map((s) => {
            const on = activo === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`-ml-px flex items-center gap-3 border-l-2 py-2.5 pl-4 pr-3 text-[0.95rem] font-semibold transition-colors ${on ? "border-[var(--fg-lime-500)] bg-[rgba(var(--acc-rgb,216,181,88),0.1)] text-[var(--text)]" : "border-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"}`}
                >
                  <span className={`font-data text-xs tabular-nums ${on ? "text-[var(--fg-lime-400)]" : "text-[var(--text-faint)]"}`}>{s.n}</span>
                  {s.t}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
