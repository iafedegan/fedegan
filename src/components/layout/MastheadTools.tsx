"use client";

import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

// Accesos pequeños de la cabecera en móvil: tono claro/oscuro y cuenta.
export function MastheadTools({ date }: { date: string }) {
  const { data: session } = useSession();
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
