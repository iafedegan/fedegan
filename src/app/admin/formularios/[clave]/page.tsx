import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download, Paperclip } from "lucide-react";
import { getEditor } from "@/lib/cms/guard";
import { respuestasDe, textoRespuesta } from "@/lib/cms/formularios";

export const metadata: Metadata = { title: "Respuestas del formulario", robots: { index: false } };

const cuando = (iso: string) => new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });
const esUrl = (v: string) => /^https:\/\//.test(v);

export default async function RespuestasPage({ params, searchParams }: { params: Promise<{ clave: string }>; searchParams: Promise<{ q?: string }> }) {
  if (!(await getEditor())) notFound();
  const { clave } = await params;
  const { q = "" } = await searchParams;
  const todas = await respuestasDe(clave);
  if (todas.length === 0) notFound();
  const term = q.trim().toLowerCase();
  const lista = term ? todas.filter((r) => r.answers.map((a) => textoRespuesta(a.v)).join(" ").toLowerCase().includes(term)) : todas;
  const preguntas = [...new Set(todas.flatMap((r) => r.answers.map((a) => a.e)))];
  const fallidos = todas.filter((r) => r.webhook && r.webhook !== "ok").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
            <Link href="/admin/formularios" className="hover:text-[#165a43]">Formularios</Link><ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">{clave}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{todas[0].form_title || clave}</h1>
          <p className="mt-1.5 text-[#5d6e65]">{todas.length} {todas.length === 1 ? "respuesta" : "respuestas"}{fallidos > 0 && ` · ${fallidos} no llegaron a la API (se guardaron igual)`}</p>
        </div>
        <a href={`/admin/formularios/${clave}/csv`} className="ad-btn ad-btn-ghost"><Download size={16} /> Descargar CSV</a>
      </header>

      <div className="ad-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceae0] px-5 py-3.5 sm:px-6">
          <form method="get" role="search" className="flex gap-2">
            <input type="search" name="q" defaultValue={q} placeholder="Buscar en las respuestas" aria-label="Buscar" className="ad-input w-72" />
            <button type="submit" className="rounded-lg bg-[#eef6f1] px-3.5 py-2 text-sm font-semibold text-[#165a43]">Buscar</button>
          </form>
          <p className="text-sm text-[#5d6e65]">{lista.length} de {todas.length}</p>
        </div>
        {lista.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">Ninguna respuesta coincide con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#eceae0] text-xs uppercase tracking-wider text-[#5d6e65]">
                  <th className="whitespace-nowrap px-5 py-3 font-bold">Recibida</th>
                  {preguntas.map((p) => <th key={p} className="px-3 py-3 font-bold">{p}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceae0]">
                {lista.map((r) => (
                  <tr key={r.id} className="align-top odd:bg-[#fafaf5]">
                    <td className="whitespace-nowrap px-5 py-3 text-[#5d6e65]">{cuando(r.created_at)}</td>
                    {preguntas.map((p) => {
                      const v = r.answers.find((a) => a.e === p)?.v ?? "";
                      const txt = textoRespuesta(v);
                      return (
                        <td key={p} className="max-w-xs px-3 py-3 [overflow-wrap:anywhere]">
                          {esUrl(txt) ? <a href={txt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#165a43] hover:underline"><Paperclip size={13} /> Archivo</a> : txt || <span className="text-[#b5bdb7]">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
