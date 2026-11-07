import type { Metadata } from "next";
import { ArbolEncabezado } from "@/components/admin/ArbolEncabezado";
import { ArbolSitio } from "@/components/admin/ArbolSitio";
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
      <ArbolEncabezado secciones={secciones} paginas={paginas} nuevas={nuevas} ok={ok} error={error} writable={writable} tablaLista={tablaLista} />
      <ArbolSitio raiz={raiz} writable={writable && tablaLista} />
    </div>
  );
}
