"use client";

import { useSyncExternalStore } from "react";
import { fechasLimite } from "@/content/pagos";

const quiet = () => () => {};
const today = () => new Date().toISOString().slice(0, 10);

// Fechas límite de consignación: la próxima por vencer queda resaltada y las pasadas se atenúan.
export function FechasLimite() {
  const hoy = useSyncExternalStore(quiet, today, () => "");
  const proxima = hoy ? fechasLimite.find((f) => f.iso >= hoy)?.iso : undefined;
  return (
    <div className="overflow-hidden rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--surface-solid)]">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Fechas límite para la consignación de la cuota de fomento ganadero y lechero, año 2026</caption>
        <thead>
          <tr className="border-b border-[var(--border-strong)] text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
            <th scope="col" className="px-5 py-3.5">Mes de recaudo</th>
            <th scope="col" className="px-5 py-3.5">Fecha límite</th>
          </tr>
        </thead>
        <tbody>
          {fechasLimite.map((f) => {
            const next = f.iso === proxima;
            const past = hoy !== "" && f.iso < hoy;
            return (
              <tr key={f.iso} className={`border-b border-[var(--border)] last:border-0 ${next ? "bg-[rgba(216,181,88,0.12)]" : ""} ${past ? "text-[var(--text-faint)]" : "text-[var(--text)]"}`}>
                <td className="px-5 py-3 font-semibold">{f.mes}</td>
                <td className="px-5 py-3">
                  <span className="font-[var(--font-display)] text-[1.05rem] font-bold">{f.limite}</span>
                  {next && <span className="ml-3 rounded-full bg-[var(--fg-lime-500)] px-2.5 py-0.5 align-middle text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11]">Próxima</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
