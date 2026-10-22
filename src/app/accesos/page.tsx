import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccessHub, CampaignWall, PresidentColumn } from "@/components/blocks/Accesos";
import { ContactChannels } from "@/components/blocks/ContactChannels";

export const metadata: Metadata = { title: "Pagos, trámites y avisos" };

export default function AccesosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acceso directo"
        title="Pagos, trámites y avisos"
        description="Pague la cuota, consulte su registro, radique una solicitud y vea los avisos vigentes, todo en un solo lugar."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        breadcrumbs={[{ label: "Pagos y trámites" }]}
        compact
      />
      <AccessHub />
      <CampaignWall all />
      <PresidentColumn />
      <ContactChannels />
    </>
  );
}
