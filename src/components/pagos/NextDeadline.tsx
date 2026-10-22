"use client";

import { useSyncExternalStore } from "react";
import { fechasLimite } from "@/content/pagos";

const quiet = () => () => {};
const today = () => new Date().toISOString().slice(0, 10);

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Próxima fecha límite de consignación con los días que faltan.
export function NextDeadline({ size = "md" }: { size?: "md" | "lg" }) {
  const hoy = useSyncExternalStore(quiet, today, () => "");
  const next = hoy ? fechasLimite.find((f) => f.iso >= hoy) : undefined;
  const dias = next ? Math.round((new Date(next.iso).getTime() - new Date(hoy).getTime()) / 86400000) : null;
  const [, m, d] = (next?.iso ?? "").split("-");
  return (
    <div className="flex items-center gap-5" aria-live="polite">
      <div className={`flex shrink-0 flex-col items-center justify-center rounded-[0.25rem] border border-[var(--border-strong)] border-t-2 border-t-[var(--fg-lime-500)] bg-[var(--surface-solid)] ${size === "lg" ? "h-28 w-28" : "h-24 w-24"}`}>
        <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">{next ? MESES[Number(m) - 1] : "—"}</span>
        <span className={`font-[var(--font-display)] font-bold leading-none text-[var(--text)] ${size === "lg" ? "text-5xl" : "text-4xl"}`}>{next ? Number(d) : "—"}</span>
      </div>
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Próxima fecha límite</p>
        <p className="mt-1 font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{next ? next.limite : "Consulte el calendario"}</p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          {next && dias !== null ? (dias === 0 ? "Vence hoy" : `Faltan ${dias} ${dias === 1 ? "día" : "días"} · recaudo de ${next.mes.split(" de")[0].toLowerCase()}`) : "Fechas de consignación 2026"}
        </p>
      </div>
    </div>
  );
}
