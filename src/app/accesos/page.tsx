import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccessHub, AvisosGrouped, PresidentColumn } from "@/components/blocks/Accesos";
import { ContactChannels } from "@/components/blocks/ContactChannels";

export const metadata: Metadata = { title: "Pagos, trámites y avisos" };

export default function AccesosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acceso directo"
        title="Pagos, trámites y avisos"
        description="Pague la cuota, consulte su registro, radique una solicitud y vea los avisos vigentes, todo en un solo lugar."
        image="/headers/ia-accesos.jpg"
        imagePos="50% 50%"
        breadcrumbs={[{ label: "Pagos y trámites" }]}
        compact
      />
      <AccessHub />
      <AvisosGrouped />
      <PresidentColumn />
      <ContactChannels />
    </>
  );
}
