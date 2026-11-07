"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Paperclip, XCircle } from "lucide-react";
import { prepararSubida } from "@/lib/cms/documentos-actions";
import type { DocFaltante } from "@/content/legacy/documentos";

const linea = (nombre: string, url: string) => `- [${nombre.replace(/[[\]]/g, "")}](${url.replace(/\)/g, "%29").replace(/ /g, "%20")})`;

// Documentos de una página: subir archivos (quedan enlazados en el texto) y recuperar los que el sitio actual
// muestra pero la copia migrada no trae. Nada se publica hasta que el editor pulse «Guardar cambios».
export function DocumentosPanel({
  carpeta,
  faltan = [],
  enTablas = 0,
  leer,
  escribir,
}: {
  carpeta: string;
  faltan?: DocFaltante[];
  enTablas?: number;
  leer: () => string;
  escribir: (texto: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [nota, setNota] = useState<{ ok: boolean; text: string } | null>(null);
  const [recuperados, setRecuperados] = useState(false);

  const agregar = (lineas: string[], titulo?: string) => {
    const actual = leer().replace(/\s+$/, "");
    const bloque = (titulo ? `## ${titulo}\n\n` : "") + lineas.join("\n");
    escribir(actual ? `${actual}\n\n${bloque}\n` : `${bloque}\n`);
  };

  const subir = async (files: FileList | null) => {
    if (!files?.length) return;
    setNota(null);
    const hechos: string[] = [];
    const errores: string[] = [];
    for (const file of Array.from(files)) {
      setSubiendo(file.name);
      const r = await prepararSubida({ nombre: file.name, tamano: file.size, carpeta });
      if (!r.ok) {
        errores.push(r.message);
        continue;
      }
      try {
        const res = await fetch(r.signedUrl, { method: "PUT", body: file, headers: { "content-type": r.contentType, "x-upsert": "false", "cache-control": "max-age=3600" } });
        if (!res.ok) throw new Error(String(res.status));
        hechos.push(linea(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), r.publicUrl));
      } catch (e) {
        errores.push(`«${file.name}» no se pudo subir (${e instanceof Error ? e.message : "error"}).`);
      }
    }
    setSubiendo(null);
    if (input.current) input.current.value = "";
    if (hechos.length) agregar(hechos);
    setNota(
      errores.length
        ? { ok: false, text: `${hechos.length ? `Se subieron ${hechos.length}. ` : ""}${errores.join(" ")}` }
        : { ok: true, text: `${hechos.length === 1 ? "Documento subido" : `${hechos.length} documentos subidos`} y enlazado${hechos.length === 1 ? "" : "s"} al final del texto. Cambie el nombre si quiere y pulse «Guardar cambios».` },
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#dcdcd6] bg-[#faf9f4] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#11271d]"><Paperclip size={16} className="text-[#3d7a22]" /> Documentos de la página</p>
        <label className={`ad-btn ad-btn-ghost cursor-pointer ${subiendo ? "pointer-events-none opacity-60" : ""}`}>
          {subiendo ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} {subiendo ? `Subiendo ${subiendo.length > 28 ? `${subiendo.slice(0, 26)}…` : subiendo}` : "Subir documentos"}
          <input ref={input} type="file" multiple className="sr-only" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.csv,.zip,.mp3,.jpg,.jpeg,.png" onChange={(e) => subir(e.target.files)} />
        </label>
      </div>
      <p className="text-xs text-[#5d6e65]">PDF, Excel, Word, PowerPoint, CSV, ZIP o MP3 de hasta 50 MB. Cada archivo queda como un enlace al final del texto; puede moverlo bajo el título que corresponda.</p>

      {enTablas > 0 && (
        <p className="rounded-xl border border-[#e7dcc0] bg-[#fbf6e8] px-3.5 py-2.5 text-xs text-[#6b5a26]">
          Esta página muestra {enTablas} documentos dentro de tablas incrustadas del sitio actual (líneas <code className="font-mono">@video</code>). Esas tablas no se editan aquí: para un periodo nuevo, agregue un título y suba sus documentos.
        </p>
      )}

      {faltan.length > 0 && (
        <div className="rounded-xl border border-[#f0c9b5] bg-[#fdf1ea] px-3.5 py-3 text-sm text-[#6d3216]">
          <p className="font-semibold">{faltan.length === 1 ? "1 documento del sitio actual no está en esta copia" : `${faltan.length} documentos del sitio actual no están en esta copia`}</p>
          <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-auto text-xs">
            {faltan.map(([n, u, t]) => (
              <li key={u} className="flex gap-2"><span className="shrink-0 rounded bg-white/70 px-1.5 font-mono uppercase">{t}</span><a href={u} target="_blank" rel="noopener noreferrer" className="truncate underline underline-offset-2">{n}</a></li>
            ))}
          </ul>
          <button
            type="button"
            disabled={recuperados}
            onClick={() => {
              agregar(faltan.map(([n, u]) => linea(n, u)), "Documentos");
              setRecuperados(true);
              setNota({ ok: true, text: "Se añadieron al final del texto bajo «Documentos». Revise los nombres y pulse «Guardar cambios»." });
            }}
            className="ad-btn ad-btn-ghost mt-3 !bg-white"
          >
            {recuperados ? "Añadidos al texto" : `Añadir ${faltan.length === 1 ? "el documento" : `los ${faltan.length}`} al texto`}
          </button>
        </div>
      )}

      {nota && (
        <p role={nota.ok ? "status" : "alert"} className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${nota.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}>
          {nota.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {nota.text}
        </p>
      )}
    </div>
  );
}
