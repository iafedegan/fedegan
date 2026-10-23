"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)] print:hidden">
      <Printer size={16} /> Imprimir o guardar en PDF
    </button>
  );
}
