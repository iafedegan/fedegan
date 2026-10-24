"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

// Accesos pequeños de la cabecera en móvil: tono claro/oscuro y cuenta.
export function MastheadTools() {
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
  const [open, setOpen] = useState(false);
  return (
    <div className="mh-tools">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mh-opciones" className="mh-tools-toggle">
        Opciones <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id="mh-opciones" className="mh-tools-panel">
          <div className="flex items-center gap-2"><ThemeToggle className="!h-9 !w-9" /><span>Tono claro / oscuro</span></div>
          <Link
            href={session?.user ? "/mi-fedegan" : "/ingresar"}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)]"><UserCircle2 size={18} /></span>
            <span>{session?.user ? "Mi FEDEGÁN" : "Iniciar sesión"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
