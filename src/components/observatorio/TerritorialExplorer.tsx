"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Partes, Territorial } from "@/lib/observatorio";
import { nf, signo, variacion } from "./format";

// Inventario por departamento, año tras año: barra de años con reproducción, puesto de cada departamento y hato por orientación.
export function TerritorialExplorer({ bovinos, predios, orientacion }: { bovinos?: Territorial; predios?: Territorial; orientacion: { predios?: Partes; animales?: Partes } }) {
  const opciones = [bovinos && { id: "bovinos", label: "Bovinos", t: bovinos, partes: orientacion.animales }, predios && { id: "predios", label: "Predios", t: predios, partes: orientacion.predios }].filter(Boolean) as { id: string; label: string; t: Territorial; partes?: Partes }[];
  const [tipo, setTipo] = useState(0);
  const act = opciones[Math.min(tipo, opciones.length - 1)];
  const nAnios = act?.t.periodos.length ?? 0;
  const [idx, setIdx] = useState(nAnios - 1);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => {
      setIdx((i) => {
        if (i >= nAnios - 1) {
          setPlay(false);
          return i;
        }
        return i + 1;
      });
    }, 850);
    return () => window.clearInterval(id);
  }, [play, nAnios]);

  if (!act) return null;
  const { t } = act;
  const i = Math.min(idx, nAnios - 1);
  const total = t.nacional[i];
  const prev = i > 0 ? t.nacional[i - 1] : 0;
  const ranking = t.departamentos.map((d) => ({ nombre: d.nombre, v: d.valores[i] ?? 0, p: d.valores[i - 1] ?? 0 })).filter((d) => d.v > 0).sort((a, b) => b.v - a.v);
  const top = ranking.slice(0, 8);
  const maxV = top[0]?.v || 1;
  const lider = ranking[0];
  const corto = (v: number) => (v >= 1e6 ? `${nf(v / 1e6, 1)} M` : v >= 1e3 ? `${nf(v / 1e3, 0)} mil` : nf(v));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <div>
        <div role="tablist" aria-label="Qué contar" className="inline-flex rounded-[0.25rem] border border-[var(--border-strong)] p-1">
          {opciones.map((o, k) => (
            <button key={o.id} role="tab" type="button" aria-selected={k === tipo} onClick={() => { setTipo(k); setIdx(o.t.periodos.length - 1); setPlay(false); }} className={`rounded-[0.25rem] px-6 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition-colors ${k === tipo ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              {o.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Total nacional · {t.periodos[i]}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <span className="font-[var(--font-display)] text-5xl font-bold leading-none text-[var(--text)] tabular-nums">{nf(total)}</span>
          {i > 0 && <span className={`text-sm font-bold tabular-nums ${total >= prev ? "text-[#5ccd86]" : "text-[#f08a8a]"}`}>{signo(variacion(total, prev))}</span>}
        </p>
        {lider && (
          <p className="mt-4 max-w-md leading-relaxed text-[var(--text-muted)]">
            <b className="text-[var(--text)]">{lider.nombre}</b> es el puesto 1 con {nf(lider.v)} ({nf((lider.v / total) * 100, 1)} % del total).
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button type="button" onClick={() => { if (i >= nAnios - 1) setIdx(0); setPlay((p) => !p); }} aria-label={play ? "Pausar" : "Reproducir años"} className="mx-arrow">
            {play ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1">
            <input type="range" min={0} max={nAnios - 1} value={i} onChange={(e) => { setPlay(false); setIdx(Number(e.target.value)); }} aria-label="Año" className="w-full accent-[var(--fg-lime-500)]" />
            <div className="flex justify-between text-xs tabular-nums text-[var(--text-faint)]"><span>{t.periodos[0]}</span><span className="font-bold text-[var(--fg-lime-400)]">{t.periodos[i]}</span><span>{t.periodos[nAnios - 1]}</span></div>
          </div>
        </div>

        {act.partes && (
          <div className="mt-8">
            <p className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{act.partes.titulo} · {act.partes.periodo}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {act.partes.partes.map((p) => {
                const tot = act.partes!.partes.reduce((a, b) => a + b.valor, 0);
                return (
                  <li key={p.nombre} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm">
                    <span className="text-[var(--text-muted)]">{p.nombre}</span>
                    <span className="h-2 rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full bg-[var(--fg-lime-500)]" style={{ width: `${(p.valor / tot) * 100}%` }} /></span>
                    <span className="tabular-nums text-[var(--text)]">{corto(p.valor)} · {nf((p.valor / tot) * 100, 0)} %</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div>
        <p className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">Los ocho primeros · {t.periodos[i]}</p>
        <ol className="mt-3 flex flex-col gap-3">
          {top.map((d, k) => (
            <li key={d.nombre} className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-3">
              <span className="font-[var(--font-display)] text-lg font-bold text-[var(--fg-lime-500)]">{k + 1}</span>
              <span>
                <span className="flex items-baseline justify-between gap-2 text-sm font-semibold text-[var(--text)]"><span>{d.nombre}</span><span className="tabular-nums text-[var(--text-muted)]">{corto(d.v)}</span></span>
                <span className="mt-1 block h-2 rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full bg-gradient-to-r from-[var(--fg-lime-500)] to-[#34a868] transition-[width] duration-500" style={{ width: `${(d.v / maxV) * 100}%` }} /></span>
              </span>
              <span className={`text-xs font-bold tabular-nums ${d.v >= d.p ? "text-[#5ccd86]" : "text-[#f08a8a]"}`}>{d.p ? signo(variacion(d.v, d.p)).replace(/ %$/, "%") : ""}</span>
            </li>
          ))}
        </ol>
        <details className="mt-5 rounded-[0.25rem] border border-[var(--border)] p-3 text-sm">
          <summary className="cursor-pointer font-bold text-[var(--fg-lime-400)]">Ver los {ranking.length} departamentos</summary>
          <ol className="mt-3 max-h-64 divide-y divide-[var(--border)] overflow-y-auto pr-1">
            {ranking.map((d, k) => (
              <li key={d.nombre} className="flex justify-between gap-3 py-1.5"><span className="text-[var(--text-muted)]">{k + 1}. {d.nombre}</span><span className="tabular-nums text-[var(--text)]">{nf(d.v)}</span></li>
            ))}
          </ol>
        </details>
      </div>
    </div>
  );
}
