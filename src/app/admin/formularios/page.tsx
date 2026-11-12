import type { Metadata } from "next";
import Link from "next/link";
import { Copy, ExternalLink, Inbox, Lock, Unlock } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { NuevoFormulario } from "@/components/admin/NuevoFormulario";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { cmsWritable } from "@/lib/cms/client";
import { listarFormularios } from "@/lib/cms/formularios";
import { cambiarEstadoFormulario, duplicarFormulario, eliminarFormulario } from "@/lib/cms/formularios-actions";

export const metadata: Metadata = { title: "Formularios", robots: { index: false } };

const PILL = { borrador: "ad-pill ad-pill-off", publicado: "ad-pill ad-pill-ok", cerrado: "ad-pill ad-pill-off" } as const;
const NOMBRE = { borrador: "Borrador", publicado: "Publicado", cerrado: "Cerrado" } as const;

export default async function FormulariosPage() {
  const formularios = await listarFormularios();
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Formularios</h1>
          <p className="mt-1.5 text-[#5d6e65]">Cree formularios, publíquelos con su propia dirección y reciba las respuestas aquí.</p>
        </div>
        <NuevoFormulario writable={cmsWritable} />
      </header>
      {!cmsWritable && <ConfigNotice compact />}

      <div className="ad-card">
        {formularios.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">Todavía no hay formularios. Escriba un nombre arriba y pulse «Crear formulario».</p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {formularios.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-60">
                  <Link href={`/admin/formularios/${f.id}`} className="block truncate font-semibold text-[#10240f] hover:text-[#165a43] hover:underline">{f.title}</Link>
                  <p className="truncate text-sm text-[#5d6e65]">/formularios/{f.slug} · {f.schema.campos.length} {f.schema.campos.length === 1 ? "pregunta" : "preguntas"} · editado {fmt(f.updated_at)}</p>
                </div>
                <span className={PILL[f.status]}>{NOMBRE[f.status]}</span>
                <Link href={`/admin/formularios/${f.id}/respuestas`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdcd6] px-3 py-2 text-sm font-medium text-[#165a43] hover:bg-[#eef6f1]">
                  <Inbox size={14} /> {f.respuestas ?? 0} {(f.respuestas ?? 0) === 1 ? "respuesta" : "respuestas"}
                </Link>
                <div className="flex items-center gap-1.5">
                  {f.published && f.status !== "borrador" && (
                    <Link href={`/formularios/${f.slug}`} target="_blank" aria-label={`Abrir ${f.title}`} title="Abrir el formulario público" className="ad-icon-btn"><ExternalLink size={16} /></Link>
                  )}
                  {f.status === "publicado" && (
                    <form action={cambiarEstadoFormulario}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="estado" value="cerrado" />
                      <button type="submit" title="Cerrar: deja de recibir respuestas" aria-label={`Cerrar ${f.title}`} className="ad-icon-btn"><Lock size={16} /></button></form>
                  )}
                  {f.status === "cerrado" && (
                    <form action={cambiarEstadoFormulario}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="estado" value="publicado" />
                      <button type="submit" title="Reabrir para recibir respuestas" aria-label={`Reabrir ${f.title}`} className="ad-icon-btn"><Unlock size={16} /></button></form>
                  )}
                  <form action={duplicarFormulario}><input type="hidden" name="id" value={f.id} />
                    <button type="submit" title="Duplicar" aria-label={`Duplicar ${f.title}`} className="ad-icon-btn"><Copy size={16} /></button></form>
                  <form action={eliminarFormulario}><input type="hidden" name="id" value={f.id} /><DeleteButton label={f.title} /></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
