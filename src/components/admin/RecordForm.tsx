"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveRecord, type FormState } from "@/lib/cms/actions";
import type { Entity, Field } from "@/lib/cms/entities";

const control =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none transition-shadow focus:border-[var(--fg-lime-500)] focus:shadow-[0_0_0_4px_rgba(216,181,88,0.18)]";

function Submit({ creating }: { creating: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-6 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)] transition-colors hover:bg-[var(--fg-lime-400)] disabled:opacity-60"
    >
      {pending ? "Guardando…" : creating ? "Crear" : "Guardar cambios"}
    </button>
  );
}

function Control({ f, value, creating }: { f: Field; value: unknown; creating: boolean }) {
  const v = value == null ? "" : String(value);
  switch (f.type) {
    case "textarea":
      return <textarea id={f.name} name={f.name} defaultValue={v} required={f.required} maxLength={f.max} rows={4} className={`${control} resize-y`} />;
    case "select":
      return (
        <select id={f.name} name={f.name} defaultValue={v || f.options?.[0]?.value} className={control}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "bool":
      return (
        <input id={f.name} name={f.name} type="checkbox" defaultChecked={Boolean(value)} className="h-5 w-5 accent-[var(--fg-lime-500)]" />
      );
    case "tags":
      return <input id={f.name} name={f.name} defaultValue={Array.isArray(value) ? value.join(", ") : v} className={control} placeholder="Etiqueta 1, Etiqueta 2" />;
    case "date":
      return <input id={f.name} name={f.name} type="date" defaultValue={v} required={f.required} className={control} />;
    case "slug":
      return (
        <input
          id={f.name}
          name={f.name}
          defaultValue={v}
          readOnly={!creating}
          placeholder={creating ? "Se genera del nombre si lo deja vacío" : undefined}
          className={`${control} ${creating ? "" : "opacity-60"}`}
        />
      );
    case "image":
    case "file":
      return (
        <div className="flex flex-col gap-2.5">
          {v && f.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v} alt="" className="h-28 w-auto max-w-full self-start rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
          )}
          {v && f.type === "file" && (
            <a href={v} target="_blank" rel="noreferrer" className="self-start text-sm font-semibold text-[var(--fg-lime-400)] underline underline-offset-4">Ver archivo actual</a>
          )}
          <input id={f.name} name={f.name} defaultValue={v} className={control} placeholder="Dirección (/ruta o https://…)" />
          <input
            name={`${f.name}__file`}
            type="file"
            accept={f.type === "file" ? "application/pdf,image/*" : "image/jpeg,image/png,image/webp,image/avif"}
            className="text-sm text-[var(--text-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--bg-muted)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--fg-lime-400)]"
          />
        </div>
      );
    case "number":
      return <input id={f.name} name={f.name} type="number" defaultValue={v} required={f.required} className={control} />;
    default:
      return <input id={f.name} name={f.name} defaultValue={v} required={f.required} maxLength={f.max} placeholder={f.placeholder} className={control} />;
  }
}

export function RecordForm({ entity, record }: { entity: Entity; record: Record<string, unknown> | null }) {
  const creating = !record;
  const [state, action] = useActionState<FormState, FormData>(saveRecord, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="_entity" value={entity.key} />
      <input type="hidden" name="_id" value={(record?.id as string | undefined) ?? ""} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-[#d64545] bg-[rgba(214,69,69,0.12)] px-4 py-3 text-sm text-[var(--text)]">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#ff8a8a]" /> {state.error}
        </p>
      )}

      {entity.fields.map((f) => (
        <div key={f.name} className={f.type === "bool" ? "flex items-center gap-3" : "flex flex-col gap-2"}>
          {f.type === "bool" && <Control f={f} value={record?.[f.name]} creating={creating} />}
          <label htmlFor={f.name} className="text-sm font-semibold text-[var(--text)]">
            {f.label}
            {f.required && <span className="text-[var(--fg-lime-400)]"> *</span>}
          </label>
          {f.type !== "bool" && <Control f={f} value={record?.[f.name]} creating={creating} />}
          {f.help && f.type !== "bool" && <p className="text-xs text-[var(--text-faint)]">{f.help}</p>}
        </div>
      ))}

      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-5">
        <input id="published" name="published" type="checkbox" defaultChecked={creating ? true : Boolean(record?.published)} className="h-5 w-5 accent-[var(--fg-lime-500)]" />
        <label htmlFor="published" className="text-sm font-semibold text-[var(--text)]">Publicado en el sitio</label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Submit creating={creating} />
        <Link href={`/admin/${entity.key}`} className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
