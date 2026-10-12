import { allLegacyPages, excerptOf, legacyHref, legacySections } from "./index";
import type { SearchResult } from "@/lib/search-index";

/** Entradas del buscador para las páginas copiadas del portal actual. */
export function legacySearchEntries(): SearchResult[] {
  return allLegacyPages().map(({ key, page, slug }) => ({
    title: page.title,
    excerpt: excerptOf(page, 200) || legacySections[slug].label,
    href: legacyHref(slug, key),
    type: "Página" as const,
  }));
}
