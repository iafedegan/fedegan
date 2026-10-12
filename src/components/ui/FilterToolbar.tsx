"use client";

import { Search, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Barra de filtros de las listas: chips por categoría y, opcionalmente, un buscador.
export function FilterToolbar({
  options,
  value,
  onChange,
  query,
  onQuery,
  placeholder = "Buscar…",
  searchLabel = "Buscar",
  summary,
}: {
  options?: FilterOption[];
  value?: string;
  onChange?: (v: string) => void;
  query?: string;
  onQuery?: (q: string) => void;
  placeholder?: string;
  searchLabel?: string;
  summary?: string;
}) {
  const hasChips = Boolean(options && options.length > 1 && onChange);
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
      {options && options.length > 1 && onChange && (
        <div role="group" aria-label="Filtrar por categoría" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(o.value)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors pointer-coarse:min-h-11 ${
                  active
                    ? "border-transparent bg-[var(--fg-lime-500)] text-[var(--on-accent)]"
                    : "border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {o.label}
                {o.count !== undefined && <span className={`tabular-nums ${active ? "opacity-80" : "text-[var(--text-faint)]"}`}>{o.count}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className={`flex items-center gap-4 ${hasChips ? "lg:w-[22rem] lg:flex-none" : "w-full max-w-md"}`}>
        {onQuery && (
          <label className="relative flex-1">
            <span className="sr-only">{searchLabel}</span>
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              type="search"
              value={query ?? ""}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={placeholder}
              className="h-11 w-full rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted)] pl-10 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--fg-lime-500)] focus:outline-none focus:ring-4 focus:ring-[rgba(216,181,88,0.14)]"
            />
            {query && (
              <button
                type="button"
                aria-label="Borrar búsqueda"
                onClick={() => onQuery("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
              >
                <X size={15} />
              </button>
            )}
          </label>
        )}
      </div>
      {summary && (
        <p role="status" aria-live="polite" className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-faint)] lg:hidden">
          {summary}
        </p>
      )}
    </div>
  );
}

export function EmptyResults({ onReset, children }: { onReset: () => void; children?: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8 text-center text-[var(--text-muted)]">
      <p>{children ?? "No hay resultados con esos filtros."}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-semibold text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
