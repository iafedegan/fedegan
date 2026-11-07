"use client";

import { useState } from "react";
import { CheckCircle2, CloudUpload, Loader2, XCircle } from "lucide-react";
import { copiarDocumentos } from "@/lib/cms/documentos-copia-actions";
import type { EstadoCopia } from "@/lib/cms/documentos-copia";

const mb = (b: number) => (b / 1048576).toFixed(b > 1073741824 ? 0 : 1);

// Copia los documentos migrados al depósito de Supabase, por lotes, mostrando el avance. Se puede cerrar y retomar: lo ya copiado queda registrado.
export function CopiaDocumentos({ inicial, puede }: { inicial: EstadoCopia; puede: boolean }) {
  const [estado, setEstado] = useState(inicial);
  const [corriendo, setCorriendo] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; text: string } | null>(null);
  const hechos = estado.copiados + estado.omitidos;
  const pct = estado.total ? Math.round((hechos / estado.total) * 100) : 0;
  const completo = estado.tablaLista && estado.pendientes === 0;

  async function iniciar() {
    setCorriendo(true);
    setAviso(null);
    let sinAvance = 0;
    try {
      for (let vuelta = 0; vuelta < 400; vuelta++) {
        const r = await copiarDocumentos();
        if (!r.ok) {
          setAviso({ ok: false, text: r.message ?? "No se pudo copiar." });
          return;
        }
        if (r.estado) setEstado(r.estado);
        if (r.pendientes === 0) {
          setAviso({ ok: true, text: "Listo: todos los documentos quedaron copiados en Supabase." });
          return;
        }
        // Si varios lotes seguidos no avanzan (el sitio de origen no responde), se detiene y se muestra el motivo.
        sinAvance = r.copiados + r.omitidos === 0 ? sinAvance + 1 : 0;
        if (sinAvance >= 3) {
          setAviso({ ok: false, text: `Se detuvo porque no avanza. ${r.errores.join(" · ")} Intente de nuevo en unos minutos.` });
          return;
        }
      }
    } catch {
      setAviso({ ok: false, text: "Se interrumpió la conexión. Pulse de nuevo: continúa donde quedó." });
    } finally {
      setCorriendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!estado.tablaLista && (
        <p className="rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-3.5 py-2.5 text-sm text-[#7a1f1f]">
          Falta crear la tabla de copias: ejecute <code className="font-mono">docs/migraciones/013-documentos-copias.sql</code> en Supabase.
        </p>
      )}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold">{hechos} de {estado.total} documentos</span>
          <span className="text-[#5d6e65]">{estado.copiados} copiados ({mb(estado.bytes)} MB){estado.omitidos ? ` · ${estado.omitidos} omitidos` : ""}{estado.pendientes ? ` · ${estado.pendientes} pendientes` : ""}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e6eadf]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de la copia">
          <div className="h-full rounded-full bg-[#72bf44] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {puede ? (
        <button type="button" onClick={iniciar} disabled={corriendo || !estado.tablaLista || completo} className="ad-btn ad-btn-primary w-fit">
          {corriendo ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}{" "}
          {corriendo ? "Copiando… no cierre esta página" : completo ? "Todo copiado" : hechos > 0 ? "Continuar la copia" : "Copiar los documentos a Supabase"}
        </button>
      ) : (
        <p className="text-sm text-[#5d6e65]">Solo los administradores del portal pueden iniciar la copia.</p>
      )}
      {aviso && (
        <p role={aviso.ok ? "status" : "alert"} className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${aviso.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}>
          {aviso.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {aviso.text}
        </p>
      )}
    </div>
  );
}
