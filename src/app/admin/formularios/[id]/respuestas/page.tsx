import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download, Pencil, Trash2 } from "lucide-react";
import { formularioPorId, respuestasDe } from "@/lib/cms/formularios";
import { eliminarRespuesta } from "@/lib/cms/formularios-actions";

export const metadata: Metadata = { title: "Respuestas del formulario", robots: { index: false } };

const texto = (v: string | string[]) => (Array.isArray(v) ? v.join(", ") : v);

export default async function RespuestasPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  const { id } = await params;
  const { q = "" } = await searchParams;
  const f = await formularioPorId(id);
  if (!f) notFound();
  const todas = await respuestasDe(id);
  const term = q.trim().toLowerCase();
  const lista = term ? todas.filter((r) => r.answers.some((a) => texto(a.v).toLowerCase().includes(term))) : todas;
  const fmt = (d: string) => new Date(d).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const ayer = new Date(new Date().getTime() - 86_400_000).toISOString();
  const hoy = todas.filter((r) => r.created_at >= ayer).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
            <Link href="/admin/formularios" className="hover:text-[#165a43]">Formularios</Link><ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">Respuestas</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Respuestas</h1>
          <p className="mt-1.5 text-[#5d6e65]">{f.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/formularios/${id}`} className="ad-btn ad-btn-ghost"><Pencil size={16} /> Editar formulario</Link>
          <a href={`/admin/formularios/${id}/respuestas/csv`} className="ad-btn ad-btn-ghost"><Download size={16} /> Descargar CSV</a>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Respuestas", todas.length], ["Últimas 24 horas", hoy], ["Preguntas", f.schema.campos.length]].map(([t, n]) => (
          <div key={String(t)} className="ad-card px-5 py-4"><p className="text-sm text-[#5d6e65]">{t}</p><p className="text-3xl font-bold">{n}</p></div>
        ))}
      </div>

      <div className="ad-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceae0] px-5 py-3.5 sm:px-6">
          <form method="get" role="search" className="flex gap-2">
            <input type="search" name="q" defaultValue={q} placeholder="Buscar en las respuestas" aria-label="Buscar" className="ad-input w-72" />
            <button type="submit" className="rounded-lg bg-[#eef6f1] px-3.5 py-2 text-sm font-semibold text-[#165a43]">Buscar</button>
          </form>
          <p className="text-sm text-[#5d6e65]">{lista.length} {lista.length === 1 ? "respuesta" : "respuestas"}</p>
        </div>
        {lista.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">{term ? "Nada coincide con la búsqueda." : "Todavía no hay respuestas."}</p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {lista.map((r) => (
              <li key={r.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#5d6e65]">{fmt(r.created_at)} <span className="font-normal text-[#8a978f]">· versión {r.version}</span></p>
                  <form action={eliminarRespuesta}>
                    <input type="hidden" name="id" value={r.id} /><input type="hidden" name="form" value={id} />
                    <button type="submit" aria-label="Eliminar esta respuesta" title="Eliminar" className="ad-icon-btn hover:!border-[#d64545] hover:!text-[#d64545]"><Trash2 size={15} /></button>
                  </form>
                </div>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
                  {r.answers.map((a, k) => {
                    const v = texto(a.v);
                    return (
                      <div key={k} className="contents">
                        <dt className="text-[#5d6e65]">{a.e}</dt>
                        <dd className="[overflow-wrap:anywhere]">{/^https:\/\//.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#165a43] hover:underline">Abrir archivo</a> : v}</dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
