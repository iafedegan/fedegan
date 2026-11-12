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
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
            <Link href="/admin/formularios" className="hover:text-[#165a43]">Formularios</Link><ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">Editar</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{f.title}</h1>
        </div>
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
