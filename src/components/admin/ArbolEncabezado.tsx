import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpDown, CheckCircle2, ChevronRight, FilePlus2, FileText, LayoutPanelTop, XCircle, type LucideIcon } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";

const NUM = new Intl.NumberFormat("es-CO");

function Aviso({ ok, children }: { ok: boolean; children: ReactNode }) {
  const Icono = ok ? CheckCircle2 : XCircle;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}
    >
      <Icono size={18} className="mt-px shrink-0" aria-hidden /> <span>{children}</span>
    </p>
  );
}

// Cabecera de /admin/arbol: ruta, título, avisos del servidor y las tres cifras en una sola franja.
export function ArbolEncabezado({ secciones, paginas, nuevas, ok, error, writable, tablaLista }: {
  secciones: number;
  paginas: number;
  nuevas: number;
  ok?: string;
  error?: string;
  writable: boolean;
  tablaLista: boolean;
}) {
  const cifras: { t: string; v: number; Icono: LucideIcon; tono: string }[] = [
    { t: "Secciones", v: secciones, Icono: LayoutPanelTop, tono: "bg-[#e1f1e7] text-[#165a43]" },
    { t: "Páginas y subsecciones", v: paginas, Icono: FileText, tono: "bg-[#eceae0] text-[#5d6e65]" },
    { t: "Creadas en el panel", v: nuevas, Icono: FilePlus2, tono: "bg-[#f7edcf] text-[#8a6d1f]" },
  ];
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="text-[#8a978f] hover:text-[#165a43]">Panel</Link>
            <ChevronRight size={12} aria-hidden />
            <span className="font-medium text-[#5d6e65]">Árbol del sitio</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Árbol del sitio</h1>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-[#5d6e65]">
            Toda la estructura del portal, hasta el último nivel. Cree una sección, una subsección o una página en cualquier punto con «Añadir dentro».
          </p>
        </div>
        <Link href="/admin/menu" className="ad-btn ad-btn-ghost">
          <ArrowUpDown size={16} aria-hidden /> Ordenar la barra de navegación
        </Link>
      </header>

      {ok && <Aviso ok>{ok}</Aviso>}
      {error && <Aviso ok={false}>{error}</Aviso>}
      {!writable && <ConfigNotice compact />}
      {writable && !tablaLista && (
        <p className="rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]">
          Falta crear la tabla del árbol: ejecute <code className="font-mono">docs/migraciones/011-arbol-sitio.sql</code> en Supabase. Mientras tanto puede ver el árbol, pero no crear nodos nuevos.
        </p>
      )}

      <dl className="grid grid-cols-3 divide-x divide-[#e4e2d6] overflow-hidden rounded-2xl border border-[#e4e2d6] bg-white sm:max-w-2xl">
        {cifras.map(({ t, v, Icono, tono }) => (
          <div key={t} className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4">
            <span className={`hidden h-9 w-9 shrink-0 place-items-center rounded-xl sm:grid ${tono}`}>
              <Icono size={17} aria-hidden />
            </span>
            {/* El valor se ve arriba y el nombre debajo, pero en el documento el nombre va primero. */}
            <div className="flex min-w-0 flex-col-reverse gap-1">
              <dt className="text-[0.72rem] leading-tight text-[#5d6e65] sm:text-xs">{t}</dt>
              <dd className="text-xl font-bold leading-none text-[#11271d]">{NUM.format(v)}</dd>
            </div>
          </div>
        ))}
      </dl>
    </>
  );
}
