import "server-only";
import { cache } from "react";
import { publicDb } from "./client";
import { getLegacyPage, getLegacySection, type LegacyBlock, type LegacyPage, type LegacySection, type NavNode } from "@/content/legacy";

// Árbol del sitio: las secciones, subsecciones y páginas que el equipo crea en /admin/arbol se suman
// a las copiadas del portal actual (src/content/legacy). Sin la tabla (o sin CMS) todo sigue como estaba.

export type SiteNode = {
  id: string;
  section: string;
  parent: string | null;
  key: string;
  label: string;
  title: string;
  blocks: LegacyBlock[];
  href: string | null;
  is_section: boolean;
  sort_order: number;
  published: boolean;
  updated_at: string;
};

export const NODE_COLUMNS = "id,section,parent,key,label,title,blocks,href,is_section,sort_order,published,updated_at";

export function rowToNode(r: Record<string, unknown>): SiteNode {
  return {
    id: String(r.id),
    section: String(r.section),
    parent: r.parent ? String(r.parent) : null,
    key: String(r.key),
    label: String(r.label),
    title: String(r.title),
    blocks: Array.isArray(r.blocks) ? (r.blocks as LegacyBlock[]) : [],
    href: r.href ? String(r.href) : null,
    is_section: Boolean(r.is_section),
    sort_order: Number(r.sort_order ?? 0),
    published: r.published !== false,
    updated_at: String(r.updated_at ?? ""),
  };
}

/** Texto → identificador de ruta: sin tildes, en minúsculas y con guiones. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Nodos publicados (lectura pública, con la caché etiquetada del CMS). Sin tabla devuelve una lista vacía. */
export const getSiteNodes = cache(async (): Promise<SiteNode[]> => {
  const db = publicDb();
  if (!db) return [];
  try {
    const { data, error } = await db.from("site_nodes").select(NODE_COLUMNS).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => rowToNode(r as Record<string, unknown>));
  } catch {
    return [];
  }
});

const isGroupRef = (ref: string) => ref.startsWith("~");

/** Entrada del menú para un nodo nuevo: página (con clave) o enlace (con dirección). */
export function nodeToNav(n: SiteNode): NavNode {
  return n.href ? { label: n.label, href: n.href, nid: n.id } : { label: n.label, key: n.key, nid: n.id };
}

/**
 * Suma los nodos nuevos a una copia del menú de la sección. Cada uno cuelga de su padre: una página (por su clave),
 * un grupo sin página (por su camino «~0.2» en el menú original) o la raíz de la sección. Van al final de sus hermanos.
 */
export function mergeTree(base: NavNode[], nodes: SiteNode[]): NavNode[] {
  const clone = (list: NavNode[]): NavNode[] => list.map((n) => ({ ...n, children: n.children ? clone(n.children) : undefined }));
  const tree = clone(base);
  const byPath = new Map<string, NavNode>();
  const byKey = new Map<string, NavNode>();
  const index = (list: NavNode[], prefix: number[]) =>
    list.forEach((n, i) => {
      const path = [...prefix, i];
      byPath.set(`~${path.join(".")}`, n);
      if (n.key) byKey.set(n.key, n);
      if (n.children) index(n.children, path);
    });
  index(tree, []);

  let pending = nodes.filter((n) => !n.is_section);
  // Varias pasadas: un nodo puede colgar de otro nuevo que aún no se ha colocado.
  for (let pass = 0; pass < 12 && pending.length; pass++) {
    const waiting: SiteNode[] = [];
    for (const n of pending) {
      const target = n.parent ? (isGroupRef(n.parent) ? byPath.get(n.parent) : byKey.get(n.parent)) : null;
      if (n.parent && !target) {
        waiting.push(n);
        continue;
      }
      const entry = nodeToNav(n);
      if (entry.key) byKey.set(entry.key, entry);
      if (target) (target.children ??= []).push(entry);
      else tree.push(entry);
    }
    if (waiting.length === pending.length) break;
    pending = waiting;
  }
  return tree;
}

/** La sección con sus páginas nuevas (o una sección nueva completa). */
export async function getSection(slug: string): Promise<LegacySection | null> {
  const own = (await getSiteNodes()).filter((n) => n.section === slug);
  const base = getLegacySection(slug);
  if (base) return own.length ? { ...base, tree: mergeTree(base.tree, own) } : base;
  const head = own.find((n) => n.is_section);
  return head ? { label: head.label, landing: head.key, tree: mergeTree([], own) } : null;
}

export const nodeToPage = (n: SiteNode): LegacyPage => ({
  title: n.title,
  source: "",
  blocks: n.blocks,
  sections: [n.section],
  parent: n.parent && !isGroupRef(n.parent) ? n.parent : undefined,
  libre: true,
});

/** Una página copiada o una creada en el panel. */
export async function getPage(key: string): Promise<LegacyPage | null> {
  const legacy = getLegacyPage(key);
  if (legacy) return legacy;
  const n = (await getSiteNodes()).find((x) => x.key === key && !x.href);
  return n ? nodeToPage(n) : null;
}

/** Las páginas nuevas de una sección, por clave (para los resúmenes de las fichas). */
export async function customPagesOf(slug: string): Promise<Record<string, LegacyPage>> {
  const out: Record<string, LegacyPage> = {};
  for (const n of await getSiteNodes()) if (n.section === slug && !n.href) out[n.key] = nodeToPage(n);
  return out;
}
