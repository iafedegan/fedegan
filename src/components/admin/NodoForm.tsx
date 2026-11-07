"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { editarNodo, type NodoState } from "@/lib/cms/nodos-actions";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { textToBlocks } from "@/lib/cms/paginas-texto";
import { RedactarIA, type OpcionIA } from "./RedactarIA";
import { DocumentosPanel } from "./DocumentosPanel";

function Guardar({ writable }: { writable: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null} {pending ? "Publicando…" : "Publicar cambios"}
    </button>
  );
}

export type IAConfig = { opciones: OpcionIA[]; guia: string; ruta: string; seccion: string };

// Edita una página, sección o enlace creado en el árbol del sitio.
export function NodoForm({ id, label, title, href, texto, esEnlace, writable, ia }: { id: string; label: string; title: string; href: string; texto: string; esEnlace: boolean; writable: boolean; ia?: IAConfig }) {
  const [state, action] = useActionState<NodoState, FormData>(editarNodo, {});
  const labelRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const textoRef = useRef<HTMLTextAreaElement>(null);
  const [borrador, setBorrador] = useState(texto);
  const vista = useMemo(() => textToBlocks(borrador), [borrador]);
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-2">
        <label htmlFor="label" className="text-sm font-semibold text-[#11271d]">Nombre en el menú</label>
        <input ref={labelRef} id="label" name="label" defaultValue={label} maxLength={120} required className="ad-input" />
      </div>
      {esEnlace ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="href" className="text-sm font-semibold text-[#11271d]">Enlace</label>
          <input id="href" name="href" defaultValue={href} required placeholder="/pagos o https://…" className="ad-input" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-semibold text-[#11271d]">Título de la página</label>
            <input ref={titleRef} id="title" name="title" defaultValue={title} maxLength={200} required className="ad-input" />
          </div>
          {ia && (
            <RedactarIA
              opciones={ia.opciones}
              guia={ia.guia}
              contexto={{ titulo: () => titleRef.current?.value ?? title, nombre: () => labelRef.current?.value ?? label, ruta: ia.ruta, seccion: ia.seccion }}
              leer={() => textoRef.current?.value ?? ""}
              escribir={(t) => {
                if (!textoRef.current) return;
                textoRef.current.value = t;
                setBorrador(t);
                textoRef.current.focus();
              }}
            />
          )}
          <DocumentosPanel
            carpeta={`arbol-${id}`}
            leer={() => textoRef.current?.value ?? ""}
            escribir={(t) => {
              if (textoRef.current) textoRef.current.value = t;
            }}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="texto" className="text-sm font-semibold text-[#11271d]">Contenido</label>
            <textarea ref={textoRef} id="texto" name="texto" value={borrador} onChange={(e) => setBorrador(e.target.value)} spellCheck rows={24} className="ad-input min-h-[26rem] resize-y font-mono text-[0.85rem] leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#11271d]">Vista previa <span className="font-normal text-[#5d6e65]">· así quedará; no se publica hasta pulsar «Publicar cambios»</span></p>
            <div className="rounded-2xl border border-dashed border-[#c9d8bf] bg-white p-5">
              {vista.length ? <LegacyContent blocks={vista} preview /> : <p className="text-sm text-[#5d6e65]">Aún no hay contenido.</p>}
            </div>
          </div>
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
      <div className="flex flex-wrap items-center gap-3">
        <Guardar writable={writable} />
        {!writable && <span className="text-xs text-[#8a6d1f]">Solo lectura: falta la clave de servicio para guardar.</span>}
      </div>
    </form>
  );
}
