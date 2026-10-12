import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { DesignEditor } from "@/components/admin/DesignEditor";
import { cmsWritable } from "@/lib/cms/client";
import { getEditor } from "@/lib/cms/guard";
import { EMPTY_DESIGN } from "@/lib/design/regions";
import { getEditorState } from "@/lib/design/store";
import { getPisos } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Diseño del sitio · Panel del portal", robots: { index: false } };

export default async function DisenoPage() {
  const ed = await getEditor();
  const state = ed && cmsWritable ? await getEditorState(ed.actor) : null;
  const pisos = await getPisos();
  const locals = [...pisos.flatMap((p) => p.locales).map((l) => ({ id: l.id, label: l.nombre })), { id: "noticias", label: "Noticias" }];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Diseño del sitio</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Diseño del sitio</h1>
        <p className="mt-1.5 max-w-2xl text-[#5d6e65]">
          Cambie colores, tipografías, tamaños y espacios de cada zona viendo el sitio real. Los cambios quedan en un borrador hasta que los publique.
        </p>
      </header>

      {!cmsWritable && <ConfigNotice compact />}

      <DesignEditor
        writable={cmsWritable}
        initialPublished={state?.published ?? EMPTY_DESIGN}
        initialDraft={state?.draft ?? EMPTY_DESIGN}
        canUndo={state?.canUndo ?? false}
        locals={locals}
      />
    </div>
  );
}
