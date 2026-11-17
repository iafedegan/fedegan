"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { GraduationCap, LogIn, LogOut, UserCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

// Barra propia de la Escuela Virtual: va justo debajo del encabezado del portal (el mismo en todo el sitio) y solo trae lo suyo:
// Cursos, Mi perfil y la cuenta de quien estudia. En verde oscuro con detalles dorados, como el cabezote del portal.
export function EscuelaSubnav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const link = (activa: boolean) =>
    `flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[0.78rem] font-bold uppercase tracking-[0.1em] transition-colors ${
      activa ? "bg-[#d8b558] text-[#0a1c12]" : "text-[#eaf3e4] hover:bg-white/10"
    }`;

  return (
    <div className="eu-bar border-b border-[rgba(216,181,88,0.4)] bg-[#0a1c12] text-[#eaf3e4] print:hidden" data-region="escuela">
      <Container className="flex items-center gap-3 py-2">
        <Link href="/escuela-virtual" className="flex shrink-0 items-center gap-2 pr-1" aria-label="Escuela Virtual FEDEGÁN: inicio">
          <GraduationCap size={20} className="text-[#e7cf8c]" aria-hidden />
          <span className="hidden text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#e7cf8c] sm:block">Escuela Virtual</span>
        </Link>
        <nav aria-label="Escuela Virtual" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/escuela-virtual" aria-current={pathname === "/escuela-virtual" ? "page" : undefined} className={link(pathname === "/escuela-virtual")}>Cursos</Link>
          {user && (
            <Link href="/escuela-virtual/perfil" aria-current={pathname.startsWith("/escuela-virtual/perfil") ? "page" : undefined} className={link(pathname.startsWith("/escuela-virtual/perfil"))}>
              <UserCircle2 size={16} aria-hidden /> Mi perfil
            </Link>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-sm font-semibold text-[#cfe0d0] md:block">{user.name ?? user.email}</span>
              <button type="button" onClick={() => signOut({ redirectTo: "/" })} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(216,181,88,0.5)] px-4 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#eaf3e4] transition-colors hover:bg-white/10">
                <LogOut size={15} aria-hidden /> <span className="hidden sm:inline">Cerrar sesión</span><span className="sm:hidden">Salir</span>
              </button>
            </>
          ) : (
            status !== "loading" && !pathname.startsWith("/escuela-virtual/ingresar") && (
              <Link href={`/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent(pathname)}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#d8b558] px-5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#0a1c12] hover:brightness-110">
                <LogIn size={15} aria-hidden /> Ingresar
              </Link>
            )
          )}
        </div>
      </Container>
    </div>
  );
}
