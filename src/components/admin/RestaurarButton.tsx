"use client";

import { RotateCcw } from "lucide-react";

// «Restaurar el original» de una página migrada, con confirmación: descarta lo publicado y vuelve al texto copiado del portal anterior.
export function RestaurarButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      title="Vuelve al texto copiado del portal actual y descarta los cambios publicados"
      onClick={(e) => {
        if (!confirm("¿Restaurar el texto original? Se descartan los cambios publicados de esta página y no se puede deshacer.")) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5 text-[#5d6e65] transition-colors hover:text-[#a33a3a] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RotateCcw size={13} aria-hidden /> Restaurar el original
    </button>
  );
}
