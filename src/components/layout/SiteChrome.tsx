"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { UniversityShell } from "./UniversityShell";

// Encabezado, pie y barra móvil del sitio público. El panel /admin trae su propio marco.
export function SiteChrome({ top, bottom, children }: { top: ReactNode; bottom: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  // La Escuela Virtual (UCG) es un espacio aparte, con su propio marco.
  if (pathname.startsWith("/escuela-virtual")) return <UniversityShell>{children}</UniversityShell>;
  return (
    <div className="flex min-h-dvh flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {top}
      <main id="contenido" data-region="body" className="flex-1">{children}</main>
      {bottom}
    </div>
  );
}
