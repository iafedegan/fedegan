// Accesos de un toque (lo que más se hace desde el celular). Se muestran como iconos en la portada táctil y arriba del menú.
// Lo que está aquí no se repite en las listas del menú.
export const ACCESOS_RAPIDOS = [
  { id: "pagos", href: "/pagos", label: "Pagos" },
  { id: "cifras", href: "/seccion/cifras-del-sector", label: "Cifras" },
  { id: "eventos", href: "/eventos", label: "Eventos" },
  { id: "servicios", href: "/servicios", label: "Servicios" },
  { id: "escuela", href: "/escuela-virtual", label: "Escuela" },
  { id: "contacto", href: "/contacto", label: "Contacto" },
] as const;

export type AccesoId = (typeof ACCESOS_RAPIDOS)[number]["id"];
