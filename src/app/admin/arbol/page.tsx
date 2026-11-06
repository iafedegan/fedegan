import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import { ArbolSitio } from "@/components/admin/ArbolSitio";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { readDb } from "@/lib/cms/client";
import { getNav } from "@/lib/cms/content";
import { listOverrides } from "@/lib/cms/paginas";
import { NODE_COLUMNS, rowToNode, type SiteNode } from "@/lib/cms/nodos";
import { construirArbol, type NavRow } from "@/lib/cms/arbol";

export const metadata: Metadata = { title: "Árbol del sitio · Panel del portal", robots: { index: false } };

export default async function ArbolPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { db, writable } = readDb();

  let nav: NavRow[] = [];
  let nodes: SiteNode[] = [];
  let tablaLista = false;
  if (db) {
    const a = await db.from("nav_items").select("id,label,href,published,sort_order").order("sort_order", { ascending: true });
    nav = (a.data ?? []).map((r) => ({ id: String(r.id), label: String(r.label), href: String(r.href), published: r.published !== false }));
    const b = await db.from("site_nodes").select(NODE_COLUMNS).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (!b.error) {
      tablaLista = true;
      nodes = (b.data ?? []).map((r) => rowToNode(r as Record<string, unknown>));
    }
  }
  if (!nav.length) nav = (await getNav()).map((n, i) => ({ id: `semilla-${i}`, label: n.label, href: n.href, published: true }));

  const { map: editadas } = await listOverrides();
  const raiz = construirArbol({ nav, nodes, editadas: new Set(editadas.keys()) });
  const secciones = raiz[0].children.filter((n) => n.add).length + raiz[1].children.length;
  const paginas = raiz[0].total + raiz[1].total;
  const nuevas = nodes.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
            <ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">Árbol del sitio</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Árbol del sitio</h1>
          <p className="mt-1.5 max-w-3xl text-[#5d6e65]">
            Toda la estructura del portal: la barra de navegación, las secciones, las subsecciones y las páginas, hasta el último nivel. Cree una sección, una subsección o una página nueva en cualquier punto con «Añadir dentro».
          </p>
        </div>
        <Link href="/admin/menu" className="ad-btn ad-btn-ghost">Ordenar la barra de navegación</Link>
      </header>

      {ok && (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-2.5 text-sm text-[#14573a]">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {ok}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-2.5 text-sm text-[#7a1f1f]">
          <XCircle size={17} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
      {!writable && <ConfigNotice compact />}
      {writable && !tablaLista && (
        <p className="rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]">
          Falta crear la tabla del árbol: ejecute <code className="font-mono">docs/migraciones/011-arbol-sitio.sql</code> en Supabase. Mientras tanto puede ver el árbol, pero no crear nodos nuevos.
        </p>
      )}

      <dl className="grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          ["Secciones", secciones],
          ["Páginas y subsecciones", paginas],
          ["Creadas en el panel", nuevas],
        ].map(([t, v]) => (
          <div key={String(t)} className="ad-card p-4">
            <dt className="ad-eyebrow">{t}</dt>
            <dd className="mt-1 text-2xl font-bold text-[#11271d]">{v}</dd>
          </div>
        ))}
      </dl>

      <ArbolSitio raiz={raiz} writable={writable && tablaLista} />
    </div>
  );
}
