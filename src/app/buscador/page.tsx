import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchClient } from "@/components/blocks/SearchClient";
import { buildSearchIndex } from "@/lib/search-index";
import { getNoticias } from "@/lib/contexto";

export const metadata: Metadata = { title: "Buscador" };

export default async function BuscadorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { items } = await getNoticias({ limit: 50 });
  const index = buildSearchIndex(items);
  return (
    <>
      <PageHeader
        eyebrow="Buscador"
        title="Buscar en el portal"
        description="Encuentre noticias, publicaciones, eventos y páginas institucionales de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Buscador" }]}
      />
      <Container className="max-w-3xl py-14 sm:py-20">
        <SearchClient initialQuery={q ?? ""} index={index} />
      </Container>
    </>
  );
}
