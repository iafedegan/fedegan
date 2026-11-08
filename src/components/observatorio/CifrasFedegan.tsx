"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
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

  const fila = (i: IndicadorFedegan) => {
    const on = i.clave === actual?.clave;
    return (
      <li key={i.clave}>
        <button
          type="button"
          onClick={() => setSel((s) => ({ ...s, [conjunto.id]: i.clave }))}
          aria-current={on ? "true" : undefined}
          className={`flex w-full items-baseline gap-3 border-l-2 px-3 py-2.5 text-left text-sm leading-snug transition-colors ${on ? "border-[var(--fg-lime-500)] bg-[var(--surface-2)] font-bold text-[var(--text)]" : "border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}
        >
          {i.codigo && <span className="font-data text-[0.68rem] tracking-[0.08em] text-[var(--text-faint)]">{i.codigo}</span>}
          <span>{i.titulo}</span>
        </button>
      </li>
    );
  };

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

      <div className="mt-5 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0">
          {conjunto.indicadores.length > 7 && (
            <label className="relative mb-3 block">
              <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar indicador" aria-label="Buscar indicador" className="w-full rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]" />
            </label>
          )}
          <div className="max-h-[26rem] overflow-y-auto rounded-[0.25rem] border border-[var(--border)] lg:max-h-[34rem]">
            {lista.length === 0 && <p className="p-4 text-sm text-[var(--text-muted)]">Ningún indicador coincide.</p>}
            {conDatos.length > 0 && <ul>{conDatos.map(fila)}</ul>}
            {informes.length > 0 && (
              <>
                <p className="border-t border-[var(--border)] px-3 pb-1 pt-3 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Informes y presentaciones</p>
                <ul>{informes.map(fila)}</ul>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0">
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
