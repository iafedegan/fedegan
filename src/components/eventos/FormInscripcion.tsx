"use client";

import { useActionState } from "react";
import { inscribirse, type InscripcionEstado } from "@/lib/cms/inscripciones-actions";

const input = "w-full rounded-xl border border-[#dcdcd6] bg-white px-4 py-3 text-base text-[#10240f] outline-none transition focus:border-[#72bf44] focus:ring-4 focus:ring-[#72bf44]/20";

// Formulario público de inscripción: pocos campos, en una columna en móvil y dos en pantallas anchas.
export function FormInscripcion({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<InscripcionEstado, FormData>(inscribirse, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="slug" value={slug} />
      <div aria-hidden className="absolute -left-[9999px]" style={{ height: 0, overflow: "hidden" }}>
        <label>Sitio web <input name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#10240f] sm:col-span-2">Nombre completo
        <input name="name" required maxLength={120} autoComplete="name" className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#10240f]">Correo electrónico
        <input name="email" type="email" required maxLength={160} autoComplete="email" className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#10240f]">Celular
        <input name="phone" type="tel" maxLength={30} autoComplete="tel" className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#10240f]">Documento <span className="font-normal text-[#5d6e65]">(opcional)</span>
        <input name="document" maxLength={30} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#10240f]">Empresa o gremio <span className="font-normal text-[#5d6e65]">(opcional)</span>
        <input name="organization" maxLength={120} autoComplete="organization" className={input} />
      </label>
      {state.error && <p role="alert" className="rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f] sm:col-span-2">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-xl bg-[#89114c] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#6b0c3a] disabled:opacity-60 sm:col-span-2 sm:justify-self-start">
        {pending ? "Inscribiendo…" : "Inscribirme"}
      </button>
      <p className="text-xs text-[#5d6e65] sm:col-span-2">Recibirá un código con su QR para ingresar al evento.</p>
    </form>
  );
}
