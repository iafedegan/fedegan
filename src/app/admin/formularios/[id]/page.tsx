import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioPestanas } from "@/components/admin/FormularioPestanas";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { FormularioConstructor } from "@/components/admin/FormularioConstructor";
import { cmsWritable } from "@/lib/cms/client";
import { formularioPorId } from "@/lib/cms/formularios";
import { mapaCargos } from "@/lib/cms/catalogos";
import { CATALOGOS } from "@/lib/cms/formulario-esquema";

export const metadata: Metadata = { title: "Editar formulario", robots: { index: false } };

export default async function EditarFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await formularioPorId(id);
  if (!f) notFound();
  const sinPublicar = JSON.stringify(f.schema) !== JSON.stringify(f.published);
  return (
    <div className="flex flex-col gap-4">
      <FormularioPestanas id={f.id} titulo={f.title} slug={f.slug} publico={Boolean(f.published) && f.status !== "borrador"} activa="constructor" />
      {!cmsWritable && <ConfigNotice compact />}
      <FormularioConstructor
        id={f.id} estado={f.status} mapas={Object.fromEntries(CATALOGOS.map((c) => [c.id, mapaCargos(c.id) ?? {}]))} version={f.version} writable={cmsWritable}
        hayCambiosSinPublicar={sinPublicar}
        inicial={{ title: f.title, description: f.description, slug: f.slug, schema: f.schema }}
      />
    </div>
  );
}
