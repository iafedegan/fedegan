export type AdminNavItem = { label: string; href: string; icon: string; external?: boolean };
export type AdminNavGroup = { group: string; items: AdminNavItem[] };

// Estructura del menú lateral del panel (los íconos se resuelven en el cliente por nombre).
export const adminNav: AdminNavGroup[] = [
  { group: "General", items: [{ label: "Resumen", href: "/admin", icon: "layout" }] },
  {
    group: "Home",
    items: [
      { label: "Locales del gremio", href: "/admin/locales", icon: "store" },
      { label: "Cifras del sector", href: "/admin/cifras", icon: "chart" },
      { label: "Portales aliados", href: "/admin/portales", icon: "link" },
    ],
  },
  {
    group: "Contenido",
    items: [
      { label: "Publicaciones", href: "/admin/publicaciones", icon: "file" },
      { label: "Eventos", href: "/admin/eventos", icon: "calendar" },
      { label: "Preguntas frecuentes", href: "/admin/preguntas", icon: "help" },
    ],
  },
  {
    group: "Sitio",
    items: [
      { label: "Menú principal", href: "/admin/menu", icon: "menu" },
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
