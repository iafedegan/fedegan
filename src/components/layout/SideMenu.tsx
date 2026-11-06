import { getPisos } from "@/lib/cms/content";
import { getPublishedDesign } from "@/lib/design/store";
import { SideMenuView, type SideItem } from "./SideMenuView";

// Mismas opciones y mismo orden que el recorrido de la portada.
export async function SideMenu() {
  const [pisos, design] = await Promise.all([getPisos(), getPublishedDesign()]);
  const items: SideItem[] = pisos.flatMap((p) => p.locales).filter((l) => l.id !== "tvgan").map((l) => ({ id: l.id, label: l.nombre, href: l.href, external: l.external }));
  items.push({ id: "pagos", label: "Zona de pagos", href: "/pagos" });
  items.push({ id: "noticias", label: "Noticias en CONtexto Ganadero", href: "/noticias" });
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
