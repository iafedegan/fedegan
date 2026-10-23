"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, ChevronDown, LogIn, LogOut, Menu, Search, UserCircle2, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LoginMenu } from "./LoginMenu";
import { Container } from "@/components/ui/Container";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// Primeras opciones visibles según el ancho; el resto va en «Más».
const visibleFrom = (i: number) => (i < 3 ? "" : i < 6 ? "hidden xl:block" : "hidden");
const inMoreOnlyBelow = (i: number) => (i < 6 ? "xl:hidden" : "");

function MoreMenu({ items, pathname }: { items: { label: string; href: string }[]; pathname: string }) {
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const extra = items.slice(3);
  if (!extra.length) return null;
  const activeInside = extra.some((it) => isActive(pathname, it.href));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpenAt(open ? null : pathname)}
        className={`nv-link flex items-center gap-1.5 ${activeInside || open ? "text-[var(--fg-lime-400)]" : ""}`}
      >
        Más <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] py-2 shadow-[var(--shadow-lg)]"
        >
          {extra.map((it, k) => {
            return (
              <li key={it.href} role="none" className={inMoreOnlyBelow(k + 3)}>
                <Link
                  href={it.href}
                  role="menuitem"
                  onClick={() => setOpenAt(null)}
                  aria-current={isActive(pathname, it.href) ? "page" : undefined}
                  className={`block px-5 py-2.5 text-[0.74rem] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--fg-lime-400)] ${
                    isActive(pathname, it.href) ? "text-[var(--fg-lime-400)]" : "text-[var(--text)]"
                  }`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Header({ nav: mainNav }: { nav: { label: string; href: string }[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  // El menú móvil queda abierto solo para la ruta en que se abrió: al navegar se cierra solo.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [pillOpen, setPillOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMenu = () => setOpenAt((cur) => (cur === pathname ? null : pathname));
    window.addEventListener("fedegan:menu", onMenu);
    return () => window.removeEventListener("fedegan:menu", onMenu);
  }, [pathname]);

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

  const searchForm = (cls: string) => (
    <form
      role="search"
      onSubmit={submitSearch}
      className={`group items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted)] py-1.5 pl-4 pr-1.5 transition focus-within:border-[var(--fg-lime-500)] focus-within:shadow-[0_0_0_4px_rgba(216,181,88,0.14)] ${cls}`}
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
  );

  return (
    <header
      data-region="navbar"
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled || open
          ? "border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]"
          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)]"
      }`}
    >
      <Container className="flex items-center gap-3 py-3.5 max-md:hidden sm:gap-6 lg:hidden">
        <Logo />

        {searchForm("mx-auto hidden w-full min-w-0 max-w-xl md:flex lg:hidden")}

        <LoginMenu />

        <ThemeToggle className="ml-auto" />
        <Link
          href={user ? "/mi-fedegan" : "/ingresar"}
          aria-label={user ? "Mi FEDEGÁN" : "Iniciar sesión"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors active:bg-[var(--bg-muted)] md:hidden"
        >
          <UserCircle2 size={22} />
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpenAt(open ? null : pathname)}
          className="ml-0 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)] md:flex lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <nav className="hidden border-t border-[var(--border)] lg:block" aria-label="Navegación principal">
        <Container className="flex items-center justify-between gap-6 py-3">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
            {mainNav.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nv-link ${visibleFrom(i)} ${active ? "text-[var(--fg-lime-400)] nv-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <MoreMenu items={mainNav} pathname={pathname} />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {pillOpen ? (
              <form
                role="search"
                onSubmit={(e) => {
                  submitSearch(e);
                  setPillOpen(false);
                }}
                className="nv-pill flex w-60 items-center gap-2 !px-4 !py-1.5"
              >
                <Search size={15} className="shrink-0 text-[var(--fg-lime-400)]" />
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setPillOpen(false)}
                  onKeyDown={(e) => e.key === "Escape" && setPillOpen(false)}
                  placeholder="¿Qué está buscando?"
                  aria-label="Buscar en el portal"
                  className="min-w-0 flex-1 bg-transparent text-[0.82rem] normal-case tracking-normal outline-none placeholder:text-[var(--text-faint)] [&::-webkit-search-cancel-button]:hidden"
                />
              </form>
            ) : (
              <button type="button" onClick={() => setPillOpen(true)} className="nv-pill flex !h-9 !w-9 items-center justify-center !p-0" aria-label="Buscar" title="Buscar">
                <Search size={16} />
              </button>
            )}
            <span aria-hidden className="h-7 w-px bg-[var(--border-strong)]" />
            <LoginMenu />
            <ThemeToggle className="!h-9 !w-9 !border-transparent hover:!border-[var(--border-strong)]" />
          </div>
        </Container>
      </nav>

      {open && (
        <div
          id="menu-movil"
          className="menu-sheet absolute inset-x-0 top-full max-h-[calc(100dvh-4.4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[var(--bg)] lg:hidden"
        >
          <Container className="flex flex-col gap-7 pb-32 pt-6">
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
