"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { Indicador } from "@/lib/estadisticas/tipos";
import type { IndicadorFedegan } from "@/lib/estadisticas/parse";
import { IndicatorChart } from "./IndicatorChart";

export type ConjuntoVista = { id: string; titulo: string; indicadores: IndicadorFedegan[] };

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Cifras del sistema de estadísticas de FEDEGÁN: un conjunto por pestaña; a la izquierda la lista de indicadores
// (con buscador) y a la derecha la gráfica, la tabla y la fuente del indicador elegido.
export function CifrasFedegan({ conjuntos }: { conjuntos: ConjuntoVista[] }) {
  const [c, setC] = useState(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});
  const conjunto = conjuntos[Math.min(c, conjuntos.length - 1)];

  const lista = useMemo(() => {
    const t = sinTildes(q.trim());
    return conjunto.indicadores.filter((i) => !t || sinTildes(`${i.codigo} ${i.titulo}`).includes(t));
  }, [conjunto, q]);

  const actual = conjunto.indicadores.find((i) => i.clave === sel[conjunto.id]) ?? lista[0] ?? conjunto.indicadores[0];
  const conDatos = lista.filter((i) => i.series.length);
  const informes = lista.filter((i) => !i.series.length);

  const vista: Indicador | null = actual?.series.length
    ? { clave: actual.clave, titulo: actual.titulo, unidad: actual.unidad, periodos: actual.periodos, series: actual.series, forma: actual.forma }
    : null;

  return (
    <div>
      {conjuntos.length > 1 && (
        <div role="tablist" aria-label="Conjunto de cifras" className="flex flex-wrap gap-x-1 border-b border-[var(--border-strong)]">
          {conjuntos.map((x, k) => (
            <button key={x.id} role="tab" type="button" aria-selected={k === c} onClick={() => { setC(k); setQ(""); }} className={`relative px-4 py-3 text-sm font-bold transition-colors ${k === c ? "text-[var(--fg-lime-400)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              {x.titulo}
              <span className="ml-1.5 font-data text-[0.68rem] text-[var(--text-faint)]">{x.indicadores.length}</span>
              <span aria-hidden className={`absolute inset-x-3 -bottom-px h-[2px] bg-[var(--fg-lime-500)] transition-transform duration-300 ${k === c ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-5">
        {/* Selector integrado: el indicador se elige aquí mismo, sobre la gráfica, sin una lista aparte. */}
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Indicador · {conjunto.indicadores.length}</span>
          <select
            value={actual?.clave ?? ""}
            onChange={(e) => setSel((s) => ({ ...s, [conjunto.id]: e.target.value }))}
            aria-label="Elegir indicador"
            className="w-full rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]"
          >
            {conDatos.length > 0 && (
              <optgroup label="Con gráfica">
                {conDatos.map((i) => (
                  <option key={i.clave} value={i.clave}>{i.codigo ? `${i.codigo} · ` : ""}{i.titulo}</option>
                ))}
              </optgroup>
            )}
            {informes.length > 0 && (
              <optgroup label="Informes y presentaciones">
                {informes.map((i) => (
                  <option key={i.clave} value={i.clave}>{i.codigo ? `${i.codigo} · ` : ""}{i.titulo}</option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <div className="mt-6 min-w-0">
          {actual && (
            <>
              <p className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{actual.titulo}</p>
              {vista ? (
                <div className="mt-4">
                  <IndicatorChart key={`${conjunto.id}-${actual.clave}`} ind={vista} />
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-[0.25rem] border border-dashed border-[var(--border-strong)] p-5">
                  <FileText size={20} aria-hidden className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />
                  <div>
                    <p className="text-[var(--text)]">Este indicador se publica como informe o presentación.</p>
                    <Link href="/seccion/cifras-del-sector/estadisticas/documentos-de-estadistica" className="mt-2 inline-block text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:text-[var(--text)]">Ver documentos de estadística →</Link>
                  </div>
                </div>
              )}
              {actual.nota && (
                <p className="mt-4 rounded-[0.25rem] bg-[var(--surface-2)] px-4 py-3 text-xs leading-relaxed text-[var(--text-muted)]">
                  <b className="uppercase tracking-[0.12em] text-[var(--text-faint)]">Fuente y notas · </b>
                  {actual.nota}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
