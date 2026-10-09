"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Oculta el pie de página en las pantallas de acceso, que caben completas en una sola vista.
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/ingresar") ? null : <>{children}</>;
}
