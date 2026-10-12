import { HeroNews } from "@/components/blocks/HeroNews";
import { PortalJourney } from "@/components/blocks/PortalJourney";
import { PortalesAliados } from "@/components/blocks/PortalesAliados";
import { StatsStrip } from "@/components/blocks/StatsStrip";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { PublicationsGrid } from "@/components/blocks/PublicationsGrid";
import { EventsGrid } from "@/components/blocks/EventsGrid";
import { InfoLinksRow } from "@/components/blocks/InfoLinksRow";
import { MembershipBanner } from "@/components/blocks/MembershipBanner";

export default function Home() {
  return (
    <>
      <PortalJourney />
      <HeroNews />
      <PortalesAliados />
      <StatsStrip />
      <NewsGrid />
      <PublicationsGrid />
      <EventsGrid />
      <InfoLinksRow />
      <MembershipBanner />
    </>
  );
}
