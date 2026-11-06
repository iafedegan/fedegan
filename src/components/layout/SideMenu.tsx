import { getPartners, getPisos } from "@/lib/cms/content";
import { getPublishedDesign } from "@/lib/design/store";
import { SideMenuView, type SideItem } from "./SideMenuView";

// Mismas opciones y mismo orden que el recorrido de la portada.
export async function SideMenu() {
  const [pisos, aliados, design] = await Promise.all([getPisos(), getPartners(), getPublishedDesign()]);
  const items: SideItem[] = pisos.flatMap((p) => p.locales).map((l) => ({ id: l.id, label: l.nombre, href: l.href, external: l.external }));
  items.push({ id: "pagos", label: "Zona de pagos", href: "/pagos" });
  items.push({ id: "noticias", label: "Noticias en CONtexto Ganadero", href: "/noticias" });
  for (const a of aliados) {
    if (/contexto/i.test(a.nombre)) continue;
    items.push({ id: `aliado-${a.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label: a.nombre, href: a.href, external: true });
  }
  const seen = new Set<string>();
  const list = items.filter((i) => (seen.has(i.label) ? false : (seen.add(i.label), true)));
  if (design.order.length) {
    const rank = (id: string) => {
      const i = design.order.indexOf(id);
      return i === -1 ? design.order.length : i;
    };
    list.sort((a, b) => rank(a.id) - rank(b.id));
  }
  if (list.length < 2) return null;
  return <SideMenuView items={list} />;
}
