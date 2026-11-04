import type { Metadata } from "next";
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
