import { HeroNews } from "@/components/blocks/HeroNews";
import { PortalJourney } from "@/components/blocks/PortalJourney";
import { PortalesAliados } from "@/components/blocks/PortalesAliados";
import { StatsStrip } from "@/components/blocks/StatsStrip";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { PublicationsGrid } from "@/components/blocks/PublicationsGrid";
import { EventsGrid } from "@/components/blocks/EventsGrid";
import { InfoLinksRow } from "@/components/blocks/InfoLinksRow";
import { AdSlot } from "@/components/design/AdSlot";
import { getPublishedDesign } from "@/lib/design/store";
import { MembershipBanner } from "@/components/blocks/MembershipBanner";

export default async function Home() {
  const design = await getPublishedDesign();
  return (
    <>
      <PortalJourney />
      <HeroNews />
      <PortalesAliados />
      <AdSlot zone="mid" initial={design.ads.mid} />
      <StatsStrip />
      <NewsGrid />
      <PublicationsGrid />
      <EventsGrid />
      <InfoLinksRow />
      <MembershipBanner />
    </>
  );
}
