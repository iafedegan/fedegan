"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      aria-label={`Eliminar ${label}`}
      title="Eliminar"
      onClick={(e) => {
        if (!confirm(`¿Eliminar «${label}»? Esta acción no se puede deshacer.`)) e.preventDefault();
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[#d64545] hover:text-[#ff8a8a]"
    >
      <Trash2 size={16} />
    </button>
  );
}
