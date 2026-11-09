"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { UniversityShell } from "./UniversityShell";
import { TEMPLATE_BY_ID, type TemplateId } from "@/lib/design/regions";

// Carga las tipografías de una plantilla cuando se activa (en el editor de diseño la plantilla cambia sin recargar).
function ensureFonts(id: string | null) {
  const url = id ? TEMPLATE_BY_ID[id as TemplateId]?.fonts : "";
  if (!url || document.querySelector(`link[data-tpl-font="${id}"]`) || document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.dataset.tplFont = id!;
  document.head.appendChild(link);
}

// Encabezado, pie y barra móvil del sitio público. El panel /admin trae su propio marco.
// El marco lleva la plantilla elegida (data-template): así el panel y la Escuela Virtual no se ven afectados.
export function SiteChrome({ top, bottom, children, template }: { top: ReactNode; bottom: ReactNode; children: ReactNode; template?: string }) {
  const pathname = usePathname();
  const publico = !pathname.startsWith("/admin") && !pathname.startsWith("/escuela-virtual");

  useEffect(() => {
    if (!publico) return;
    const marco = document.querySelector("[data-site-chrome]");
    if (!marco) return;
    ensureFonts(marco.getAttribute("data-template"));
    const obs = new MutationObserver(() => ensureFonts(marco.getAttribute("data-template")));
    obs.observe(marco, { attributes: true, attributeFilter: ["data-template"] });
    return () => obs.disconnect();
  }, [publico]);

  if (pathname.startsWith("/admin")) return <>{children}</>;
  // La Escuela Virtual es un espacio aparte, con su propio marco.
  if (pathname.startsWith("/escuela-virtual")) return <UniversityShell>{children}</UniversityShell>;
  return (
    <div data-site-chrome data-template={template} className="flex min-h-dvh flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {top}
      <main id="contenido" data-region="body" className="flex-1">{children}</main>
      {bottom}
    </div>
  );
}
