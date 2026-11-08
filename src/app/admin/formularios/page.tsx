import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ClipboardList, Database } from "lucide-react";
import { getEditor } from "@/lib/cms/guard";
import { resumenFormularios } from "@/lib/cms/formularios";

export const metadata: Metadata = { title: "Formularios", robots: { index: false } };

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });

export default async function FormulariosPage() {
  if (!(await getEditor())) notFound();
  const { disponible, items } = await resumenFormularios();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Formularios</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Formularios</h1>
        <p className="mt-1.5 max-w-2xl text-[#5d6e65]">Las respuestas de los formularios que arma en las páginas con el elemento «Formulario». Cada uno se reconoce por su nombre interno.</p>
      </header>

      {!disponible && (
        <div role="alert" className="ad-card flex items-start gap-3 border-[#e8d9a8] bg-[#fdf8e7] px-5 py-4 text-sm text-[#5c4a12]">
          <Database size={18} className="mt-0.5 shrink-0" />
          <p>Falta crear la tabla de respuestas. Ejecute <code className="rounded bg-white/70 px-1.5 py-0.5">docs/migraciones/016-formularios.sql</code> en Supabase (SQL Editor) y vuelva a cargar esta página. Mientras tanto los formularios no guardan nada.</p>
        </div>
      )}

      <div className="ad-card">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-[#8a978f]">
            <ClipboardList size={28} />
            <p>Todavía no hay respuestas. Añada un «Formulario» a una página desde el árbol del sitio.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {items.map((f) => (
              <li key={f.clave}>
                <Link href={`/admin/formularios/${f.clave}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-[#f6f8f2] sm:px-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#e5f3ea] text-[#165a43]"><ClipboardList size={20} /></span>
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate font-semibold">{f.titulo || f.clave}</p>
                    <p className="truncate text-sm text-[#5d6e65]"><code>{f.clave}</code> · última respuesta el {fecha(f.ultima)}</p>
                  </div>
                  <span className="ad-pill ad-pill-ok">{f.total} {f.total === 1 ? "respuesta" : "respuestas"}</span>
                  <ChevronRight size={16} className="text-[#8a978f]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
