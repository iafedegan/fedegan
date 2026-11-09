import type { NavItem } from "./NavTree";

// Las secciones con cientos de páginas (columna del presidente, cartas, publicaciones) no deben mandar el menú completo en cada página:
// pesaba casi 1 MB de HTML. Una lista de más de MAX_HERMANOS páginas se recorta a una ventana alrededor de la página actual,
// con un enlace «Ver todas» a la portada de la sección.
export const MAX_HERMANOS = 40;
const VENTANA = 12;

const contiene = (n: NavItem, key: string): boolean => n.key === key || Boolean(n.children?.some((c) => contiene(c, key)));

export function podarMenu(nodes: NavItem[], current: string, verTodas: string): NavItem[] {
  const hijos = nodes.map((n) => (n.children?.length ? { ...n, children: podarMenu(n.children, current, verTodas) } : n));
  if (hijos.length <= MAX_HERMANOS) return hijos;
  const i = hijos.findIndex((n) => contiene(n, current));
  const desde = i < 0 ? 0 : Math.max(0, i - VENTANA);
  const hasta = i < 0 ? Math.min(hijos.length, VENTANA * 2) : Math.min(hijos.length, i + VENTANA + 1);
  return [...hijos.slice(desde, hasta), { label: `Ver las ${hijos.length} páginas →`, href: verTodas }];
}
