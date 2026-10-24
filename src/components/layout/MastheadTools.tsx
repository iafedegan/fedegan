"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

// Accesos pequeños de la cabecera en móvil: tono claro/oscuro y cuenta.
export function MastheadTools({ date }: { date: string }) {
  const { data: session } = useSession();

  // La cabecera queda fija arriba en móvil: se publica su alto para que la barra de navegación se acomode debajo.
  useEffect(() => {
    const mh = document.querySelector<HTMLElement>(".mh");
    if (!mh) return;
    const set = () => document.documentElement.style.setProperty("--mh-h", `${mh.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(mh);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="mh-tools">
      <span className="mh-tools-date">{date}</span>
      <div className="flex items-center gap-1.5">
        <ThemeToggle className="!h-8 !w-8" />
        <Link
          href={session?.user ? "/mi-fedegan" : "/ingresar"}
          aria-label={session?.user ? "Mi FEDEGÁN" : "Iniciar sesión"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors active:bg-[var(--bg-muted)]"
        >
          <UserCircle2 size={17} />
        </Link>
      </div>
    </div>
  );
}
