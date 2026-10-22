"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrarUso, seccionDeRuta } from "@/lib/uso";

// Cuenta una visita cada vez que la persona entra a una sección del recorrido (solo con su permiso).
export function UsageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const id = seccionDeRuta(pathname);
    if (id) registrarUso(id);
  }, [pathname]);
  return null;
}
