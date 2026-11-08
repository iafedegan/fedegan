"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export type HubLink = { label: string; href?: string; external?: boolean; children?: HubLink[] };

function Items({ items }: { items: HubLink[] }) {
  return (
    <ul className="hub-sub">
      {items.map((it, i) => (
        <li key={`${it.label}-${i}`}>
          {it.href ? (
            it.external ? (
              <a href={it.href} target="_blank" rel="noopener noreferrer">{it.label}</a>
            ) : (
              <Link href={it.href}>{it.label}</Link>
            )
          ) : (
            <span className="hub-sub-h">{it.label}</span>
          )}
          {it.children && it.children.length > 0 && <Items items={it.children} />}
        </li>
      ))}
    </ul>
  );
}

// Ficha que se despliega: al hacer clic muestra la lista de páginas que hay dentro.
export function HubExpand({ head, text, count, href, items }: { head: ReactNode; text?: string; count: number; href?: string; items: HubLink[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="hub-wrap">
      <div className={`hub-cell hub-exp ${open ? "is-open" : ""}`}>
      <button type="button" className="hub-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {head}
        {text && <span className="hub-text">{text}</span>}
        <span className="hub-foot">
          {count} {count === 1 ? "página" : "páginas"}
          <ChevronDown size={16} aria-hidden className="hub-chev" />
        </span>
      </button>
      </div>
      <div id={id} className="hub-panel" hidden={!open}>
        {href && (
          <Link href={href} className="hub-open">
            Abrir esta página <ArrowRight size={14} aria-hidden />
          </Link>
        )}
        <Items items={items} />
      </div>
    </div>
  );
}
