"use client";

import { useMemo, useState } from "react";
import { Check, Info, Plus, Trash2, X } from "lucide-react";
import { Field, PrimaryButton, inputCls, panel } from "./ui";
import { departamentos, meses, municipiosPorDepartamento } from "@/content/pagos";

type Concepto = "leche" | "carne";
type Origen = { id: number; depto: string; muni: string; cantidad: number; valor: number };

const fmt = (n: number) => n.toLocaleString("es-CO");
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--fg-lime-500)] text-sm text-[var(--fg-lime-400)]">{n}</span>
      {children}
    </h3>
  );
}

// Planilla de recaudo mensual: leche (litros) o carne (cabezas). Calcula los totales de lo digitado y
// valida que cuadren; la liquidación del valor y el pago por PSE se activan al conectar el sistema.
export function Planilla({ initial = "leche" }: { initial?: Concepto }) {
  const [concepto, setConcepto] = useState<Concepto>(initial);
  const [anio, setAnio] = useState("2026");
  const [mes, setMes] = useState("");
  const [origenes, setOrigenes] = useState<Origen[]>([]);
  const [depto, setDepto] = useState("");
  const [muni, setMuni] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [valor, setValor] = useState("");
  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [compras, setCompras] = useState("");
  const [machos, setMachos] = useState("");
  const [hembras, setHembras] = useState("");
  const [obs, setObs] = useState("");

  const leche = concepto === "leche";
  const unidad = leche ? "litros" : "cabezas";
  const sumaOrigenes = useMemo(() => origenes.reduce((a, o) => a + o.cantidad, 0), [origenes]);
  const sumaValor = useMemo(() => origenes.reduce((a, o) => a + o.valor, 0), [origenes]);
  const declarado = leche ? num(total) : num(machos) + num(hembras);
  const cuadra = origenes.length > 0 && declarado > 0 && declarado === sumaOrigenes;

  function agregar() {
    if (!depto || !muni.trim() || !num(cantidad)) {
      setError(`Elija departamento y municipio, e indique ${leche ? "los litros" : "las cabezas"}.`);
      return;
    }
    if (leche && !num(valor)) {
      setError("Indique el valor recaudado de ese municipio.");
      return;
    }
    setError("");
    setOrigenes((o) => [...o, { id: Date.now(), depto, muni: muni.trim(), cantidad: num(cantidad), valor: leche ? num(valor) : 0 }]);
    setMuni("");
    setCantidad("");
    setValor("");
  }

  function cambiar(c: Concepto) {
    setConcepto(c);
    setOrigenes([]);
    setError("");
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-9">
        <div role="tablist" aria-label="Concepto" className="inline-flex w-fit rounded-[0.5rem] border border-[var(--border-strong)] p-1">
          {(["leche", "carne"] as Concepto[]).map((c) => (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={concepto === c}
              onClick={() => cambiar(c)}
              className={`rounded-[0.35rem] px-6 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition-colors ${concepto === c ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {c === "leche" ? "Leche" : "Carne"}
            </button>
          ))}
        </div>

        <section className="flex flex-col gap-4">
          <StepTitle n={1}>Datos del recaudo</StepTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Año de recaudo" htmlFor="pl-anio">
              <select id="pl-anio" value={anio} onChange={(e) => setAnio(e.target.value)} className={inputCls}>
                {["2025", "2026", "2027"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Mes a pagar" htmlFor="pl-mes" hint="El de causación del recaudo, es decir, el anterior al del día de pago.">
              <select id="pl-mes" value={mes} onChange={(e) => setMes(e.target.value)} className={inputCls}>
                <option value="">Seleccione…</option>
                {meses.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <StepTitle n={2}>Orígenes {leche ? "de la leche" : "de las cabezas"}</StepTitle>
          <div className={`${panel} grid gap-4 p-5 sm:grid-cols-2 ${leche ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            <Field label="Departamento" htmlFor="pl-depto">
              <select id="pl-depto" value={depto} onChange={(e) => { setDepto(e.target.value); setMuni(""); }} className={inputCls}>
                <option value="">Seleccione…</option>
                {departamentos.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Municipio" htmlFor="pl-muni">
              <select id="pl-muni" value={muni} onChange={(e) => setMuni(e.target.value)} disabled={!depto} className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-55`}>
                <option value="">{depto ? "Seleccione…" : "Elija primero el departamento"}</option>
                {(municipiosPorDepartamento[depto] ?? []).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label={leche ? "Número de litros" : "Número de cabezas"} htmlFor="pl-cant">
              <input id="pl-cant" inputMode="numeric" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={inputCls} />
            </Field>
            {leche && (
              <Field label="Valor recaudado ($)" htmlFor="pl-valor">
                <input id="pl-valor" inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} />
              </Field>
            )}
            <div className="flex items-end sm:col-span-2 lg:col-span-full">
              <PrimaryButton type="button" onClick={agregar}>
                <Plus size={16} /> Agregar origen
              </PrimaryButton>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm font-semibold text-[#e6a06c]">
              {error}
            </p>
          )}

          {origenes.length > 0 && (
            <div className="overflow-x-auto rounded-[0.9rem] border border-[var(--border-strong)]">
              <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-strong)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Municipio</th>
                    <th className="px-4 py-3 text-right">{leche ? "Litros" : "Cabezas"}</th>
                    {leche && <th className="px-4 py-3 text-right">Valor recaudado</th>}
                    <th className="w-10 px-2 py-3"><span className="sr-only">Quitar</span></th>
                  </tr>
                </thead>
                <tbody>
                  {origenes.map((o) => (
                    <tr key={o.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 text-[var(--text-muted)]">{o.depto}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">{o.muni}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(o.cantidad)}</td>
                      {leche && <td className="px-4 py-3 text-right tabular-nums">$ {fmt(o.valor)}</td>}
                      <td className="px-2 py-3 text-right">
                        <button type="button" aria-label={`Quitar ${o.muni}`} onClick={() => setOrigenes((l) => l.filter((x) => x.id !== o.id))} className="rounded p-1.5 text-[var(--text-faint)] hover:text-[#e6a06c]">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[var(--border-strong)] bg-[var(--bg-muted)] font-bold">
                    <td className="px-4 py-3" colSpan={2}>Suma de orígenes</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(sumaOrigenes)}</td>
                    {leche && <td className="px-4 py-3 text-right tabular-nums">$ {fmt(sumaValor)}</td>}
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <StepTitle n={3}>Totales del mes</StepTitle>
          {leche ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Total litros de leche" htmlFor="pl-total" hint="Debe ser igual a la suma de los orígenes.">
                <input id="pl-total" inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Valor total compras de leche ($)" htmlFor="pl-compras">
                <input id="pl-compras" inputMode="numeric" value={compras} onChange={(e) => setCompras(e.target.value)} className={inputCls} />
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cabezas machos" htmlFor="pl-machos" hint="Sacrificados durante el mes de recaudo.">
                <input id="pl-machos" inputMode="numeric" value={machos} onChange={(e) => setMachos(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Cabezas hembras" htmlFor="pl-hembras" hint="Sacrificadas durante el mes de recaudo.">
                <input id="pl-hembras" inputMode="numeric" value={hembras} onChange={(e) => setHembras(e.target.value)} className={inputCls} />
              </Field>
            </div>
          )}
          {declarado > 0 && origenes.length > 0 && (
            <p role="status" className={`flex items-center gap-2 text-sm font-semibold ${cuadra ? "text-[#5ccd86]" : "text-[#e6a06c]"}`}>
              {cuadra ? <Check size={16} /> : <X size={16} />}
              {cuadra ? `Los totales coinciden con la suma de los orígenes (${fmt(sumaOrigenes)} ${unidad}).` : `El total (${fmt(declarado)}) no coincide con la suma de los orígenes (${fmt(sumaOrigenes)} ${unidad}).`}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <StepTitle n={4}>Observaciones</StepTitle>
          <Field label="Novedades sobre el valor que reporta y paga" htmlFor="pl-obs">
            <textarea id="pl-obs" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} className={inputCls} />
          </Field>
        </section>
      </div>

      <aside className="lg:sticky lg:top-36">
        <div className={`${panel} border-t-2 border-t-[var(--fg-lime-500)] p-6`}>
          <p className="eyebrow">Resumen</p>
          <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">
            {leche ? "Leche" : "Carne"} · {mes || "mes sin elegir"} {anio}
          </h3>
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-[var(--text-muted)]">Orígenes agregados</dt>
              <dd className="font-bold tabular-nums text-[var(--text)]">{origenes.length}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-[var(--text-muted)]">Total {unidad}</dt>
              <dd className="font-bold tabular-nums text-[var(--text)]">{fmt(declarado || sumaOrigenes)}</dd>
            </div>
            {leche && (
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[var(--text-muted)]">Valor recaudado (orígenes)</dt>
                <dd className="font-bold tabular-nums text-[var(--text)]">$ {fmt(sumaValor)}</dd>
              </div>
            )}
            {["Subtotal", "Intereses de mora", "Valor total"].map((k) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className={k === "Valor total" ? "font-bold text-[var(--text)]" : "text-[var(--text-muted)]"}>{k}</dt>
                <dd className="font-[var(--font-display)] text-lg font-bold text-[var(--text-faint)]">—</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled className="rounded-[0.4rem] border border-[var(--border-strong)] px-5 py-3 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] opacity-60">
              Calcular
            </button>
            <PrimaryButton type="button" disabled>
              Pagar por PSE
            </PrimaryButton>
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-[var(--text-faint)]">
            <Info size={15} className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />
            El cálculo del subtotal, los intereses de mora y el pago por PSE se activan al conectar la planilla con el sistema de recaudo. Los datos de esta pantalla no se envían.
          </p>
        </div>
      </aside>
    </div>
  );
}
