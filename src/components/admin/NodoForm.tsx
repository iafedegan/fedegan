"use client";

import { useActionState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { editarNodo, type NodoState } from "@/lib/cms/nodos-actions";
import type { Bloque } from "@/lib/cms/bloques";
import { BarraPublicar } from "./constructor/BarraPublicar";
import type { MarcoPagina } from "./MarcoPagina";
import { Constructor } from "./constructor/Constructor";
import { useEditorPagina } from "./constructor/useEditorPagina";

// Edita una página, sección o enlace creado en el árbol del sitio. Una página se arma arrastrando elementos
// (botones, tarjetas, carruseles…) y no se publica hasta pulsar «Publicar cambios».
export function NodoForm({ id, label, title, href, bloques, esEnlace, writable, marco }: { id: string; label: string; title: string; href: string; bloques: Bloque[]; esEnlace: boolean; writable: boolean; marco?: MarcoPagina | null }) {
  const { elementos, setElementos, publicables, sucio, incompletos, marcarPublicado, historial } = useEditorPagina(bloques);
  const [state, action] = useActionState<NodoState, FormData>(async (prev, fd) => {
    const r = await editarNodo(prev, fd);
    if (r.ok) marcarPublicado(String(fd.get("bloques") ?? ""));
    return r;
  }, {});

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
          <Constructor elementos={elementos} setElementos={setElementos} carpeta={`arbol-${id}`} historial={historial} marco={marco ?? undefined} />
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

      <BarraPublicar writable={writable} sucio={!esEnlace && sucio} incompletos={esEnlace ? 0 : incompletos} />
    </form>
  );
}
