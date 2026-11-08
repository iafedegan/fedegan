import type { Metadata } from "next";
import { ArbolEncabezado } from "@/components/admin/ArbolEncabezado";
import { ArbolSitio } from "@/components/admin/ArbolSitio";
import { readDb } from "@/lib/cms/client";
import { getNav } from "@/lib/cms/content";
import { listOverrides } from "@/lib/cms/paginas";
import { NODE_COLUMNS, rowToNode, type SiteNode } from "@/lib/cms/nodos";
import { construirArbol, type NavRow, type PortalRow } from "@/lib/cms/arbol";
import { getPartners } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Árbol del sitio · Panel del portal", robots: { index: false } };

export default async function ArbolPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { db, writable } = readDb();

  let nav: NavRow[] = [];
  let nodes: SiteNode[] = [];
  let tablaLista = false;
  let portales: PortalRow[] = [];
  if (db) {
    const a = await db.from("nav_items").select("id,label,href,published,sort_order").order("sort_order", { ascending: true });
    nav = (a.data ?? []).map((r) => ({ id: String(r.id), label: String(r.label), href: String(r.href), published: r.published !== false }));
    const p = await db.from("partners").select("id,name,href").order("sort_order", { ascending: true });
    if (!p.error) portales = (p.data ?? []).map((r) => ({ id: String(r.id), nombre: String(r.name), href: String(r.href) }));
    const b = await db.from("site_nodes").select(NODE_COLUMNS).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (!b.error) {
      tablaLista = true;
      nodes = (b.data ?? []).map((r) => rowToNode(r as Record<string, unknown>));
    }
  }
  if (!nav.length) nav = (await getNav()).map((n, i) => ({ id: `semilla-${i}`, label: n.label, href: n.href, published: true }));

  const { map: editadas } = await listOverrides();
  if (!portales.length) portales = (await getPartners()).map((p) => ({ nombre: p.nombre, href: p.href }));
  const raiz = construirArbol({ nav, nodes, editadas: new Set(editadas.keys()), portales });
  const barra = raiz.find((g) => g.id === "g:nav")!;
  const otras = raiz.find((g) => g.id === "g:sec")!;
  const secciones = barra.children.filter((n) => n.add).length + otras.children.length;
  const paginas = barra.total + otras.total;
  const nuevas = nodes.length;

  return (
    <div className="flex flex-col gap-6">
      <ArbolEncabezado secciones={secciones} paginas={paginas} nuevas={nuevas} ok={ok} error={error} writable={writable} tablaLista={tablaLista} />
      <ArbolSitio raiz={raiz} writable={writable && tablaLista} />
    </div>
  );
}
