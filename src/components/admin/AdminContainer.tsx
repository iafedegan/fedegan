"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Ancho del contenido del panel: el editor de diseño ocupa todo el ancho disponible; el resto, una columna cómoda de lectura.
export function AdminContainer({ children }: { children: ReactNode }) {
  const ancho = usePathname().startsWith("/admin/diseno");
  return <div className={`mx-auto w-full px-4 py-7 sm:px-8 sm:py-10 ${ancho ? "max-w-none lg:px-6 lg:py-6" : "max-w-6xl"}`}>{children}</div>;
}
