"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { GraduationCap, LogIn, LogOut, UserCircle2 } from "lucide-react";

// Marco propio de la Escuela Virtual (UCG): se ve como un sitio aparte, sin el encabezado, el menú ni el pie del portal de
// FEDEGÁN. La salida es «Cerrar sesión», que devuelve al portal.
export function UniversityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const link = (href: string, exact = false) =>
    `flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[0.78rem] font-bold uppercase tracking-[0.1em] transition-colors ${
      (exact ? pathname === href : pathname.startsWith(href)) ? "bg-[rgba(216,181,88,0.14)] text-[var(--fg-lime-400)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
    }`;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--fg-lime-500)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-[var(--fg-green-900)]">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-50 border-b print:hidden border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-3 px-4 sm:px-6">
          <Link href="/escuela-virtual" className="flex shrink-0 items-center gap-3" aria-label="UCG, Escuela Virtual: inicio">
            <Image src="/brand/ucg-escudo.svg" alt="" width={1893} height={2385} unoptimized priority className="h-10 w-auto" />
            <span className="hidden leading-tight sm:block">
              <span className="block font-[var(--font-display)] text-lg font-bold tracking-wide text-[var(--text)]">UCG</span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--fg-lime-400)]">Escuela Virtual</span>
            </span>
          </Link>

          <nav aria-label="Escuela Virtual" className="ml-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/escuela-virtual" className={link("/escuela-virtual", true)}><GraduationCap size={16} /> Cursos</Link>
            {user && (
              <>
                <Link href="/escuela-virtual/perfil" className={link("/escuela-virtual/perfil")}><UserCircle2 size={16} /> Mi perfil</Link>
              </>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {user ? (
              <>
                <span className="hidden max-w-[12rem] truncate text-sm font-semibold text-[var(--text-muted)] md:block">{user.name ?? user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--text)] transition-colors hover:border-[#f08a8a] hover:text-[#f08a8a]"
                >
                  <LogOut size={15} /> <span className="hidden sm:inline">Cerrar sesión</span><span className="sm:hidden">Salir</span>
                </button>
              </>
            ) : (
              status !== "loading" && !pathname.startsWith("/escuela-virtual/ingresar") && (
                <Link href={`/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent(pathname)}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--fg-lime-500)] px-5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
                  <LogIn size={15} /> Ingresar
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <main id="contenido" data-region="body" className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] py-6 print:hidden text-center text-xs text-[var(--text-faint)]">
        © {new Date().getFullYear()} UCG · Escuela Virtual FEDEGÁN–FNG
      </footer>
    </div>
  );
}
