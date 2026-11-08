import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, Download, QrCode, Undo2, UserCheck } from "lucide-react";
import { getEditor } from "@/lib/cms/guard";
import { adminDb } from "@/lib/cms/client";
import { inscritosDe } from "@/lib/cms/inscripciones";
import { asistenciaPorCodigo, marcarAsistencia } from "@/lib/cms/inscripciones-actions";

export const metadata: Metadata = { title: "Inscritos al evento", robots: { index: false } };

export default async function InscritosPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; res?: string }> }) {
  const ed = await getEditor();
  if (!ed) notFound();
  const { id } = await params;
  const { q = "", res = "" } = await searchParams;
  const db = adminDb();
  const { data: ev } = db ? await db.from("events").select("id,title,slug").eq("id", id).maybeSingle() : { data: null };
  if (!ev) notFound();
  const todos = await inscritosDe(id);
  const term = q.trim().toLowerCase();
  const lista = term ? todos.filter((i) => `${i.name} ${i.email} ${i.code} ${i.document ?? ""} ${i.organization ?? ""}`.toLowerCase().includes(term)) : todos;
  const asistieron = todos.filter((i) => i.checked_in_at).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
            <Link href="/admin/eventos" className="hover:text-[#165a43]">Eventos</Link><ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">Inscritos</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Inscritos</h1>
          <p className="mt-1.5 text-[#5d6e65]">{String(ev.title)}</p>
        </div>
        <a href={`/admin/eventos/${id}/inscritos/csv`} className="ad-btn ad-btn-ghost"><Download size={16} /> Descargar CSV</a>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Inscritos", todos.length], ["Asistieron", asistieron], ["Pendientes", todos.length - asistieron]].map(([t, n]) => (
          <div key={String(t)} className="ad-card px-5 py-4"><p className="text-sm text-[#5d6e65]">{t}</p><p className="text-3xl font-bold">{n}</p></div>
        ))}
      </div>

      <section className="ad-card p-5 sm:p-6" aria-labelledby="pt">
        <h2 id="pt" className="flex items-center gap-2 text-lg font-bold"><QrCode size={18} /> Registrar asistencia por código</h2>
        <p className="mt-1 text-sm text-[#5d6e65]">Escriba el código del QR (o use un lector de códigos: escribe y envía solo).</p>
        <form action={asistenciaPorCodigo} className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="event" value={id} />
          <input name="code" required autoFocus autoComplete="off" placeholder="FED-XXXXXXXX" className="ad-input max-w-xs font-mono uppercase" />
          <button type="submit" className="ad-btn ad-btn-primary">Registrar</button>
        </form>
        {res.startsWith("ok:") && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#14573a]"><CheckCircle2 size={16} /> Asistencia registrada: {res.slice(3)}</p>}
        {res === "no" && <p role="alert" className="mt-3 text-sm font-semibold text-[#7a1f1f]">Ese código no corresponde a este evento.</p>}
      </section>

      <div className="ad-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceae0] px-5 py-3.5 sm:px-6">
          <form method="get" role="search" className="flex gap-2">
            <input type="search" name="q" defaultValue={q} placeholder="Buscar por nombre, correo o código" aria-label="Buscar" className="ad-input w-72" />
            <button type="submit" className="rounded-lg bg-[#eef6f1] px-3.5 py-2 text-sm font-semibold text-[#165a43]">Buscar</button>
          </form>
          <p className="text-sm text-[#5d6e65]">{lista.length} {lista.length === 1 ? "persona" : "personas"}</p>
        </div>
        {lista.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">{term ? "Nadie coincide con la búsqueda." : "Todavía no hay inscritos."}</p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {lista.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-semibold">{i.name}</p>
                  <p className="truncate text-sm text-[#5d6e65]">{i.email}{i.organization ? ` · ${i.organization}` : ""}</p>
                </div>
                <code className="rounded-md bg-[#f1f0e8] px-2 py-1 text-xs font-bold">{i.code}</code>
                {i.checked_in_at ? <span className="ad-pill ad-pill-ok"><UserCheck size={12} /> Asistió</span> : <span className="ad-pill ad-pill-off">Pendiente</span>}
                <form action={marcarAsistencia}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="event" value={id} />
                  {i.checked_in_at && <input type="hidden" name="undo" value="1" />}
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdcd6] px-3 py-2 text-sm font-medium text-[#165a43] hover:bg-[#eef6f1]">
                    {i.checked_in_at ? <><Undo2 size={14} /> Deshacer</> : <><UserCheck size={14} /> Marcar asistencia</>}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
