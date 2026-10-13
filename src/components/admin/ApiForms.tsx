"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Plug, XCircle } from "lucide-react";
import { saveApiKey, testApi, type ApiState } from "@/lib/cms/api-actions";

function Notice({ state }: { state: ApiState }) {
  if (!state.message) return null;
  const Icon = state.ok ? CheckCircle2 : XCircle;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${
        state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"
      }`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" /> {state.message}
    </p>
  );
}

function Pending({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return pending ? (
    <>
      <Loader2 size={16} className="animate-spin" /> {busy}
    </>
  ) : (
    <>{label}</>
  );
}

export function ApiTestButton({ id }: { id: string }) {
  const [state, action] = useActionState<ApiState, FormData>(testApi, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <SubmitTest />
      <Notice state={state} />
    </form>
  );
}

function SubmitTest() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="ad-btn ad-btn-ghost self-start">
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />} {pending ? "Probando…" : "Probar conexión"}
    </button>
  );
}

export function ApiKeyForm({ id, disabled, hint }: { id: string; disabled: boolean; hint?: string }) {
  const [state, action] = useActionState<ApiState, FormData>(saveApiKey, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`key-${id}`} className="text-sm font-semibold text-[#11271d]">
        {hint ? "Reemplazar la clave" : "Guardar una clave desde el panel"}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`key-${id}`}
          name="key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          placeholder="Pegue aquí la clave de la API"
          className="ad-input flex-1 font-mono"
        />
        <button type="submit" disabled={disabled} className="ad-btn ad-btn-primary sm:w-52">
          <Pending label="Verificar y guardar" busy="Verificando…" />
        </button>
      </div>
      <p className="text-xs text-[#8a978f]">Se prueba contra CONtexto antes de guardarla, se cifra y solo la lee el servidor.</p>
      <Notice state={state} />
    </form>
  );
}
