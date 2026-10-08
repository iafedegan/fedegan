import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchClient } from "@/components/blocks/SearchClient";

export const metadata: Metadata = { title: "Buscador" };

export default async function BuscadorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Buscador"
        title="Buscar en el portal"
        description="Encuentre noticias, publicaciones, eventos y páginas institucionales de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Buscador" }]}
      />
      <Container className="py-12 max-w-2xl">
        <SearchClient initialQuery={q ?? ""} />
      </Container>
    </>
  );
}
