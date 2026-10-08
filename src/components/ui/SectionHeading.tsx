import { ReactNode } from "react";
import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-green-600)]">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-[1.7rem] font-bold text-[var(--text)] mt-1">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-semibold text-[var(--fg-green-700)] hover:text-[var(--text)] inline-flex items-center gap-1 group"
        >
          {action.label}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-green-600)]">
      {children}
    </span>
  );
}
