"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserCircle2, Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { mainNav } from "@/content/site";
import { Container } from "@/components/ui/Container";

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/buscador?q=${encodeURIComponent(query.trim())}`);
    else router.push("/buscador");
  }

  return (
    <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur border-b border-[var(--border)]">
      <Container className="py-3.5 flex items-center gap-4 sm:gap-6">
        <Logo />

        <div className="hidden md:flex flex-1 max-w-md">
          <form
            role="search"
            onSubmit={submitSearch}
            className="flex w-full items-center rounded-[var(--radius-pill)] border border-[var(--border-strong)] bg-[var(--bg-muted)] px-4 py-2 focus-within:border-[var(--fg-green-600)] focus-within:shadow-[0_0_0_4px_rgba(28,122,66,0.12)] transition-shadow"
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué está buscando?"
              aria-label="Buscar en el portal"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-faint)]"
            />
            <button type="submit" aria-label="Buscar" className="text-[var(--fg-green-700)]">
              <Search size={18} />
            </button>
          </form>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[var(--text)]">
          <UserCircle2 size={20} />
          Iniciar sesión
          <ChevronDown size={14} />
        </div>

        <button
          className="md:hidden ml-auto text-[var(--fg-green-800)]"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </Container>

      <nav
        className="hidden md:block border-t border-[var(--border)] bg-[var(--bg-muted)]"
        aria-label="Navegación principal"
      >
        <Container className="flex items-center gap-6 overflow-x-auto py-2.5 text-sm font-semibold text-[var(--text)]">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-green-800)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface-solid)]">
          <Container className="py-4 flex flex-col gap-1">
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-[var(--radius-pill)] border border-[var(--border-strong)] bg-[var(--bg-muted)] px-4 py-2.5 mb-3"
            >
              <input
                type="search"
                placeholder="¿Qué está buscando?"
                aria-label="Buscar en el portal"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <Search size={18} className="text-[var(--fg-green-700)]" />
            </form>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2.5 text-[0.95rem] font-semibold text-[var(--text)] border-b border-[var(--border)] last:border-0"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/mi-fedegan"
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--text)]"
            >
              <UserCircle2 size={20} />
              Iniciar sesión
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
