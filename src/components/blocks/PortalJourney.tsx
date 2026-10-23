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
      // «Cifras del sector» abre directo el Observatorio: sin segundo nivel.
      subs: l.id === "cifras" ? [] : subsOf(l.id),
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
    descripcion: "¿Quiere estar súper informado de lo que pasa en el sector? Entre a CONtexto Ganadero: periodismo del sector ganadero y agropecuario de Colombia, con verificación humana en cada nota, análisis y datos al día.",
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
    programas: "FEDEGÁN, el Fondo Nacional del Ganado, el Fondo de Estabilización de Precios, Fundagán y el proyecto Ganadería Colombiana Sostenible: conozca los programas con los que el gremio impulsa una ganadería más sostenible, sana y competitiva, y fomenta el consumo de carne y leche.",
    normatividad: "Leyes, decretos y resoluciones que rigen el sector ganadero, desde la Ley 89 de 1993 de la cuota de fomento hasta las normas sanitarias vigentes. ¿Busca una norma? Encuéntrela con el buscador y consúltela completa.",
    publicaciones: "Libros, cartillas, la revista Carta Fedegán, cuadernos ganaderos y presentaciones del gremio: material técnico y de consulta para productores, estudiantes e investigadores, con filtros por tema y por año.",
    cifras: "El Observatorio ganadero reúne precios del ganado, inventario por departamento, sacrificio, consumo, mercado internacional y costos de producción. Datos oficiales de FEDEGÁN, con gráficas que puede explorar y descargar.",
    fng: "El Fondo Nacional del Ganado administra la cuota de fomento ganadero y lechero y la invierte en sanidad, ciencia y tecnología, y consumo. Conozca su junta directiva, la información de transparencia y los canales de atención.",
    fep: "El Fondo de Estabilización de Precios respalda la exportación de carne, leche y sus derivados. Consulte su estructura, funciones, normatividad, información financiera, contratación y atención al ciudadano.",
    sig: "El Sistema Integrado de Gestión reúne la gestión de calidad, la seguridad y salud en el trabajo y la calidad estadística de FEDEGÁN. Conozca las políticas, los procesos y los reglamentos que guían la operación del gremio.",
  };
  for (const sc of scenes) if (FRASES[sc.id]) sc.descripcion = FRASES[sc.id];

  // Portales aliados: cierran el recorrido, cada uno con su escena y su enlace externo.
  const ALIADOS: Record<string, { texto: string; image: string; pos: string; acc: string; alt: string; extra?: JourneyScene["extra"] }> = {
    tvgan: { texto: "Mire la televisión del campo. Tu Vitrina Ganadera, el programa de TvGan, se emite de lunes a viernes desde las 6:00 p. m.: no se desconecte de lo que pasa en el sector.", image: "/headers/prensa.jpg", pos: "50% 45%", acc: "230,160,108", alt: "Cobertura periodística en un evento ganadero", extra: { etiqueta: "Compra y vende ganado", texto: "¿Quiere comprar o vender ganado? Hágalo fácil, rápido y seguro con TvGan.", href: "https://bit.ly/VERLOTESAQUI" } },
    fundagan: { texto: "La Fundación Colombia Ganadera trabaja por la ganadería, los derechos humanos y la responsabilidad social. Conozca sus proyectos y cómo acompaña a las comunidades ganaderas del país.", image: "/locales/programas.jpg", pos: "30% 55%", acc: "92,205,134", alt: "Ganadero con ruana observando su hato al atardecer" },
    bursagan: { texto: "Bursagán es la bolsa ganadera del sector: un espacio para el comercio y la información del mercado de ganado en Colombia.", image: "/locales/cifras.jpg", pos: "70% 50%", acc: "112,214,196", alt: "Vaca en una sala de ordeño con datos de producción" },
    "maestro-de-la-carne": { texto: "Maestro de la Carne, de Friogán, promueve la carne colombiana de calidad y la lleva a más mesas. Descubra el sello del gremio para la mesa de los consumidores.", image: "/locales/publicaciones.jpg", pos: "35% 50%", acc: "216,181,88", alt: "Ganadero junto a su hato con informes sobre la mesa" },
    "colombian-beef": { texto: "Colombian Beef presenta la carne de res colombiana alimentada con pasto (grass-fed), para mostrarla en el mundo con la garantía del gremio.", image: "/headers/campo.jpg", pos: "50% 42%", acc: "190,222,203", alt: "Vacas pastando en un potrero con cerca de alambre" },
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
