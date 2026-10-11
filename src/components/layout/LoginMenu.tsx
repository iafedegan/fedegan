"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, LogIn, LogOut, Newspaper, ShieldCheck, UserCircle2 } from "lucide-react";
import { appsForRoles } from "@/lib/access";

const appIcons = { shield: ShieldCheck, newspaper: Newspaper };

export function LoginMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const userApps = appsForRoles(user?.roles);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/ingresar"
        className="ml-auto hidden min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--fg-lime-500)] px-5 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[var(--fg-green-900)] transition-colors hover:bg-[var(--fg-lime-400)] md:flex"
      >
        <LogIn size={17} /> Ingresar
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative ml-auto hidden shrink-0 md:block">
      <button
        type="button"
        aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)]"
      >
        <UserCircle2 size={22} />
        <span className="hidden lg:inline">{user ? user.name?.split(" ")[0] ?? "Mi cuenta" : "Iniciar sesión"}</span>
        <ChevronDown size={14} className={`hidden transition-transform duration-300 lg:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[1.1rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] shadow-[var(--shadow-lg)]"
        >
          {user ? (
            <div className="flex flex-col py-1">
              <p className="px-4 py-2 text-xs text-[var(--text-faint)]">{user.email ?? user.name}</p>
              <Link
                href="/mi-fedegan"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-muted)]"
              >
                <UserCircle2 size={18} className="text-[var(--fg-lime-400)]" /> Mis aplicaciones
              </Link>
              {userApps.map((a) => {
                const Icon = appIcons[a.icon];
                return (
                  <Link
                    key={a.id}
                    href={a.href}
                    target={a.external ? "_blank" : undefined}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  >
                    <Icon size={18} className="text-[var(--fg-lime-400)]" /> {a.nombre}
                  </Link>
                );
              })}
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ redirectTo: "/" })}
                className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-2.5 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
