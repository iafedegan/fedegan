"use client";

import { useFormStatus } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

function Publicar({ writable, etiqueta }: { writable: boolean; etiqueta: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null} {pending ? "Publicando…" : etiqueta}
    </button>
  );
}

/** Barra fija al pie del formulario con el botón de publicar y el estado de la página. Va dentro de un <form>. */
export function BarraPublicar({ writable, sucio = false, incompletos = 0, etiqueta = "Publicar cambios" }: { writable: boolean; sucio?: boolean; incompletos?: number; etiqueta?: string }) {
  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4e2d6] bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(17,39,29,0.45)] backdrop-blur">
      <Publicar writable={writable} etiqueta={etiqueta} />
      {sucio && <span className="ad-pill ad-pill-gold">Cambios sin publicar</span>}
      {incompletos > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1f]">
          <AlertTriangle size={14} aria-hidden /> {incompletos === 1 ? "1 elemento incompleto no se publicará" : `${incompletos} elementos incompletos no se publicarán`}
        </span>
      )}
      {!writable && <span className="text-xs text-[#8a6d1f]">Solo lectura: falta la clave de servicio para guardar.</span>}
    </div>
  );
}
