"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={`Eliminar ${label}`}
      title="Eliminar"
      onClick={(e) => {
        if (!confirm(`¿Eliminar «${label}»? Esta acción no se puede deshacer.`)) e.preventDefault();
      }}
      className="ad-icon-btn hover:!border-[#d64545] hover:!text-[#d64545]"
    >
      <Trash2 size={16} />
    </button>
  );
}
