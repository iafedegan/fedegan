"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { savePagina, type PaginaState } from "@/lib/cms/pagina-actions";

function Guardar({ writable }: { writable: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null} {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export function PaginaForm({ pageKey, title, texto, writable }: { pageKey: string; title: string; texto: string; writable: boolean }) {
  const [state, action] = useActionState<PaginaState, FormData>(savePagina, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="key" value={pageKey} />
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold text-[#11271d]">Título</label>
        <input id="title" name="title" defaultValue={title} maxLength={200} required className="ad-input" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="texto" className="text-sm font-semibold text-[#11271d]">Contenido</label>
        <textarea
          id="texto"
          name="texto"
          defaultValue={texto}
          spellCheck
          rows={26}
          className="ad-input min-h-[28rem] resize-y font-mono text-[0.85rem] leading-relaxed"
        />
      </div>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${
            state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"
          }`}
        >
          {state.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {state.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Guardar writable={writable} />
        {!writable && <span className="text-xs text-[#8a6d1f]">Solo lectura: falta la clave de servicio para guardar.</span>}
      </div>
    </form>
  );
}
