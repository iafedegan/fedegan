"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Square } from "lucide-react";
import { generarFaltantes } from "@/lib/lms/studio-actions";
import type { EstadoStudio } from "@/lib/lms/studio";

// Genera los materiales del Studio (resumen, mapa mental, tarjetas…) de todas las lecciones y cursos, de a dos, y los guarda en Supabase.
// Se puede cerrar y retomar: lo ya generado queda guardado y solo se piden los que faltan.
export function StudioAdmin({ inicial, puede }: { inicial: EstadoStudio; puede: boolean }) {
  const [estado, setEstado] = useState(inicial);
  const [corriendo, setCorriendo] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; text: string } | null>(null);
  const [ultimo, setUltimo] = useState("");
  const [errores, setErrores] = useState<{ clave: string; titulo: string; error: string }[]>([]);
  const parar = useRef(false);
  const pct = estado.total ? Math.round((estado.hechos / estado.total) * 100) : 0;
  const listo = estado.tablaLista && estado.pendientes === 0 && estado.total > 0;

  async function iniciar() {
    parar.current = false;
    setCorriendo(true);
    setAviso(null);
    setErrores([]);
    const omitir: string[] = [];
    let sinAvance = 0;
    try {
      for (let vuelta = 0; vuelta < 500; vuelta++) {
        if (parar.current) {
          setAviso({ ok: true, text: "Detenido. Pulse «Generar» para continuar donde quedó." });
          return;
        }
        const r = await generarFaltantes(omitir);
        if (!r.ok) {
          setAviso({ ok: false, text: r.message ?? "No se pudo generar." });
          if (r.estado) setEstado(r.estado);
          return;
        }
        if (r.estado) setEstado(r.estado);
        if (r.hechos.length) setUltimo(r.hechos[r.hechos.length - 1]);
        if (r.errores.length) {
          setErrores((e) => [...e, ...r.errores]);
          omitir.push(...r.errores.map((x) => x.clave));
        }
        if (r.hechos.length === 0 && r.errores.length === 0) {
          setAviso(omitir.length ? { ok: false, text: `Terminó, pero ${omitir.length} no se pudieron generar (vea abajo). Puede volver a intentarlo.` } : { ok: true, text: "Listo: todos los materiales quedaron generados y guardados." });
          return;
        }
        sinAvance = r.hechos.length ? 0 : sinAvance + 1;
        if (sinAvance >= 4) {
          setAviso({ ok: false, text: "Se detuvo porque varias lecciones seguidas fallaron. Revise los motivos abajo y vuelva a intentarlo." });
          return;
        }
      }
    } catch {
      setAviso({ ok: false, text: "Se interrumpió la conexión. Pulse «Generar» de nuevo: continúa donde quedó." });
    } finally {
      setCorriendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!estado.tablaLista && (
        <p className="flex items-start gap-2 rounded-xl bg-[#fbeaea] p-3 text-sm text-[#7a1f1f]"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> Falta crear la tabla de materiales: ejecute <code className="font-mono">docs/migraciones/014-studio.sql</code> en Supabase (SQL Editor) y recargue esta página.</p>
      )}
      {!estado.iaLista && (
        <p className="flex items-start gap-2 rounded-xl bg-[#fbf3dc] p-3 text-sm text-[#6b5412]"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> Falta cargar una clave de Gemini en «Inteligencia artificial» (más arriba). Gemini es la que puede ver el video de cada lección.</p>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold">{estado.hechos} de {estado.total} materiales generados</span>
          <span className="tabular-nums text-[#5d6e65]">{pct} %</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8ece4]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-[#72BF44] transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        {estado.proveedor && <p className="mt-1.5 text-xs text-[#8a978f]">Modelo: {estado.proveedor}</p>}
      </div>

      <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {estado.cursos.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 border-b border-[#eceae0] py-1.5">
            <span className="min-w-0 truncate">{c.titulo}</span>
            <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-[#5d6e65]">
              {c.hechas}/{c.lecciones}
              <span title={c.curso ? "Material de todo el curso listo" : "Falta el material de todo el curso"} className={`inline-block h-2 w-2 rounded-full ${c.curso ? "bg-[#1f8a5b]" : "bg-[#d4d8cf]"}`} />
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        {puede ? (
          corriendo ? (
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => { parar.current = true; }}><Square size={15} /> Detener</button>
          ) : (
            <button type="button" className="ad-btn ad-btn-primary" onClick={iniciar} disabled={!estado.iaLista || !estado.tablaLista || listo}><Sparkles size={16} /> {estado.hechos ? "Generar los que faltan" : "Generar los materiales"}</button>
          )
        ) : (
          <p className="text-sm text-[#5d6e65]">Solo los administradores del portal pueden generar los materiales.</p>
        )}
        {corriendo && <span className="flex items-center gap-2 text-sm text-[#5d6e65]"><Loader2 size={16} className="animate-spin" /> Generando{ultimo ? `… último: ${ultimo}` : "…"}</span>}
      </div>

      {aviso && (
        <p role="status" className={`flex items-start gap-2 text-sm ${aviso.ok ? "text-[#2c6a14]" : "text-[#7a1f1f]"}`}>
          {aviso.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />} {aviso.text}
        </p>
      )}
      {errores.length > 0 && (
        <details className="rounded-xl border border-[#eceae0] p-3 text-sm">
          <summary className="cursor-pointer font-semibold">{errores.length} sin generar</summary>
          <ul className="mt-2 flex flex-col gap-1 text-xs text-[#5d6e65]">
            {errores.map((e, i) => <li key={i}><b>{e.titulo}:</b> {e.error}</li>)}
          </ul>
        </details>
      )}
      <p className="text-xs text-[#8a978f]">Cada lección se arma una sola vez a partir de su video y queda guardada: los estudiantes la abren al instante. Se generan de dos en dos; mantenga esta pestaña abierta mientras trabaja.</p>
    </div>
  );
}
