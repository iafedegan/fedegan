import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { MallDirectory } from "@/components/blocks/MallDirectory";

export const metadata: Metadata = { title: "Directorio del portal" };

export default function DirectorioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plano del ecosistema"
        title="Directorio del portal"
        description="Una sola entrada, varios locales: cada línea de valor de FEDEGÁN–FNG tiene su espacio dentro del mismo portal, con buscador y navegación comunes."
        breadcrumbs={[{ label: "Directorio" }]}
      />
      <MallDirectory showLink={false} />
    </>
  );
}
