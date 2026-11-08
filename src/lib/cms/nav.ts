export type AdminNavItem = { label: string; href: string; icon: string; external?: boolean };
export type AdminNavGroup = { group: string; items: AdminNavItem[] };

// Estructura del menú lateral del panel (los íconos se resuelven en el cliente por nombre).
export const adminNav: AdminNavGroup[] = [
  { group: "General", items: [{ label: "Resumen", href: "/admin", icon: "layout" }] },
  {
    group: "Escuela Virtual",
    items: [
      { label: "Cursos", href: "/admin/cursos", icon: "graduation" },
      { label: "Estudiantes", href: "/admin/estudiantes", icon: "users" },
    ],
  },
  {
    group: "Sitio",
    items: [
      { label: "Diseño del sitio", href: "/admin/diseno", icon: "palette" },
      { label: "Árbol del sitio", href: "/admin/arbol", icon: "tree" },
      { label: "Actividad", href: "/admin/actividad", icon: "history" },
    ],
  },
  {
    group: "Enlaces",
    items: [
      { label: "Ver el sitio", href: "/", icon: "globe", external: true },
      { label: "Panel de CONtexto", href: "https://contexto-olive.vercel.app/panel", icon: "newspaper", external: true },
    ],
  },
];
