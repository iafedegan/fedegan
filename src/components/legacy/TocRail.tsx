"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

// «En esta página»: lista de títulos que marca el apartado que se está leyendo.
export function TocRail({ items, title = "En esta página" }: { items: TocItem[]; title?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // el apartado visible más cercano al borde superior es el que se está leyendo
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className="toc-rail">
      <p>{title}</p>
      <ol>
        {items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? "location" : undefined} onClick={() => setActive(t.id)}>
              {t.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
