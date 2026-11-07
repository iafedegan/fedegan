"use client";

import { Trash2 } from "lucide-react";

// Botón de eliminar con confirmación. `menu`: se muestra como un elemento de texto dentro de un menú de acciones.
export function DeleteButton({ label, disabled, menu = false }: { label: string; disabled?: boolean; menu?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={`Eliminar ${label}`}
      title="Eliminar"
      onClick={(e) => {
        if (!confirm(`¿Eliminar «${label}»? Esta acción no se puede deshacer.`)) e.preventDefault();
      }}
      className={menu ? "at-item at-item-danger" : "ad-icon-btn hover:!border-[#d64545] hover:!text-[#d64545]"}
    >
      <Trash2 size={menu ? 15 : 16} aria-hidden />
      {menu && <span>Eliminar…</span>}
    </button>
  );
}
