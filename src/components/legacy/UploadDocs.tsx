"use client";

import { useActionState, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { subirDocumentos, type SubirState } from "@/lib/cms/recibidos-actions";

// Botón para que el visitante cargue documentos. En la vista previa del editor no envía nada.
export function UploadDocs({ label, preview = false }: { label: string; preview?: boolean }) {
  const [state, action, pending] = useActionState<SubirState, FormData>(subirDocumentos, {});
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      action={action}
      onSubmit={(e) => preview && e.preventDefault()}
      className="my-5 flex max-w-xl flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4"
    >
      <input ref={input} type="file" name="archivos" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(e) => !preview && e.currentTarget.files?.length && e.currentTarget.form?.requestSubmit()} />
      <button type="button" disabled={pending} onClick={() => input.current?.click()} className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--fg-green-800)] px-5 py-2.5 text-sm font-bold text-[var(--text-on-brand)] transition-opacity hover:opacity-90 disabled:opacity-60">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {pending ? "Cargando…" : label}
      </button>
      <p className="text-xs text-[var(--text-muted)]">PDF, Word, Excel, JPG o PNG · hasta 5 archivos de 10 MB.</p>
      {state.message && <p role={state.ok ? "status" : "alert"} className={`text-sm font-semibold ${state.ok ? "text-[var(--fg-lime-400)]" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
