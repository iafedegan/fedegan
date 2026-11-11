import type { ReactNode } from "react";
import { PortalJourney } from "@/components/blocks/PortalJourney";
import { AccountStrip } from "@/components/blocks/AccountStrip";
import { CampaignWall } from "@/components/blocks/Accesos";
import { AdSlot } from "@/components/design/AdSlot";
import type { DesignConfig, TemplateId } from "@/lib/design/regions";
import { getHomeData } from "./data";
import { HomeInstitucional } from "./HomeInstitucional";
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
        <HomeInstitucional d={await getHomeData()} banners={[design.ads.portada, ...(design.banners ?? [])].filter((b): b is NonNullable<typeof b> => Boolean(b))} />
        {ad}
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
      {kind !== "clasico" && <AdSlot zone="portada" initial={design.ads.portada} />}
      {cuerpo}
    </div>
  );
}
