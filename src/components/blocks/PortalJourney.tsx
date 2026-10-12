import { getPisos } from "@/lib/cms/content";
import { journeyPhotos } from "@/content/scroll-world";
import { ScrollWorld, type JourneyScene } from "@/components/scroll-world/ScrollWorld";

// Recorrido scroll por los locales del directorio (101–107) con fotos reales de finca.
// Los textos salen del CMS; la foto, de journeyPhotos (o la del propio local si no hay).
export async function PortalJourney() {
  const pisos = await getPisos();
  const scenes: JourneyScene[] = [];
  for (const l of pisos.flatMap((p) => p.locales)) {
    const photo = journeyPhotos[l.id];
    const image = photo?.src ?? l.imagen;
    if (!image) continue;
    scenes.push({
      id: l.id,
      numero: l.numero,
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
  if (scenes.length < 2) return null;
  return <ScrollWorld scenes={scenes} />;
}
