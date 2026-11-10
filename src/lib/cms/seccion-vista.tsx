"use server";

import type { ReactNode } from "react";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { legacyHref } from "@/content/legacy";
import { getPageOverride } from "@/lib/cms/paginas";
import { getCopias } from "@/lib/cms/documentos-copia";
import { aplicarCopias } from "@/lib/cms/documentos-copia-util";
import { sacarFichas } from "@/components/legacy/SectionParts";
import { getPage, getSection } from "@/lib/cms/nodos";

export type PaginaEnLinea = { ok: true; titulo: string; href: string; contenido: ReactNode } | { ok: false };

/** El contenido de una página de la sección, ya dibujado: la portada lo muestra al lado del menú sin cambiar de página. Es público (solo lee lo publicado). */
export async function paginaEnLinea(slug: string, key: string): Promise<PaginaEnLinea> {
  if (typeof slug !== "string" || typeof key !== "string" || slug.length > 120 || key.length > 300) return { ok: false };
  const section = await getSection(slug);
  const base = section ? await getPage(key) : null;
  if (!section || !base || !base.sections.includes(slug)) return { ok: false };
  const override = await getPageOverride(key);
  const pagina = override ? { ...base, title: override.title, blocks: override.blocks } : base;
  const { resto } = sacarFichas(pagina.blocks);
  const blocks = aplicarCopias(resto, await getCopias());
  return {
    ok: true,
    titulo: pagina.title,
    href: legacyHref(slug, key),
    contenido: blocks.length > 0 ? <LegacyContent blocks={blocks} libre={pagina.libre} /> : <p className="sx-vacio">Esta página reúne documentos y tableros del portal actual. Ábrala completa para consultarla.</p>,
  };
}
