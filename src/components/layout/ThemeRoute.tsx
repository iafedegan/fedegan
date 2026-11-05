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
    const inner = pathname !== "/" && !pathname.startsWith("/admin");
    const dark = stored ? stored === "oscuro" : inner;
    const next = dark ? "esmeralda" : "institucional";
    const root = document.documentElement;
    if (root.getAttribute("data-theme") !== next) root.setAttribute("data-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e0e0e" : "#0a2a20");
  }, [pathname]);
  return null;
}
