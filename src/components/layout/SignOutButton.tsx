"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/" })}
      className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)] ${className}`}
    >
      <LogOut size={15} /> Cerrar sesión
    </button>
  );
}
