import { NewsCarousel } from "./NewsCarousel";
import { getNoticias } from "@/lib/contexto";

export async function HeroNews() {
  const { items } = await getNoticias(12);
  const withImage = items.filter((n) => n.image);
  const picked = (withImage.length >= 3 ? withImage : items).slice(0, 5);
  return <NewsCarousel items={picked} />;
}
