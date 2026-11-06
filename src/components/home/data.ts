import { getJourneyScenes } from "@/components/blocks/PortalJourney";
import { getEvents, getPartners, getPublications, getStats } from "@/lib/cms/content";
import { getHomeNews } from "@/lib/contexto";
import type { JourneyScene } from "@/components/scroll-world/ScrollWorld";

// Los datos de la portada, los mismos para todas las composiciones: cada plantilla los ordena a su manera.
// Todo sale del CMS (secciones del recorrido con el orden del editor, cifras, eventos, publicaciones, aliados) y de CONtexto Ganadero.
export async function getHomeData() {
  const [scenes, news, stats, events, pubs, partners] = await Promise.all([getJourneyScenes(), getHomeNews(), getStats(), getEvents(), getPublications(), getPartners()]);
  const lead = news.carousel[0] ?? news.latest[0];
  const rest = [...news.carousel.slice(1), ...news.latest].filter((n) => n.slug !== lead?.slug).slice(0, 8);
  const secciones: JourneyScene[] = scenes.filter((s) => s.id !== "noticias" && !s.id.startsWith("aliado-"));
  const aliados: JourneyScene[] = scenes.filter((s) => s.id.startsWith("aliado-"));
  return { scenes, secciones, aliados, lead, rest, stats, events: events.slice(0, 4), pubs: pubs.slice(0, 4), partners };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;

export const two = (n: number) => String(n).padStart(2, "0");
export const fechaCorta = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "");
