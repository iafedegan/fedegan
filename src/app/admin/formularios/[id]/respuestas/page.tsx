import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { FormularioPestanas } from "@/components/admin/FormularioPestanas";
import { esFilas, valorTexto, type CampoForm } from "@/lib/cms/formulario-esquema";
import { formularioPorId, respuestasDe } from "@/lib/cms/formularios";
import { eliminarRespuesta } from "@/lib/cms/formularios-actions";

export const metadata: Metadata = { title: "Respuestas del formulario", robots: { index: false } };

const texto = valorTexto;

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
      <FormularioPestanas id={id} titulo={f.title} slug={f.slug} publico={Boolean(f.published) && f.status !== "borrador"} activa="respuestas">
        <a href={`/admin/formularios/${id}/exportar?formato=xlsx`} className="ad-btn ad-btn-ghost"><Download size={16} /> Excel</a>
        <a href={`/admin/formularios/${id}/exportar?formato=csv`} className="ad-btn ad-btn-ghost"><Download size={16} /> CSV</a>
      </FormularioPestanas>

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
                    if (esFilas(a.v)) {
                      const cols = (f.schema.campos.find((c: CampoForm) => c.id === a.id)?.columnas ?? []);
                      return (
                        <div key={k} className="contents">
                          <dt className="text-[#5d6e65]">{a.e}<span className="mt-1 block text-xs text-[#8a978f]">{a.v.length} {a.v.length === 1 ? "fila" : "filas"}</span></dt>
                          <dd className="flex flex-col gap-3">
                            {a.v.map((fila, i) => {
                              const ids = [...cols.map((c: { id: string }) => c.id), ...Object.keys(fila).filter((x) => !cols.some((c: { id: string }) => c.id === x))];
                              const [principal, ...resto] = ids.filter((x) => fila[x]);
                              const et = (x: string) => cols.find((c: { id: string; etiqueta: string }) => c.id === x)?.etiqueta ?? x;
                              return (
                                <div key={i} className="rounded-xl border border-[#e3e8dc] bg-[#fafbf6] p-3.5">
                                  <p className="font-semibold text-[#10240f]"><span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3f0d8] px-1.5 text-xs text-[#165a43]">{i + 1}</span>{principal ? fila[principal] : ""}</p>
                                  <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,15rem)_1fr]">
                                    {resto.map((x) => (
                                      <div key={x} className="contents">
                                        <dt className="text-xs text-[#6b7d71]">{et(x)}</dt>
                                        <dd className="whitespace-pre-line [overflow-wrap:anywhere]">{fila[x]}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                </div>
                              );
                            })}
                          </dd>
                        </div>
                      );
                    }
                    const v = texto(a.v);
                    return (
                      <div key={k} className="contents">
                        <dt className="text-[#5d6e65]">{a.e}</dt>
                        <dd className="whitespace-pre-line [overflow-wrap:anywhere]">{/^https:\/\//.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#165a43] hover:underline">Abrir archivo</a> : v}</dd>
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
