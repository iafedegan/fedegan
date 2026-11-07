"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, FilePlus2, XCircle } from "lucide-react";
import { savePagina, type PaginaState } from "@/lib/cms/pagina-actions";
import { nuevoId, type Bloque } from "@/lib/cms/bloques";
import type { DocFaltante } from "@/content/legacy/documentos";
import { BarraPublicar } from "./constructor/BarraPublicar";
import { Constructor } from "./constructor/Constructor";
import { useEditorPagina } from "./constructor/useEditorPagina";

// Documentos que el sitio actual muestra y la copia migrada no trae, y aviso de los que están dentro de tablas incrustadas.
function Documentos({ faltan, enTablas, onAnadir }: { faltan: DocFaltante[]; enTablas: number; onAnadir: () => void }) {
  const [hecho, setHecho] = useState(false);
  return (
    <>
      {enTablas > 0 && (
        <p className="rounded-xl border border-[#e7dcc0] bg-[#fbf6e8] px-3.5 py-2.5 text-xs leading-relaxed text-[#6b5a26]">
          Esta página muestra {enTablas} documentos dentro de elementos «Video o tablero» del sitio actual. Esos no se editan aquí: para un periodo nuevo, añada un título y una lista de documentos.
        </p>
      )}
      {faltan.length > 0 && !hecho && (
        <div className="rounded-xl border border-[#f0c9b5] bg-[#fdf1ea] px-3.5 py-3 text-sm text-[#6d3216]">
          <p className="font-semibold">{faltan.length === 1 ? "1 documento del sitio actual no está en esta copia" : `${faltan.length} documentos del sitio actual no están en esta copia`}</p>
          <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-auto text-xs">
            {faltan.map(([n, u, t]) => (
              <li key={u} className="flex gap-2">
                <span className="shrink-0 rounded bg-white/70 px-1.5 font-mono uppercase">{t}</span>
                <a href={u} target="_blank" rel="noopener noreferrer" className="truncate underline underline-offset-2">{n}</a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              onAnadir();
              setHecho(true);
            }}
            className="ad-btn ad-btn-ghost mt-3 !bg-white"
          >
            <FilePlus2 size={16} /> {faltan.length === 1 ? "Añadir el documento a la página" : `Añadir los ${faltan.length} a la página`}
          </button>
        </div>
      )}
      {faltan.length > 0 && hecho && (
        <p role="status" className="rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-3.5 py-2.5 text-sm text-[#14573a]">
          Se añadieron al final de la página, bajo el título «Documentos». Revise los nombres y pulse «Publicar cambios».
        </p>
      )}
    </>
  );
}

// Edita una página copiada del portal actual. Se ve y se arma con los mismos elementos que una página nueva; el texto
// original se conserva y se puede restaurar. Nada se publica hasta pulsar «Publicar cambios».
export function PaginaForm({ pageKey, title, bloques, writable, faltan, enTablas }: { pageKey: string; title: string; bloques: Bloque[]; writable: boolean; faltan?: DocFaltante[]; enTablas?: number }) {
  const { elementos, setElementos, publicables, sucio, incompletos, marcarPublicado, historial } = useEditorPagina(bloques);
  const [state, action] = useActionState<PaginaState, FormData>(async (prev, fd) => {
    const r = await savePagina(prev, fd);
    if (r.ok) marcarPublicado(String(fd.get("bloques") ?? ""));
    return r;
  }, {});

  const anadirFaltantes = () =>
    setElementos((prev) => [
      ...prev,
      { id: nuevoId(), tipo: "h2", texto: "Documentos" },
      { id: nuevoId(), tipo: "lista", items: (faltan ?? []).map(([nombre, url]) => ({ texto: nombre, url })) },
    ]);

  return (
    <form
      action={action}
      // Enter en un campo de una línea no debe publicar la página sin querer.
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="key" value={pageKey} />
      <input type="hidden" name="bloques" value={publicables} />
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold text-[#11271d]">Título de la página</label>
        <input id="title" name="title" defaultValue={title} maxLength={200} required className="ad-input" />
      </div>
      <Documentos faltan={faltan ?? []} enTablas={enTablas ?? 0} onAnadir={anadirFaltantes} />
      <Constructor elementos={elementos} setElementos={setElementos} carpeta={pageKey} fiel historial={historial} />

      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}
        >
          {state.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {state.message}
        </p>
      )}

      <BarraPublicar writable={writable} sucio={sucio} incompletos={incompletos} />
    </form>
  );
}
