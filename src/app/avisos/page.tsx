import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AvisosGrouped } from "@/components/blocks/Accesos";

export const metadata: Metadata = { title: "Avisos y convocatorias" };

export default function AvisosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Avisos"
        title="Avisos y convocatorias"
        description="Comunicados del recaudo, campañas del sector y avisos de aliados, ordenados por tema."
        image="/headers/ia-avisos.jpg"
        imagePos="50% 50%"
        breadcrumbs={[{ label: "Avisos" }]}
        compact
      />
      <AvisosGrouped />
    </>
  );
}
