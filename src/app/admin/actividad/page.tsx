import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { readDb } from "@/lib/cms/client";
import { entities } from "@/lib/cms/entities";

export const metadata: Metadata = { title: "Actividad · Panel del portal", robots: { index: false } };

type Audit = { id: number; at: string; actor: string; action: string; entity: string; summary: string | null };

export default async function ActividadPage() {
  const { db, writable } = readDb();
  let rows: Audit[] = [];
  if (db && writable) {
    const { data } = await db.from("audit_log").select("*").order("at", { ascending: false }).limit(100);
    rows = (data ?? []) as Audit[];
  }
  const label = (k: string) => entities.find((e) => e.key === k)?.plural ?? k;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Actividad</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Actividad del equipo</h1>
        <p className="mt-1.5 text-[#5d6e65]">Registro de quién cambió qué en el portal (últimos 100 movimientos).</p>
      </header>

      {!writable && <ConfigNotice compact />}

      <div className="ad-card overflow-hidden">
        {rows.length === 0 ? (
          <p className="flex flex-col items-center gap-3 px-6 py-16 text-center text-[#8a978f]">
            <History size={28} /> {writable ? "Todavía no hay cambios registrados." : "El historial requiere la clave de servicio."}
          </p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <p className="text-sm">
                  <span className="ad-pill ad-pill-gold mr-2 capitalize">{a.action}</span>
                  <strong className="font-semibold">{label(a.entity)}</strong>
                  {a.summary ? <span className="text-[#5d6e65]"> · {a.summary}</span> : null}
                </p>
                <p className="text-xs text-[#8a978f]">
                  {a.actor} · {new Date(a.at).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
