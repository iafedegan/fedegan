"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { editarNodo, type NodoState } from "@/lib/cms/nodos-actions";
import { aBloques, aElementos, problema, type Bloque, type Elemento } from "@/lib/cms/bloques";
import { Constructor } from "./constructor/Constructor";

function Publicar({ writable, etiqueta }: { writable: boolean; etiqueta: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null} {pending ? "Publicando…" : etiqueta}
    </button>
  );
}

// Edita una página, sección o enlace creado en el árbol del sitio. Una página se arma arrastrando elementos
// (botones, tarjetas, carruseles…) y no se publica hasta pulsar «Publicar cambios».
export function NodoForm({ id, label, title, href, bloques, esEnlace, writable }: { id: string; label: string; title: string; href: string; bloques: Bloque[]; esEnlace: boolean; writable: boolean }) {
  const [elementos, setElementos] = useState<Elemento[]>(() => aElementos(bloques));
  const publicables = useMemo(() => JSON.stringify(aBloques(elementos)), [elementos]);
  // Lo último que se publicó: con él se sabe si quedan cambios por publicar.
  const [publicado, setPublicado] = useState(publicables);
  const [state, action] = useActionState<NodoState, FormData>(async (prev, fd) => {
    const r = await editarNodo(prev, fd);
    if (r.ok) setPublicado(String(fd.get("bloques") ?? ""));
    return r;
  }, {});
  const sucio = !esEnlace && publicables !== publicado;
  const incompletos = useMemo(() => elementos.filter((e) => problema(e) !== null).length, [elementos]);

  // Con cambios sin publicar, el navegador avisa antes de cerrar o recargar la página.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  return (
    <form
      action={action}
      // Enter en un campo de una línea no debe publicar la página sin querer.
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="id" value={id} />
      {esEnlace ? (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="label" className="text-sm font-semibold text-[#11271d]">Nombre en el menú</label>
            <input id="label" name="label" defaultValue={label} maxLength={120} required className="ad-input" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="href" className="text-sm font-semibold text-[#11271d]">Enlace</label>
            <input id="href" name="href" defaultValue={href} required placeholder="/pagos o https://…" className="ad-input" />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="label" className="text-sm font-semibold text-[#11271d]">Nombre en el menú</label>
              <input id="label" name="label" defaultValue={label} maxLength={120} required className="ad-input" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-semibold text-[#11271d]">Título de la página</label>
              <input id="title" name="title" defaultValue={title} maxLength={200} required className="ad-input" />
            </div>
          </div>
          <input type="hidden" name="bloques" value={publicables} />
          <Constructor elementos={elementos} setElementos={setElementos} carpeta={`arbol-${id}`} />
        </>
      )}

      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}
        >
          {state.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {state.message}
        </p>
      )}

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4e2d6] bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(17,39,29,0.45)] backdrop-blur">
        <Publicar writable={writable} etiqueta="Publicar cambios" />
        {sucio && <span className="ad-pill ad-pill-gold">Cambios sin publicar</span>}
        {!esEnlace && incompletos > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1f]">
            <AlertTriangle size={14} aria-hidden /> {incompletos === 1 ? "1 elemento incompleto no se publicará" : `${incompletos} elementos incompletos no se publicarán`}
          </span>
        )}
        {!writable && <span className="text-xs text-[#8a6d1f]">Solo lectura: falta la clave de servicio para guardar.</span>}
      </div>
    </form>
  );
}
