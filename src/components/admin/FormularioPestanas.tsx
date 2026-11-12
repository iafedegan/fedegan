import Link from "next/link";
import { BarChart3, ChevronRight, ExternalLink, Inbox, PencilRuler } from "lucide-react";

// Encabezado común de un formulario en el panel: ruta, título y pestañas Constructor · Dashboard · Respuestas.
export function FormularioPestanas({ id, titulo, slug, publico, activa, children }: {
  id: string; titulo: string; slug: string; publico: boolean; activa: "constructor" | "dashboard" | "respuestas"; children?: React.ReactNode;
}) {
  const tabs = [
    { k: "constructor", t: "Constructor", href: `/admin/formularios/${id}`, I: PencilRuler },
    { k: "dashboard", t: "Dashboard", href: `/admin/formularios/${id}/dashboard`, I: BarChart3 },
    { k: "respuestas", t: "Respuestas", href: `/admin/formularios/${id}/respuestas`, I: Inbox },
  ] as const;
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta" className="flex min-w-0 items-center gap-1.5 text-sm text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={13} />
          <Link href="/admin/formularios" className="hover:text-[#165a43]">Formularios</Link><ChevronRight size={13} />
          <h1 className="truncate font-semibold text-[#10240f]">{titulo}</h1>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {children}
          {publico && <Link href={`/formularios/${slug}`} target="_blank" className="ad-btn ad-btn-ghost"><ExternalLink size={16} /> Ver público</Link>}
        </div>
      </div>
      <nav aria-label="Secciones del formulario" className="flex gap-1 overflow-x-auto border-b border-[#e1e5da]">
        {tabs.map(({ k, t, href, I }) => (
          <Link key={k} href={href} aria-current={activa === k ? "page" : undefined}
            className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activa === k ? "border-[#2c6a14] text-[#10240f]" : "border-transparent text-[#5d6e65] hover:text-[#10240f]"}`}>
            <I size={16} /> {t}
          </Link>
        ))}
      </nav>
    </header>
  );
}
