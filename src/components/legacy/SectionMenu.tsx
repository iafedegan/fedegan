"use client";

import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavTree, type NavItem } from "./NavTree";

// Menú de la sección en pantalla completa (como el menú del sitio de referencia): el árbol completo,
// con todas las ramas desplegables y la página actual abierta. <dialog> aporta el foco atrapado y Esc para cerrar.
export function SectionMenu({ label, items, current }: { label: string; items: NavItem[]; current: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();
  // El árbol solo se pinta cuando se abre el menú: antes duplicaba cientos de enlaces ocultos en cada página.
  const [listo, setListo] = useState(false);
  return (
    <>
      <button type="button" className="menu-btn" onClick={() => { setListo(true); ref.current?.showModal(); }} aria-haspopup="dialog">
        <Menu size={16} aria-hidden /> Menú de {label}
      </button>
      <dialog
        ref={ref}
        className="menu-dialog"
        aria-label={`Menú de ${label}`}
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
      >
        <div className="menu-inner">
          <div className="menu-top">
            <span>{label}</span>
            <button type="button" onClick={close}>
              <X size={16} aria-hidden /> Cerrar
            </button>
          </div>
          <nav
            aria-label={`Menú de ${label}`}
            className="menu-nav"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) close();
            }}
          >
            {listo && <NavTree nodes={items} current={current} />}
          </nav>
        </div>
      </dialog>
    </>
  );
}
