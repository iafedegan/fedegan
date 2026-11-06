"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Aplica el tono según la página al navegar sin recargar (la misma regla que ThemeScript):
// elección de la persona si existe; si no, inicio claro e interiores oscuras.
export function ThemeRoute() {
  const pathname = usePathname();
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("fedegan-tema");
    } catch {}
    const root = document.documentElement;
    const adm = pathname.startsWith("/admin");
    const inner = pathname !== "/" && !adm;
    // Una plantilla activa fija el tono (no en el panel).
    const tpl = root.getAttribute("data-tpl-mode");
    const dark = tpl && !adm ? tpl === "oscuro" : false; // el manual de marca: fondo blanco siempre
    void stored; void inner;
    const next = dark ? "esmeralda" : "institucional";
    if (root.getAttribute("data-theme") !== next) root.setAttribute("data-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e0e0e" : "#0a2a20");
  }, [pathname]);
  return null;
}
