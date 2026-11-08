"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

// Menú «⋯» de una fila: agrupa las acciones secundarias (orden, publicar, eliminar) para que la fila quede limpia.
export function RowMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const fuera = (e: PointerEvent) => {
      const d = ref.current;
      if (d?.open && !d.contains(e.target as Node)) d.open = false;
    };
    const esc = (e: KeyboardEvent) => {
      const d = ref.current;
      if (e.key === "Escape" && d?.open) {
        d.open = false;
        d.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  const cerrar = () => {
    if (ref.current) ref.current.open = false;
  };
  return (
    <details ref={ref} className="relative">
      <summary className="at-btn at-btn-icon !h-9 !w-9 !border-[var(--ad-line)] !bg-white" aria-label={`Más acciones de ${label}`} title="Más acciones">
        <MoreHorizontal size={16} aria-hidden />
      </summary>
      <div className="at-menu" onSubmit={() => window.setTimeout(cerrar, 0)}>
        {children}
      </div>
    </details>
  );
}
