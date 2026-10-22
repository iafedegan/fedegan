import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchClient } from "@/components/blocks/SearchClient";
import { buildSearchIndex } from "@/lib/search-index";
import { legacySearchEntries } from "@/content/legacy/search";
import { getNoticias } from "@/lib/contexto";
import { getEvents, getPublications } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Buscador" };

export default async function BuscadorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [{ items }, publications, events] = await Promise.all([getNoticias({ limit: 50 }), getPublications(), getEvents()]);
  const index = buildSearchIndex(items, publications, events, legacySearchEntries());
  return (
    <>
      <PageHeader
        eyebrow="Buscador"
        title="Buscar en el portal"
        description="Encuentre noticias, publicaciones, eventos y páginas institucionales de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Buscador" }]}
      />
      <Container className="py-6 sm:py-10">
        <SearchClient initialQuery={q ?? ""} index={index} />
      </Container>
    </>
  );
}
