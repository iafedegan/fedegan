"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyResults, FilterToolbar } from "@/components/ui/FilterToolbar";

export interface RuleItem {
  tipo: string;
  accent: string;
  ref: string;
  title: string;
  fecha: string;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function RulesExplorer({ rules }: { rules: RuleItem[] }) {
  const [tipo, setTipo] = useState("all");
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const counts = new Map<string, number>();
    rules.forEach((r) => counts.set(r.tipo, (counts.get(r.tipo) ?? 0) + 1));
    return [{ value: "all", label: "Todas", count: rules.length }, ...[...counts].map(([value, count]) => ({ value, label: value, count }))];
  }, [rules]);

  const shown = useMemo(() => {
    const q = norm(query.trim());
    return rules.filter((r) => (tipo === "all" || r.tipo === tipo) && (!q || norm(`${r.ref} ${r.title} ${r.tipo} ${r.fecha}`).includes(q)));
  }, [rules, tipo, query]);

  const reset = () => {
    setTipo("all");
    setQuery("");
  };

  return (
    <>
      <FilterToolbar
        options={options}
        value={tipo}
        onChange={setTipo}
        query={query}
        onQuery={setQuery}
        placeholder="Buscar por número, tema o año…"
        searchLabel="Buscar normas"
        summary={`${shown.length} de ${rules.length} normas`}
      />
      {shown.length === 0 ? (
        <EmptyResults onReset={reset}>No encontramos normas con esa búsqueda.</EmptyResults>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {shown.map((r) => (
            <li key={r.ref}>
              <Card accent={r.accent} hover={false}>
                <div className="flex items-start gap-4 p-5 sm:p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                    <FileText size={20} strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge tone="neutral">{r.tipo}</Badge>
                      <span className="text-xs font-semibold tabular-nums text-[var(--text-faint)]">{r.fecha}</span>
                    </div>
                    <p className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{r.ref}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{r.title}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
