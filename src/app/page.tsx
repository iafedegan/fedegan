import { Hero } from "@/components/blocks/Hero";
import { QuickAccessGrid } from "@/components/blocks/QuickAccessGrid";
import { MallDirectory } from "@/components/blocks/MallDirectory";
import { StatsStrip } from "@/components/blocks/StatsStrip";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { PublicationsGrid } from "@/components/blocks/PublicationsGrid";
import { EventsGrid } from "@/components/blocks/EventsGrid";
import { InfoLinksRow } from "@/components/blocks/InfoLinksRow";
import { MembershipBanner } from "@/components/blocks/MembershipBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickAccessGrid />
      <MallDirectory />
      <StatsStrip />
      <NewsGrid />
      <PublicationsGrid />
      <EventsGrid />
      <InfoLinksRow />
      <MembershipBanner />
    </>
  );
}
