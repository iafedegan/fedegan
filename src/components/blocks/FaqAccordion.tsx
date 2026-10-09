"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Card hover={false}>
      <div className="flex flex-col divide-y divide-[var(--border)]">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[rgba(216,181,88,0.06)] sm:p-6"
              >
                <span className={`font-[var(--font-display)] text-lg font-bold ${isOpen ? "text-[var(--fg-lime-400)]" : "text-[var(--text)]"}`}>{item.q}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[rgba(216,181,88,0.12)]" : ""
                  }`}
                >
                  <ChevronDown size={16} />
                </span>
              </button>
              <div
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
  );
}
