"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Encabezado, pie y barra móvil del sitio público. El panel /admin trae su propio marco.
export function SiteChrome({ top, bottom, children }: { top: ReactNode; bottom: ReactNode; children: ReactNode }) {
  const inAdmin = usePathname().startsWith("/admin");
  if (inAdmin) return <>{children}</>;
  return (
    <div className="flex min-h-dvh flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {top}
      <main id="contenido" className="flex-1">{children}</main>
      {bottom}
    </div>
  );
}
