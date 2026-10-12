import { getPisos } from "@/lib/cms/content";
import { getHomeNews } from "@/lib/contexto";
import { getPublishedDesign } from "@/lib/design/store";
import { journeyPhotos } from "@/content/scroll-world";
import { ScrollWorld, type JourneyScene } from "@/components/scroll-world/ScrollWorld";

// Recorrido scroll por los locales del directorio y las noticias, con fotos reales de finca.
// Los textos salen del CMS; la foto, de journeyPhotos (o la del propio local si no hay).
export async function PortalJourney() {
  const [pisos, news, design] = await Promise.all([getPisos(), getHomeNews(), getPublishedDesign()]);
  const scenes: JourneyScene[] = [];
  for (const l of pisos.flatMap((p) => p.locales)) {
    const photo = journeyPhotos[l.id];
    const image = photo?.src ?? l.imagen;
    if (!image) continue;
    scenes.push({
      id: l.id,
      nombre: l.nombre,
      rubro: l.rubro,
      descripcion: l.descripcion,
      tags: l.tags ?? [],
      href: l.href,
      external: l.external,
      accent: l.accent ?? "216,181,88",
      image,
      pos: photo?.pos ?? l.imagenPos ?? "50% 50%",
      alt: photo?.alt ?? l.nombre,
    });
  }

  // Noticias cierra el recorrido: usa la foto de la última nota con imagen (sin las generadas con IA).
  const lead = news.carousel.find((n) => n.image && !n.imageAlt?.toLowerCase().startsWith("imagen generada con ia"));
  scenes.push({
    id: "noticias",
    nombre: "Noticias",
    rubro: "Actualidad",
    descripcion: "Notas, análisis y actualidad del sector ganadero colombiano, publicadas por CONtexto Ganadero.",
    tags: ["CONtexto Ganadero"],
    href: "/noticias",
    accent: "216,181,88",
    image: lead?.image ?? "/headers/campo.jpg",
    pos: lead?.image ? "50% 50%" : "20% 45%",
    alt: lead?.imageAlt ?? "Vacas pastando en un potrero con cerca de alambre y árboles",
  });

  if (design.order.length) {
    const rank = (id: string) => {
      const i = design.order.indexOf(id);
      return i === -1 ? design.order.length : i;
    };
    scenes.sort((a, b) => rank(a.id) - rank(b.id));
  }

  if (scenes.length < 2) return null;
  return <ScrollWorld scenes={scenes} />;
}
