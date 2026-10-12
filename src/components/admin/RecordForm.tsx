"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Info } from "lucide-react";
import { saveRecord, type FormState } from "@/lib/cms/actions";
import type { Entity, Field } from "@/lib/cms/entities";

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-semibold text-[#11271d]">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-[#d4d1c2] transition-colors peer-checked:bg-[#165a43] peer-focus-visible:ring-2 peer-focus-visible:ring-[#d8b558] peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Submit({ creating, writable }: { creating: boolean; writable: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary w-full">
      {pending ? "Guardando…" : creating ? "Crear" : "Guardar cambios"}
    </button>
  );
}

function Control({ f, value, creating }: { f: Field; value: unknown; creating: boolean }) {
  const v = value == null ? "" : String(value);
  switch (f.type) {
    case "textarea":
      return <textarea id={f.name} name={f.name} defaultValue={v} required={f.required} maxLength={f.max} rows={4} className="ad-input resize-y" />;
    case "select":
      return (
        <select id={f.name} name={f.name} defaultValue={v || f.options?.[0]?.value} className="ad-input">
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "tags":
      return <input id={f.name} name={f.name} defaultValue={Array.isArray(value) ? value.join(", ") : v} className="ad-input" placeholder="Etiqueta 1, Etiqueta 2" />;
    case "date":
      return <input id={f.name} name={f.name} type="date" defaultValue={v} required={f.required} className="ad-input" />;
    case "slug":
      return (
        <input
          id={f.name}
          name={f.name}
          defaultValue={v}
          readOnly={!creating}
          placeholder={creating ? "Se genera del nombre si lo deja vacío" : undefined}
          className={`ad-input ${creating ? "" : "bg-[#f4f3ec] text-[#5d6e65]"}`}
        />
      );
    case "image":
    case "file":
      return (
        <div className="flex flex-col gap-3">
          {v && f.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v} alt="" className="h-32 w-auto max-w-full self-start rounded-xl border border-[#e4e2d6] bg-[#f4f3ec] object-contain" />
          )}
          {v && f.type === "file" && (
            <a href={v} target="_blank" rel="noreferrer" className="self-start text-sm font-semibold text-[#165a43] underline underline-offset-4">Ver archivo actual</a>
          )}
          <input id={f.name} name={f.name} defaultValue={v} className="ad-input" placeholder="Dirección (/ruta o https://…)" />
          <input
            name={`${f.name}__file`}
            type="file"
            accept={f.type === "file" ? "application/pdf,image/*" : "image/jpeg,image/png,image/webp,image/avif"}
            className="text-sm text-[#5d6e65] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#e8f0eb] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#165a43]"
          />
        </div>
      );
    case "number":
      return <input id={f.name} name={f.name} type="number" defaultValue={v} required={f.required} className="ad-input" />;
    default:
      return <input id={f.name} name={f.name} defaultValue={v} required={f.required} maxLength={f.max} placeholder={f.placeholder} className="ad-input" />;
  }
}

export function RecordForm({
  entity,
  record,
  writable,
}: {
  entity: Entity;
  record: Record<string, unknown> | null;
  writable: boolean;
}) {
  const creating = !record;
  const [state, action] = useActionState<FormState, FormData>(saveRecord, {});
  const toggles = entity.fields.filter((f) => f.type === "bool");
  const fields = entity.fields.filter((f) => f.type !== "bool");
  const updatedAt = record?.updated_at ? new Date(String(record.updated_at)).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : null;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-start">
      <input type="hidden" name="_entity" value={entity.key} />
      <input type="hidden" name="_id" value={(record?.id as string | undefined) ?? ""} />

      <div className="ad-card flex flex-col gap-6 p-6 sm:p-8">
        {state.error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> {state.error}
          </p>
        )}
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-2">
            <label htmlFor={f.name} className="text-sm font-semibold text-[#11271d]">
              {f.label}
              {f.required && <span className="text-[#b08f4f]"> *</span>}
            </label>
            <Control f={f} value={record?.[f.name]} creating={creating} />
            {f.help && <p className="text-xs text-[#8a978f]">{f.help}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <div className="ad-card flex flex-col gap-5 p-5 sm:p-6">
          <h2 className="text-base font-bold">Publicación</h2>
          <Toggle name="published" label="Publicado en el sitio" defaultChecked={creating ? true : Boolean(record?.published)} />
          {toggles.map((f) => (
            <Toggle key={f.name} name={f.name} label={f.label} defaultChecked={Boolean(record?.[f.name])} />
          ))}
          <div className="flex flex-col gap-2 border-t border-[#e4e2d6] pt-5">
            <Submit creating={creating} writable={writable} />
            <Link href={`/admin/${entity.key}`} className="ad-btn ad-btn-ghost w-full">Cancelar</Link>
            {!writable && <p className="text-xs text-[#8a6d1f]">Solo lectura: falta la clave de servicio para guardar.</p>}
          </div>
        </div>
        {!creating && (
          <div className="ad-card flex items-start gap-3 p-5 text-sm text-[#5d6e65]">
            <Info size={16} className="mt-0.5 shrink-0 text-[#b08f4f]" />
            <p>
              Última edición: {updatedAt ?? "—"}
              {record?.updated_by ? <> por <strong className="font-semibold text-[#11271d]">{String(record.updated_by)}</strong></> : null}.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
