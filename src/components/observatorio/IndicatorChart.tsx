"use client";

import { useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import type { Indicador } from "@/lib/observatorio";
import { PALETTE, etiqueta, fmtValor, nf, ticks, unidadLimpia } from "./format";

type Forma = "linea" | "area" | "barras";
const W = 880;
const H = 340;
const M = { l: 62, r: 14, t: 14, b: 34 };

// Gráfica interactiva de un indicador: periodo, tipo de gráfica, series, tabla y exportación a CSV.
export function IndicatorChart({ ind }: { ind: Indicador }) {
  const mensual = ind.periodos.some((p) => p.includes("/"));
  const [rango, setRango] = useState(mensual ? 12 : 0);
  const [forma, setForma] = useState<Forma>(ind.forma ?? "linea");
  const [vista, setVista] = useState<"grafica" | "tabla">("grafica");
  const [ocultas, setOcultas] = useState<Set<string>>(() => {
    // Con muchas series (países, regiones) solo se muestran las destacadas o las primeras.
    if (ind.series.length <= 4) return new Set();
    const keep = new Set(ind.destacadas?.length ? ind.destacadas : ind.series.slice(0, 4).map((s) => s.nombre));
    return new Set(ind.series.map((s) => s.nombre).filter((n) => !keep.has(n)));
  });
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const total = ind.periodos.length;
  const desde = rango && rango < total ? total - rango : 0;
  const periodos = ind.periodos.slice(desde);
  const series = ind.series.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length], valores: s.valores.slice(desde) })).filter((s) => !ocultas.has(s.nombre));

  const { min, max, ejeY } = useMemo(() => {
    const all = series.flatMap((s) => s.valores).filter((v) => Number.isFinite(v));
    if (!all.length) return { min: 0, max: 1, ejeY: [0, 1] };
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    if (forma === "barras" || forma === "area") lo = Math.min(0, lo);
    else {
      const pad = (hi - lo) * 0.08 || hi * 0.05;
      lo -= pad;
      hi += pad;
    }
    const t = ticks(lo, hi, 4);
    return { min: t[0], max: t[t.length - 1], ejeY: t };
  }, [series, forma]);

  const n = periodos.length;
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const x = (i: number) => (forma === "barras" ? M.l + (iw / n) * (i + 0.5) : M.l + (n > 1 ? (iw * i) / (n - 1) : iw / 2));
  const y = (v: number) => M.t + ih - ((v - min) / (max - min || 1)) * ih;
  const paso = Math.max(1, Math.ceil(n / 7));

  function mover(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = forma === "barras" ? Math.floor(((px - M.l) / iw) * n) : Math.round(((px - M.l) / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  function csv() {
    const filas = [["Periodo", ...ind.series.map((s) => s.nombre)], ...ind.periodos.map((p, i) => [p, ...ind.series.map((s) => String(s.valores[i] ?? ""))])];
    const blob = new Blob([filas.map((f) => f.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${ind.clave}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const chip = (on: boolean) => `rounded-full border px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-colors ${on ? "border-[var(--fg-lime-500)] bg-[var(--fg-lime-500)] text-[#0a1a11]" : "border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)]"}`;
  const rangos = mensual ? [[6, "6 meses"], [12, "12 meses"], [36, "3 años"], [0, "Todo"]] : [[5, "5 años"], [10, "10 años"], [0, "Todo"]];
  const hoverX = hover !== null ? x(hover) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Periodo">
          {rangos.map(([v, l]) => (
            <button key={String(v)} type="button" onClick={() => setRango(Number(v))} className={chip(rango === v)}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de gráfica">
          {([["linea", "Líneas"], ["area", "Área"], ["barras", "Barras"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => { setForma(v); setVista("grafica"); }} className={chip(forma === v && vista === "grafica")}>
              {l}
            </button>
          ))}
          <button type="button" onClick={() => setVista(vista === "tabla" ? "grafica" : "tabla")} className={chip(vista === "tabla")}>
            Tabla
          </button>
        </div>
      </div>

      {ind.series.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Series">
          {ind.series.map((s, i) => {
            const off = ocultas.has(s.nombre);
            return (
              <li key={s.nombre}>
                <button
                  type="button"
                  aria-pressed={!off}
                  onClick={() => setOcultas((prev) => { const next = new Set(prev); if (next.has(s.nombre)) next.delete(s.nombre); else next.add(s.nombre); return next; })}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${off ? "border-[var(--border)] text-[var(--text-faint)] line-through" : "border-[var(--border-strong)] text-[var(--text)]"}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: off ? "transparent" : PALETTE[i % PALETTE.length], border: `1.5px solid ${PALETTE[i % PALETTE.length]}` }} />
                  {s.nombre}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {vista === "grafica" ? (
        <div ref={box} className="relative mt-5 rounded-[0.9rem] border border-[var(--border)] bg-[var(--bg)] p-2 sm:p-4">
          {series.length === 0 ? (
            <p className="p-8 text-center text-[var(--text-muted)]">Elija al menos una serie para verla.</p>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-pan-y select-none" onPointerMove={mover} onPointerLeave={() => setHover(null)} role="img" aria-label={`${ind.titulo}, ${unidadLimpia(ind.unidad)}`}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.nombre} id={`g-${ind.clave}-${s.color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
                  </linearGradient>
                ))}
              </defs>
              {ejeY.map((t) => (
                <g key={t}>
                  <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.12" />
                  <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity="0.62">
                    {nf(t, Math.abs(t) < 10 && t % 1 !== 0 ? 1 : 0)}
                  </text>
                </g>
              ))}
              {periodos.map((p, i) => (i % paso === 0 || i === n - 1 ? (
                <text key={p} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.62">
                  {etiqueta(p)}
                </text>
              ) : null))}

              {forma === "barras"
                ? periodos.map((p, i) => {
                    const bw = (iw / n) * 0.78;
                    const w = bw / series.length;
                    return series.map((s, k) => {
                      const v = s.valores[i];
                      if (!Number.isFinite(v)) return null;
                      return <rect key={`${p}-${s.nombre}`} x={x(i) - bw / 2 + w * k + 1} y={Math.min(y(v), y(Math.max(min, 0)))} width={Math.max(1, w - 2)} height={Math.abs(y(v) - y(Math.max(min, 0)))} rx="2" fill={s.color} fillOpacity={hover === null || hover === i ? 0.95 : 0.45} />;
                    });
                  })
                : series.map((s, k) => {
                    const pts = s.valores.map((v, i) => [x(i), y(v)] as const).filter(([, py]) => Number.isFinite(py));
                    const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
                    return (
                      <g key={s.nombre}>
                        {forma === "area" && k === 0 && pts.length > 1 && <path d={`${d} L${pts[pts.length - 1][0]} ${y(Math.max(min, 0))} L${pts[0][0]} ${y(Math.max(min, 0))}Z`} fill={`url(#g-${ind.clave}-${s.color.slice(1)})`} />}
                        <path d={d} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
                        {hover !== null && Number.isFinite(s.valores[hover]) && <circle cx={x(hover)} cy={y(s.valores[hover])} r="4.5" fill={s.color} stroke="var(--bg)" strokeWidth="2" />}
                      </g>
                    );
                  })}
              {hover !== null && forma !== "barras" && <line x1={hoverX} x2={hoverX} y1={M.t} y2={H - M.b} stroke="currentColor" strokeOpacity="0.3" strokeDasharray="3 4" />}
            </svg>
          )}
          {hover !== null && series.length > 0 && (
            <div className="pointer-events-none absolute top-3 z-10 min-w-[10rem] rounded-[0.6rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] px-3 py-2 text-xs shadow-[0_14px_30px_-16px_rgba(0,0,0,0.8)]" style={{ left: `${Math.min(78, Math.max(2, (hoverX / W) * 100 - 6))}%` }}>
              <p className="mb-1 font-bold text-[var(--text)]">{periodos[hover]}</p>
              {series.map((s) => (
                <p key={s.nombre} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.nombre}</span>
                  <b className="tabular-nums text-[var(--text)]">{Number.isFinite(s.valores[hover]) ? fmtValor(ind, s.valores[hover]) : "—"}</b>
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 max-h-[22rem] overflow-auto rounded-[0.9rem] border border-[var(--border-strong)]">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-[var(--surface-solid)]">
              <tr className="border-b border-[var(--border-strong)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                <th className="px-4 py-3">Periodo</th>
                {series.map((s) => <th key={s.nombre} className="px-4 py-3 text-right">{s.nombre}</th>)}
              </tr>
            </thead>
            <tbody>
              {periodos.map((p, i) => (
                <tr key={p} className="border-b border-[var(--border)] last:border-0 odd:bg-[var(--surface-2)]">
                  <td className="px-4 py-2.5 font-semibold text-[var(--text)]">{p}</td>
                  {series.map((s) => <td key={s.nombre} className="px-4 py-2.5 text-right tabular-nums text-[var(--text-muted)]">{Number.isFinite(s.valores[i]) ? fmtValor(ind, s.valores[i]) : "—"}</td>)}
                </tr>
              )).reverse()}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-faint)]">
        <p>
          {unidadLimpia(ind.unidad)}
          {ind.fuente ? ` · Fuente: ${ind.fuente}` : ""}
        </p>
        <button type="button" onClick={csv} className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:text-[var(--text)]">
          <Download size={14} /> Exportar datos (CSV)
        </button>
      </div>
    </div>
  );
}
