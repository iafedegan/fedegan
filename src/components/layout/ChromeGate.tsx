"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Oculta partes del marco del sitio en ciertas rutas: por defecto el pie de página en las pantallas de acceso
// (caben completas en una sola vista). `en`: los prefijos de ruta donde no se muestra.
export function ChromeGate({ children, en = ["/ingresar"] }: { children: ReactNode; en?: string[] }) {
  const pathname = usePathname();
  return en.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ? null : <>{children}</>;
}
