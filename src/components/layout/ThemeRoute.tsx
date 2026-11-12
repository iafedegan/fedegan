"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Aplica el tono según la página al navegar sin recargar (la misma regla que ThemeScript):
// elección de la persona si existe; si no, oscuro en todo el sitio (así no hay un destello claro al pasar de la portada a otra página).
export function ThemeRoute() {
  const pathname = usePathname();
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("fedegan-tema");
    } catch {}
    const root = document.documentElement;
    const adm = pathname.startsWith("/admin");
    // Una plantilla activa fija el tono (no en el panel).
    const tpl = root.getAttribute("data-tpl-mode");
    const dark = tpl && !adm ? tpl === "oscuro" : stored ? stored === "oscuro" : !adm;
    const next = dark ? "esmeralda" : "institucional";
    if (root.getAttribute("data-theme") !== next) root.setAttribute("data-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#071b13");
  }, [pathname]);
  return null;
}
