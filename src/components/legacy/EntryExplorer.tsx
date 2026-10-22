"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

export type ExplorerEntry = {
  title: string;
  href: string;
  /** Código del documento, p. ej. «PE-0047-2021». */
  code?: string;
  desc: string;
  meta: [string, string][];
};

function Go({ entry, children, className }: { entry: ExplorerEntry; children: React.ReactNode; className: string }) {
  return entry.href.startsWith("/") ? (
    <Link href={entry.href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const meta = (e: ExplorerEntry, k: RegExp) => e.meta.find(([n]) => k.test(n))?.[1];

// Ficha de publicación: año en grande, título, autores y un extracto; toda la ficha es el enlace.
function Card({ e }: { e: ExplorerEntry }) {
  const year = meta(e, /^a[ñn]o$/i);
  const pages = meta(e, /^p[áa]ginas$/i);
  const autor = meta(e, /^autor/i);
  return (
    <Go entry={e} className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-[0.9rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-6 pl-7 transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-[var(--fg-lime-500)] hover:shadow-[0_26px_44px_-28px_rgba(0,0,0,0.85)]">
      <span aria-hidden className="absolute bottom-6 left-0 top-6 w-[3px] rounded-r bg-[var(--fg-lime-500)] opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-[var(--font-display)] text-3xl font-bold leading-none text-[var(--fg-lime-400)]">{year ?? e.code ?? "—"}</span>
        {pages && <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">{pages} págs.</span>}
      </div>
      <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{e.title}</h3>
      {autor && <p className="line-clamp-2 text-sm leading-snug text-[var(--text-muted)]">{autor}</p>}
      {e.desc && <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-faint)]">{e.desc}</p>}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
        Ver más <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Go>
  );
}

// Fila de documento: código, título y extracto en una línea de lectura; pensada para listas largas.
function Row({ e }: { e: ExplorerEntry }) {
  return (
    <li>
      <Go entry={e} className="group grid grid-cols-[1fr_auto] items-start gap-4 border-b border-[var(--border)] px-2 py-4 transition-colors hover:bg-[rgba(216,181,88,0.06)] sm:grid-cols-[8.5rem_1fr_auto] sm:gap-6">
        <span className="hidden pt-1 sm:block">
          {e.code && <span className="inline-block rounded-[0.3rem] border border-[var(--border-strong)] px-2 py-1 text-[0.7rem] font-bold tracking-[0.06em] text-[var(--fg-lime-400)]">{e.code}</span>}
        </span>
        <span className="min-w-0">
          {e.code && <span className="mb-1 block text-[0.68rem] font-bold tracking-[0.08em] text-[var(--fg-lime-500)] sm:hidden">{e.code}</span>}
          <span className="block font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{e.title}</span>
          {e.desc && <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-[var(--text-muted)]">{e.desc}</span>}
        </span>
        <span className="pt-1 text-[var(--text-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--fg-lime-400)]">
          {e.href.startsWith("/") ? <ArrowRight size={18} /> : <ArrowUpRight size={18} />}
        </span>
      </Go>
    </li>
  );
}

const PAGE = 20;

// Lista de documentos con buscador: fichas cuando son pocas, filas cuando son muchas.
export function EntryExplorer({ entries }: { entries: ExplorerEntry[] }) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const cards = entries.length <= 12 && entries.some((e) => e.meta.length > 0);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? entries.filter((e) => `${e.code ?? ""} ${e.title} ${e.desc} ${e.meta.map((m) => m[1]).join(" ")}`.toLowerCase().includes(t)) : entries;
  }, [q, entries]);

  return (
    <div className="my-6">
      {entries.length > 6 && (
        <label className="mb-4 flex max-w-xl items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-2.5 focus-within:border-[var(--fg-lime-500)]">
          <Search size={17} className="shrink-0 text-[var(--text-faint)]" />
          <input
            type="search"
            value={q}
            onChange={(ev) => {
              setQ(ev.target.value);
              setShown(PAGE);
            }}
            placeholder={`Buscar entre ${entries.length} documentos…`}
            aria-label="Buscar en la lista"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--text-faint)] [&::-webkit-search-cancel-button]:hidden"
          />
          {q && <span className="shrink-0 text-xs font-semibold text-[var(--text-faint)]">{list.length}</span>}
        </label>
      )}

      {list.length === 0 ? (
        <p className="rounded-[0.9rem] border border-dashed border-[var(--border-strong)] p-6 text-[var(--text-muted)]">No hay documentos que coincidan con «{q}».</p>
      ) : cards ? (
        <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((e) => (
            <li key={e.href + e.title}>
              <Card e={e} />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="border-t border-[var(--border-strong)]">
            {list.slice(0, shown).map((e) => (
              <Row key={e.href + e.title} e={e} />
            ))}
          </ul>
          {list.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-5 rounded-[0.4rem] border border-[var(--fg-lime-500)] px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)] transition hover:bg-[var(--fg-lime-500)] hover:text-[#0a1a11]">
              Mostrar más · {list.length - shown} restantes
            </button>
          )}
        </>
      )}
    </div>
  );
}
