"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, Building2, LogIn, LogOut, Menu, Search, Sprout, UserCircle2, X } from "lucide-react";
import { Logo } from "./Logo";
import { LoginMenu } from "./LoginMenu";
import { mainNav } from "@/content/site";
import { Container } from "@/components/ui/Container";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  // El menú móvil queda abierto solo para la ruta en que se abrió: al navegar se cierra solo.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/buscador?q=${encodeURIComponent(q)}` : "/buscador");
    setOpenAt(null);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled || open
          ? "border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]"
          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)]"
      }`}
    >
      <Container className="flex items-center gap-3 py-3.5 sm:gap-6">
        <Logo />

        <form
          role="search"
          onSubmit={submitSearch}
          className="group mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted)] py-1.5 pl-4 pr-1.5 transition focus-within:border-[var(--fg-lime-500)] focus-within:shadow-[0_0_0_4px_rgba(216,181,88,0.14)] md:flex"
        >
          <Search size={17} className="shrink-0 text-[var(--text-faint)] transition-colors group-focus-within:text-[var(--fg-lime-400)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué está buscando?"
            aria-label="Buscar en el portal"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--fg-lime-500)] px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-green-900)] transition-colors hover:bg-[var(--fg-lime-400)]"
          >
            Buscar
          </button>
        </form>

        <LoginMenu />

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpenAt(open ? null : pathname)}
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)] md:ml-0 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <nav className="hidden border-t border-[var(--border)] bg-[var(--bg-muted)] lg:block" aria-label="Navegación principal">
        <Container className="flex items-center gap-1 overflow-x-auto py-1.5 text-sm font-semibold [scrollbar-width:none] [&>:first-child]:ml-auto [&>:last-child]:mr-auto">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-2 transition-colors after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:bg-[var(--fg-lime-500)] after:transition-transform after:duration-300 hover:text-[var(--fg-lime-400)] hover:after:scale-x-100 ${
                  active ? "text-[var(--fg-lime-400)] after:scale-x-100" : "text-[var(--text)] after:scale-x-0"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </nav>

      {open && (
        <div
          id="menu-movil"
          className="menu-sheet absolute inset-x-0 top-full max-h-[calc(100dvh-4.4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[var(--bg)] lg:hidden"
        >
          <Container className="flex flex-col gap-7 py-6">
            <form
              role="search"
              onSubmit={submitSearch}
              className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted)] py-1.5 pl-4 pr-1.5 focus-within:border-[var(--fg-lime-500)] md:hidden"
            >
              <Search size={18} className="shrink-0 text-[var(--text-faint)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué está buscando?"
                aria-label="Buscar en el portal"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[var(--text-faint)] [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--fg-lime-500)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--fg-green-900)]"
              >
                Buscar
              </button>
            </form>

            <nav aria-label="Navegación móvil">
              <ul className="flex flex-col">
                {mainNav.map((item, i) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href} className="border-b border-[var(--border)] last:border-0">
                      <Link
                        href={item.href}
                        onClick={() => setOpenAt(null)}
                        aria-current={active ? "page" : undefined}
                        className="group flex min-h-14 items-center gap-4 py-2"
                      >
                        <span className="w-6 font-mono text-[0.7rem] text-[var(--fg-lime-500)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`font-[var(--font-display)] text-xl font-semibold ${active ? "text-[var(--fg-lime-400)]" : "text-[var(--text)]"}`}>
                          {item.label}
                        </span>
                        <ArrowRight size={18} className="ml-auto text-[var(--text-faint)] transition-transform duration-300 group-active:translate-x-1" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="gl">
              <div className="gl-face gap-4 p-5">
                {user ? (
                  <>
                    <p className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <UserCircle2 size={18} className="text-[var(--fg-lime-400)]" /> {user.email ?? user.name}
                    </p>
                    <Link
                      href="/mi-fedegan"
                      onClick={() => setOpenAt(null)}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)]"
                    >
                      Mi FEDEGÁN
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ redirectTo: "/" })}
                      className="flex min-h-11 items-center justify-center gap-2 text-sm text-[var(--text-muted)]"
                    >
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/ingresar"
                      onClick={() => setOpenAt(null)}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)]"
                    >
                      <LogIn size={17} /> Iniciar sesión
                    </Link>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Link
                        href="/ingresar#ganaderos"
                        onClick={() => setOpenAt(null)}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 text-center font-semibold text-[var(--text)]"
                      >
                        <Sprout size={16} className="shrink-0 text-[var(--fg-lime-400)]" /> Ganaderos
                      </Link>
                      <Link
                        href="/ingresar#funcionarios"
                        onClick={() => setOpenAt(null)}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3 text-center font-semibold text-[var(--text)]"
                      >
                        <Building2 size={16} className="shrink-0 text-[var(--fg-lime-400)]" /> Funcionarios
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
