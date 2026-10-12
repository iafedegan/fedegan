import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { RecordForm } from "@/components/admin/RecordForm";
import { readDb } from "@/lib/cms/client";
import { getEntity } from "@/lib/cms/entities";

export const metadata: Metadata = { title: "Editar contenido", robots: { index: false } };

export default async function EntityEditPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity: key, id } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();

  const { db, writable } = readDb();
  const creating = id === "nuevo";
  let record: Record<string, unknown> | null = null;
  if (db && !creating) {
    const { data } = await db.from(entity.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    record = data as Record<string, unknown>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <Link href={`/admin/${entity.key}`} className="hover:text-[#165a43]">{entity.plural}</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">{creating ? "Nuevo" : "Editar"}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          {creating ? `Nuevo ${entity.label}` : String(record?.[entity.titleField] ?? `Editar ${entity.label}`)}
        </h1>
      </header>
      <RecordForm entity={entity} record={record} writable={writable} />
    </div>
  );
}
