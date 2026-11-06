import type { ReactNode } from "react";
import { HeroNews } from "@/components/blocks/HeroNews";
import { PortalJourney } from "@/components/blocks/PortalJourney";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { PublicationsGrid } from "@/components/blocks/PublicationsGrid";
import { PaymentsBand } from "@/components/blocks/PaymentsBand";
import { VoiceAndAgenda } from "@/components/blocks/VoiceAndAgenda";
import { AccountStrip } from "@/components/blocks/AccountStrip";
import { CampaignWall } from "@/components/blocks/Accesos";
import { AdSlot } from "@/components/design/AdSlot";
import type { DesignConfig, TemplateId } from "@/lib/design/regions";
import { getHomeData } from "./data";
import { HomeBento } from "./HomeBento";
import { HomeEditorial } from "./HomeEditorial";
import { HomeAurora } from "./HomeAurora";
import { HomeBrutal } from "./HomeBrutal";
import { HomeCampo } from "./HomeCampo";

export type HomeKind = TemplateId | "clasico";

// La portada de cada plantilla: no solo cambian los colores, cambia la composición de la página.
// «clasico» es la portada de siempre (recorrido a pantalla completa). Se marca con data-home para que el editor sepa cuál se ve.
export async function HomeView({ kind, design }: { kind: HomeKind; design: DesignConfig }) {
  const ad = <AdSlot zone="mid" initial={design.ads.mid} />;
  let cuerpo: ReactNode;
  if (kind === "clasico") {
    cuerpo = (
      <>
        <PortalJourney />
        <HeroNews />
        <PaymentsBand />
        <NewsGrid />
        {ad}
        <VoiceAndAgenda />
        <PublicationsGrid />
        <CampaignWall />
        <AccountStrip />
      </>
    );
  } else {
    const d = await getHomeData();
    const home = kind === "bento" ? <HomeBento d={d} /> : kind === "editorial" ? <HomeEditorial d={d} /> : kind === "aurora" ? <HomeAurora d={d} /> : kind === "brutalista" ? <HomeBrutal d={d} /> : <HomeCampo d={d} />;
    cuerpo = (
      <>
        {home}
        {ad}
        <CampaignWall />
        <AccountStrip />
      </>
    );
  }
  return (
    <div data-home={kind} style={{ display: "contents" }}>
      <AdSlot zone="portada" initial={design.ads.portada} />
      {cuerpo}
    </div>
  );
}
