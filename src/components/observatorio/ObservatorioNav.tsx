"use client";

import { useEffect, useState } from "react";

type Item = { id: string; n: string; t: string };

// Menú «En esta página»: vertical y fijo a la izquierda en pantallas grandes (resalta la sección que se está
// leyendo); en móvil queda como barra horizontal fija arriba.
export function ObservatorioNav({ items }: { items: Item[] }) {
  const [activo, setActivo] = useState(items[0]?.id ?? "");

  useEffect(() => {
    // Activa la última sección cuyo borde superior ya pasó el 30 % de la pantalla.
    const onScroll = () => {
      let actual = items[0]?.id ?? "";
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) actual = i.id;
      }
      setActivo(actual);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl lg:top-[4.5rem]">
        <nav aria-label="En esta página" className="mx-auto flex max-w-[var(--container,80rem)] items-center gap-5 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={activo === s.id ? "true" : undefined} className={`shrink-0 text-sm font-semibold transition-colors hover:text-[var(--fg-lime-400)] ${activo === s.id ? "text-[var(--fg-lime-400)]" : "text-[var(--text-muted)]"}`}>
              <span className="mr-1.5 text-[var(--fg-lime-400)]">{s.n}</span>
              {s.t}
            </a>
          ))}
        </nav>
      </div>

    </>
  );
}
