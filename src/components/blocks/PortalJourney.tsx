import { getPartners, getPisos } from "@/lib/cms/content";
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
  const [pisos, news, design, secciones, aliados] = await Promise.all([getPisos(), getHomeNews(), getPublishedDesign(), getSecciones(), getPartners()]);
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
    nombre: "Noticias en CONtexto Ganadero",
    rubro: "Actualidad",
    descripcion: "¿Quiere estar súper informado de lo que pasa en el sector? Entre a CONtexto Ganadero.",
    extra: news.carousel[0] ? { etiqueta: "La noticia del día", texto: news.carousel[0].title, href: `/noticias/${news.carousel[0].slug}` } : undefined,
    tags: ["CONtexto Ganadero"],
    href: "/noticias",
    subs: secciones.map((c) => ({ label: c.nombre, href: `/noticias?categoria=${c.slug}` })),
    accent: "216,181,88",
    image: lead?.image ?? "/headers/campo.jpg",
    pos: lead?.image ? "50% 50%" : "20% 45%",
    alt: lead?.imageAlt ?? "Vacas pastando en un potrero con cerca de alambre y árboles",
  });

  // Frases de invitación para cada sección (reemplazan la descripción neutra del directorio).
  const FRASES: Record<string, string> = {
    programas: "Conozca los programas con los que FEDEGÁN impulsa una ganadería sostenible, sana y con más consumo de carne y leche.",
    normatividad: "¿Busca una ley, un decreto o una resolución del sector? Encuéntrela aquí, con buscador.",
    publicaciones: "Libros, cartillas, revistas y presentaciones para aprender de la ganadería colombiana.",
    cifras: "Precios, inventario por departamento y consumo: las cifras oficiales del sector, siempre al día.",
    fng: "Conozca el Fondo Nacional del Ganado y cómo se invierte la cuota de fomento ganadero y lechero.",
    fep: "Fondo de Estabilización de Precios: respaldo a la exportación de carne, leche y sus derivados.",
    sig: "Así cuidamos la calidad, la seguridad y la información estadística de FEDEGÁN.",
  };
  for (const sc of scenes) if (FRASES[sc.id]) sc.descripcion = FRASES[sc.id];

  // Portales aliados: cierran el recorrido, cada uno con su escena y su enlace externo.
  const ALIADOS: Record<string, { texto: string; image: string; pos: string; acc: string; alt: string; extra?: JourneyScene["extra"] }> = {
    tvgan: { texto: "Mire la televisión del campo: Tu Vitrina Ganadera, de lunes a viernes desde las 6:00 p. m.", image: "/headers/prensa.jpg", pos: "50% 45%", acc: "230,160,108", alt: "Cobertura periodística en un evento ganadero", extra: { etiqueta: "Compra y vende ganado", texto: "¿Quiere comprar o vender ganado? Hágalo fácil, rápido y seguro con TvGan.", href: "https://bit.ly/VERLOTESAQUI" } },
    fundagan: { texto: "Conozca el trabajo de Fundagán en ganadería, derechos humanos y responsabilidad social.", image: "/locales/programas.jpg", pos: "30% 55%", acc: "92,205,134", alt: "Ganadero con ruana observando su hato al atardecer" },
    bursagan: { texto: "Entre a Bursagán, la bolsa ganadera del sector.", image: "/locales/cifras.jpg", pos: "70% 50%", acc: "112,214,196", alt: "Vaca en una sala de ordeño con datos de producción" },
    "maestro-de-la-carne": { texto: "Descubra Maestro de la Carne, el sello de Friogán para la carne colombiana.", image: "/locales/publicaciones.jpg", pos: "35% 50%", acc: "216,181,88", alt: "Ganadero junto a su hato con informes sobre la mesa" },
    "colombian-beef": { texto: "Colombian Beef: carne de res colombiana alimentada con pasto, para el mundo.", image: "/headers/campo.jpg", pos: "50% 42%", acc: "190,222,203", alt: "Vacas pastando en un potrero con cerca de alambre" },
  };
  for (const a of aliados) {
    if (/contexto/i.test(a.nombre)) continue;
    const key = a.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const info = ALIADOS[key];
    if (!info) continue;
    scenes.push({
      id: `aliado-${key}`,
      nombre: a.nombre,
      rubro: "Portal aliado",
      descripcion: info.texto,
      tags: [],
      href: a.href,
      external: true,
      extra: info.extra,
      accent: info.acc,
      image: info.image,
      pos: info.pos,
      alt: info.alt,
    });
  }

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
