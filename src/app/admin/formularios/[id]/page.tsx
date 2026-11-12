import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, Inbox } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { FormularioConstructor } from "@/components/admin/FormularioConstructor";
import { cmsWritable } from "@/lib/cms/client";
import { formularioPorId } from "@/lib/cms/formularios";

export const metadata: Metadata = { title: "Editar formulario", robots: { index: false } };

export default async function EditarFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await formularioPorId(id);
  if (!f) notFound();
  const sinPublicar = JSON.stringify(f.schema) !== JSON.stringify(f.published);
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta" className="flex min-w-0 items-center gap-1.5 text-sm text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={13} />
          <Link href="/admin/formularios" className="hover:text-[#165a43]">Formularios</Link><ChevronRight size={13} />
          <h1 className="truncate font-semibold text-[#10240f]">{f.title}</h1>
        </nav>
        <div className="flex flex-wrap gap-2">
          {f.published && f.status !== "borrador" && <Link href={`/formularios/${f.slug}`} target="_blank" className="ad-btn ad-btn-ghost"><ExternalLink size={16} /> Ver público</Link>}
          <Link href={`/admin/formularios/${f.id}/respuestas`} className="ad-btn ad-btn-ghost"><Inbox size={16} /> Respuestas</Link>
        </div>
      </header>
      {!cmsWritable && <ConfigNotice compact />}
      <FormularioConstructor
        id={f.id} estado={f.status} version={f.version} writable={cmsWritable}
        hayCambiosSinPublicar={sinPublicar}
        inicial={{ title: f.title, description: f.description, slug: f.slug, schema: f.schema }}
      />
    </div>
  );
}
