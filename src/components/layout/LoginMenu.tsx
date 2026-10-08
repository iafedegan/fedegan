"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, LogIn, Sprout, UserCircle2 } from "lucide-react";

const options = [
  { href: "/ingresar", label: "Ganaderos y aliados", hint: "Ingreso o registro", icon: Sprout },
  { href: "/ingresar#funcionarios", label: "Funcionarios FEDEGÁN", hint: "Cuenta institucional", icon: Building2 },
  { href: "/mi-fedegan", label: "Mi FEDEGÁN", hint: "Su espacio personal", icon: UserCircle2 },
];

export function LoginMenu() {
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

  return (
    <div ref={ref} className="relative hidden lg:block ml-auto shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)]"
      >
        <UserCircle2 size={20} />
        Iniciar sesión
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] shadow-[var(--shadow-lg)]"
        >
          <Link
            href="/ingresar"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-[var(--fg-green-700)] px-4 py-3 text-sm font-bold text-[var(--on-accent)] hover:bg-[var(--fg-green-800)]"
          >
            <LogIn size={16} /> Ingresar
          </Link>
          <div className="flex flex-col py-1">
            {options.map(({ href, label, hint, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--bg-muted)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-green-700)]">
                  <Icon size={18} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
                  <span className="text-xs text-[var(--text-faint)]">{hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
