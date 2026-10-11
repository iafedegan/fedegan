import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchClient } from "@/components/blocks/SearchClient";
import { buildSearchIndex } from "@/lib/search-index";
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
  const index = buildSearchIndex(items, publications, events);
  return (
    <>
      <PageHeader
        eyebrow="Buscador"
        title="Buscar en el portal"
        description="Encuentre noticias, publicaciones, eventos y páginas institucionales de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Buscador" }]}
        compact
      />
      <Container className="max-w-3xl py-10 sm:py-14">
        <SearchClient initialQuery={q ?? ""} index={index} />
      </Container>
    </>
  );
}
