import { getPisos } from "@/lib/cms/content";
import { getHomeNews, getSecciones } from "@/lib/contexto";
import { getPublishedDesign } from "@/lib/design/store";
import { journeyPhotos } from "@/content/scroll-world";
import { getLegacyPage, legacyHref } from "@/content/legacy";
import menuData from "@/content/legacy/mainmenu.json";
import { ScrollWorld, type JourneyScene, type JourneySub } from "@/components/scroll-world/ScrollWorld";

// Recorrido scroll por los locales del directorio y las noticias, con fotos reales de finca.
// Los textos salen del CMS; la foto, de journeyPhotos (o la del propio local si no hay).
// Escena → opción del menú principal del portal actual.
const MENU_OF: Record<string, string> = {
  programas: "Programas",
  normatividad: "Normatividad",
  publicaciones: "Publicaciones",
  cifras: "Cifras del Sector",
  fng: "FNG",
  fep: "FEP",
  sig: "Sistema Integrado de Gestión",
};

const menu = menuData as { label: string; href: string; subs: { label: string; href: string }[] }[];

// Opciones de segundo nivel de cada escena: las mismas del menú desplegable del portal actual.
// Si la página ya se copió se abre dentro del portal; si no, en el sitio original.
function subsOf(id: string): JourneySub[] {
  const item = menu.find((m) => m.label === MENU_OF[id]);
  if (!item) return [];
  const seen = new Set<string>();
  const out: JourneySub[] = [];
  for (const sub of item.subs) {
    const key = sub.href.replace(/^https?:\/\/(www\.)?fedegan\.org\.co\//, "").replace(/\/$/, "");
    const page = getLegacyPage(key);
    const slug = page?.sections[0];
    const entry: JourneySub = page && slug ? { label: sub.label, href: legacyHref(slug, key) } : { label: sub.label, href: sub.href.replace(/^http:/, "https:"), external: true };
    if (!seen.has(entry.href)) {
      seen.add(entry.href);
      out.push(entry);
    }
  }
  return out;
}

export async function PortalJourney() {
  const [pisos, news, design, secciones] = await Promise.all([getPisos(), getHomeNews(), getPublishedDesign(), getSecciones()]);
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
      subs: subsOf(l.id),
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
    subs: secciones.map((c) => ({ label: c.nombre, href: `/noticias?categoria=${c.slug}` })),
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
