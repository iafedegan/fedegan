"use client";

import { useState } from "react";
import { featuredNews } from "@/content/site";
import { Badge } from "@/components/ui/Badge";

type Layout = "grid" | "list" | "showcase";

const layouts: { id: Layout; label: string }[] = [
  { id: "grid", label: "Vitrina (grid 3 columnas)" },
  { id: "list", label: "Lista editorial" },
  { id: "showcase", label: "Destacado + secundarios" },
];

export function LayoutSwitchDemo() {
  const [layout, setLayout] = useState<Layout>("grid");
  const items = featuredNews;

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 bg-[var(--bg-muted)] border-b border-[var(--border)]">
        {layouts.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayout(l.id)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-[var(--radius-pill)] border transition-colors ${
              layout === l.id
                ? "bg-[var(--fg-green-700)] text-[var(--on-accent)] border-[var(--fg-green-700)]"
                : "bg-[var(--surface-solid)] text-[var(--text-muted)] border-[var(--border-strong)] hover:border-[var(--fg-green-600)]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {layout === "grid" && (
          <div className="grid sm:grid-cols-3 gap-5">
            {items.map((n) => (
              <div key={n.slug} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 flex flex-col gap-2">
                <Badge tone="lime">{n.section}</Badge>
                <h4 className="font-bold text-sm text-[var(--text)] leading-snug">{n.title}</h4>
                <span className="text-xs text-[var(--text-faint)]">{n.date}</span>
              </div>
            ))}
          </div>
        )}

        {layout === "list" && (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {items.map((n, i) => (
              <div key={n.slug} className="flex items-start gap-4 py-4">
                <span className="font-[var(--font-display)] text-lg text-[var(--fg-lime-500)] w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="text-xs font-semibold text-[var(--fg-green-600)] uppercase tracking-wide">{n.section}</span>
                  <h4 className="font-bold text-[var(--text)] leading-snug">{n.title}</h4>
                  <span className="text-xs text-[var(--text-faint)]">{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {layout === "showcase" && (
          <div className="grid sm:grid-cols-[1.4fr_1fr] gap-5">
            <div className="rounded-[var(--radius-md)] bg-[var(--fg-green-900)] text-white p-6 flex flex-col gap-2 justify-end min-h-[220px]">
              <Badge tone="lime">{items[0].section}</Badge>
              <h3 className="font-bold text-xl leading-snug">{items[0].title}</h3>
              <span className="text-xs text-white/60">{items[0].date}</span>
            </div>
            <div className="flex flex-col gap-3">
              {items.slice(1).map((n) => (
                <div key={n.slug} className="rounded-[var(--radius-md)] border border-[var(--border)] p-3.5 flex flex-col gap-1.5">
                  <span className="text-[0.68rem] font-bold text-[var(--fg-green-600)] uppercase">{n.section}</span>
                  <h4 className="font-semibold text-sm text-[var(--text)] leading-snug">{n.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
