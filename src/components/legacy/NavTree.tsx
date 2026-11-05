"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";

export type NavItem = { label: string; href?: string; external?: boolean; key?: string; children?: NavItem[] };

const holds = (n: NavItem, key: string): boolean => n.key === key || Boolean(n.children?.some((c) => holds(c, key)));

// Menú lateral de una sección: todas las ramas se pueden desplegar y recoger; la de la página actual arranca abierta.
export function NavTree({ nodes, current, depth = 0 }: { nodes: NavItem[]; current: string; depth?: number }) {
  return (
    <ul className={depth === 0 ? "flex flex-col" : "mt-0.5 flex flex-col border-l border-[var(--border)] pl-3"}>
      {nodes.map((n, i) => (
        <NavRow key={`${n.label}-${i}`} node={n} current={current} depth={depth} />
      ))}
    </ul>
  );
}

function NavRow({ node: n, current, depth }: { node: NavItem; current: string; depth: number }) {
  const hasKids = Boolean(n.children?.length);
  const [open, setOpen] = useState(() => hasKids && holds(n, current));
  const active = n.key === current;
  const cls = `block min-w-0 flex-1 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm leading-snug transition-colors ${
    active ? "bg-[rgba(216,181,88,0.12)] font-bold text-[var(--fg-lime-400)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
  }`;
  return (
    <li>
      <div className="flex items-start">
        {n.href && n.external ? (
          <a href={n.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {n.label} <ExternalLink size={12} aria-hidden className="ml-0.5 inline -translate-y-px" />
          </a>
        ) : n.href ? (
          <Link href={n.href} className={cls} aria-current={active ? "page" : undefined}>
            {n.label}
          </Link>
        ) : (
          <span className="block min-w-0 flex-1 px-2.5 py-1.5 text-sm font-bold text-[var(--text)]">{n.label}</span>
        )}
        {hasKids && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Recoger" : "Desplegar"} ${n.label}`}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--fg-lime-400)]"
          >
            <ChevronRight size={16} className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {hasKids && open && <NavTree nodes={n.children!} current={current} depth={depth + 1} />}
    </li>
  );
}
