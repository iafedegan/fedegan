import "server-only";
import { getLocales, getPartners, type NavItem } from "@/lib/cms/content";
import { ACCESOS_RAPIDOS } from "@/content/accesos-rapidos";

export type MenuItem = { label: string; href: string; external?: boolean };
export type MenuGrupo = { id: string; titulo: string; items: MenuItem[] };

const ACTUALIDAD: MenuItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Noticias", href: "/noticias" },
  { label: "Opinión", href: "/opinion" },
];

const clave = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * El menú único de celular y tableta: junta el menú principal, las secciones del recorrido y los portales aliados,
 * sin repetir nada. Lo que ya está en los accesos de un toque o en «Actualidad» no vuelve a salir en «El gremio».
 */
export async function getMenuGrupos(nav: NavItem[]): Promise<MenuGrupo[]> {
  const [locales, aliados] = await Promise.all([getLocales(), getPartners()]);
  const vistos = new Set<string>([...ACCESOS_RAPIDOS.map((a) => a.href), ...ACTUALIDAD.map((a) => a.href)]);
  const nombres = new Set<string>([...ACCESOS_RAPIDOS.map((a) => clave(a.label)), ...ACTUALIDAD.map((a) => clave(a.label))]);
  const gremio: MenuItem[] = [];
  const sumar = (label: string, href: string, external?: boolean) => {
    if (!label || !href || vistos.has(href) || nombres.has(clave(label))) return;
    vistos.add(href);
    nombres.add(clave(label));
    gremio.push({ label, href, ...(external ? { external } : {}) });
  };
  for (const n of nav) sumar(n.label, n.href);
  // Secciones del recorrido de la portada que no están en el menú principal (p. ej. Normatividad).
  for (const l of locales) sumar(l.nombre, l.href, l.external);

  const portales = aliados
    .filter((a) => a.href && !/contexto/i.test(a.nombre))
    .slice(0, 8)
    .map((a) => ({ label: a.nombre, href: a.href, external: true }));

  return [
    { id: "actualidad", titulo: "Actualidad", items: ACTUALIDAD },
    { id: "gremio", titulo: "El gremio", items: gremio },
    { id: "aliados", titulo: "Portales aliados", items: portales },
  ].filter((g) => g.items.length > 0);
}
