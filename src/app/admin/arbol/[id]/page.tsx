import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { marcoDePagina } from "@/components/admin/MarcoPagina";
import { NodoForm } from "@/components/admin/NodoForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { legacyHref, legacySections } from "@/content/legacy";
import { readDb } from "@/lib/cms/client";
import { NODE_COLUMNS, rowToNode } from "@/lib/cms/nodos";
import { eliminarNodo, publicarNodo } from "@/lib/cms/nodos-actions";

export const metadata: Metadata = { title: "Editar nodo · Panel del portal", robots: { index: false } };

export default async function EditarNodoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, writable } = readDb();
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data, error } = await db.from("site_nodes").select(NODE_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) notFound();
  const nodo = rowToNode(data as Record<string, unknown>);

  const seccion = legacySections[nodo.section]?.label ?? (await db.from("site_nodes").select("label").eq("section", nodo.section).eq("is_section", true).maybeSingle()).data?.label ?? nodo.section;
  const url = nodo.href ?? legacyHref(nodo.section, nodo.key);
  const esEnlace = Boolean(nodo.href);
  const marco = esEnlace ? null : await marcoDePagina(nodo.section, nodo.key);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <Link href="/admin/arbol" className="hover:text-[#165a43]">Árbol del sitio</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">{String(seccion)}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{nodo.label}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <Link href={url} target="_blank" className="inline-flex items-center gap-1.5 font-semibold text-[#165a43]">
            {esEnlace ? "Abrir el enlace" : "Ver en el sitio"} <ExternalLink size={13} />
          </Link>
          <span className="font-mono text-xs text-[#8a978f]">{url}</span>
          <span className="ad-pill ad-pill-gold">{nodo.is_section ? "Sección nueva" : esEnlace ? "Enlace nuevo" : "Página nueva"}</span>
          {!nodo.published && <span className="ad-pill ad-pill-off">Oculta</span>}
        </p>
      </header>

      <div className={esEnlace ? "grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-start" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start"}>
        <div className="ad-card min-w-0 p-5 sm:p-7">
          <NodoForm id={nodo.id} label={nodo.label} title={nodo.title} href={nodo.href ?? ""} bloques={nodo.blocks} esEnlace={esEnlace} writable={writable} marco={marco} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="ad-card flex flex-col gap-3 p-5 text-sm text-[#5d6e65]">
            <p>Para crear subsecciones o páginas dentro de esta, use «Añadir dentro» en el árbol.</p>
            <Link href="/admin/arbol" className="ad-btn ad-btn-ghost w-full">Volver al árbol</Link>
            {writable && (
              <>
                <form action={publicarNodo}>
                  <input type="hidden" name="id" value={nodo.id} />
                  <button type="submit" className="ad-btn ad-btn-ghost w-full">{nodo.published ? "Ocultar del sitio" : "Publicar en el sitio"}</button>
                </form>
                <form action={eliminarNodo} className="flex items-center justify-between gap-3">
                  <input type="hidden" name="id" value={nodo.id} />
                  <span className="text-xs">{nodo.is_section ? "Elimina la sección y todo lo que tiene dentro." : "Elimina este nodo y lo que cuelga de él."}</span>
                  <DeleteButton label={nodo.label} />
                </form>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
