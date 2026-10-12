import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PublicationsExplorer } from "@/components/blocks/PublicationsExplorer";
import { publicationCovers } from "@/content/site";
import { getPublications } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Publicaciones" };

export default async function PublicacionesPage() {
  const publications = await getPublications();
  const items = publications.map((p) => {
    const c = publicationCovers[p.type] ?? publicationCovers.Informe;
    return {
      slug: p.slug,
      type: p.type,
      title: p.title,
      dek: p.dek,
      image: p.coverImage ?? c.image,
      pos: p.coverImage ? "50% 50%" : c.pos,
      accent: c.accent,
    };
  });
  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Publicaciones"
        description="Informes, manuales y boletines institucionales del sector ganadero."
        image="/locales/publicaciones.jpg"
        imagePos="65% 55%"
        meta={`${items.length} ${items.length === 1 ? "documento" : "documentos"}`}
        breadcrumbs={[{ label: "Publicaciones" }]}
      />
      <Container className="py-8 sm:py-12">
        <PublicationsExplorer items={items} />
      </Container>
    </>
  );
}
