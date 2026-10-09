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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
        >
          {action.label}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}
