"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { crearFormulario, type GuardarFormularioEstado } from "@/lib/cms/formularios-actions";

export function NuevoFormulario({ writable }: { writable: boolean }) {
  const [state, action, pending] = useActionState<GuardarFormularioEstado, FormData>(crearFormulario, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="title" required minLength={3} maxLength={120} placeholder="Nombre del nuevo formulario" aria-label="Nombre del nuevo formulario" className="ad-input w-72" disabled={!writable} />
      <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear formulario
      </button>
      {state.message && !state.ok && <p role="alert" className="w-full text-sm font-semibold text-[#7a1f1f]">{state.message}</p>}
    </form>
  );
}
