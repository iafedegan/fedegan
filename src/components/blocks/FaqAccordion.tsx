"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyResults, FilterToolbar } from "@/components/ui/FilterToolbar";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);
  const [query, setQuery] = useState("");
  const baseId = useId();

  const shown = useMemo(() => {
    const q = norm(query.trim());
    return q ? items.filter((i) => norm(`${i.q} ${i.a}`).includes(q)) : items;
  }, [items, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <FilterToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Buscar en las preguntas…"
        searchLabel="Buscar en las preguntas frecuentes"
        summary={searching ? `${shown.length} de ${items.length} preguntas` : undefined}
      />
      {shown.length === 0 ? (
        <EmptyResults onReset={() => setQuery("")}>No encontramos preguntas con esa búsqueda.</EmptyResults>
      ) : (
        <Card hover={false}>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {shown.map((item, i) => {
              const isOpen = searching || open === item.q;
              const panelId = `${baseId}-p${i}`;
              return (
                <div key={item.q}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(open === item.q ? null : item.q)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[rgba(216,181,88,0.06)] sm:p-6"
                    >
                      <span className={`font-[var(--font-display)] text-lg font-bold ${isOpen ? "text-[var(--fg-lime-400)]" : "text-[var(--text)]"}`}>{item.q}</span>
                      <span
                        aria-hidden
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-transform duration-300 ${
                          isOpen ? "rotate-180 bg-[rgba(216,181,88,0.12)]" : ""
                        }`}
                      >
                        <ChevronDown size={16} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 [transition-timing-function:var(--ease-lux)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-6 leading-relaxed text-[var(--text-muted)] sm:px-6">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}
