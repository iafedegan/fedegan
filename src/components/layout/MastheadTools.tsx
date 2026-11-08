"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

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
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mh-opciones" aria-label={open ? "Cerrar opciones" : "Abrir opciones"} className="mh-tools-toggle">
        <ChevronDown size={20} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id="mh-opciones" className="mh-tools-panel">
          <Link href={session?.user ? "/mi-fedegan" : "/ingresar"} className="mh-cuenta">
            <UserCircle2 size={20} aria-hidden />
            <span>{session?.user ? "Mi FEDEGÁN" : "Iniciar sesión"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
