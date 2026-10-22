import { HeroNews } from "@/components/blocks/HeroNews";
import { PortalJourney } from "@/components/blocks/PortalJourney";
import { PortalesAliados } from "@/components/blocks/PortalesAliados";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { PublicationsGrid } from "@/components/blocks/PublicationsGrid";
import { PaymentsBand } from "@/components/blocks/PaymentsBand";
import { VoiceAndAgenda } from "@/components/blocks/VoiceAndAgenda";
import { AccountStrip } from "@/components/blocks/AccountStrip";
import { CampaignWall } from "@/components/blocks/Accesos";
import { AdSlot } from "@/components/design/AdSlot";
import { getPublishedDesign } from "@/lib/design/store";

// Portada: recorrido, noticias, zona de pagos, voz del gremio, publicaciones, avisos y aliados.
export default async function Home() {
  const design = await getPublishedDesign();
  return (
    <>
      <PortalJourney />
      <HeroNews />
      <PaymentsBand />
      <NewsGrid />
      <AdSlot zone="mid" initial={design.ads.mid} />
      <VoiceAndAgenda />
      <PublicationsGrid />
      <CampaignWall />
      <PortalesAliados />
      <AccountStrip />
    </>
  );
}
