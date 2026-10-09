import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Badge } from "@/components/ui/Badge";
import { publications, publicationCovers } from "@/content/site";

export const metadata: Metadata = { title: "Publicaciones" };

export default function PublicacionesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Publicaciones"
        description="Informes, manuales y boletines institucionales del sector ganadero."
        image="/locales/publicaciones.jpg"
        imagePos="65% 55%"
        breadcrumbs={[{ label: "Publicaciones" }]}
      />
      <Container className="grid gap-6 py-14 sm:grid-cols-2 sm:py-20 lg:grid-cols-3">
        {publications.map((p) => {
          const c = publicationCovers[p.type] ?? publicationCovers.Informe;
          return (
            <PhotoCard
              key={p.slug}
              image={c.image}
              imagePos={c.pos}
              accent={c.accent}
              kicker={p.type}
              title={p.title}
              text={p.dek}
              href={`/publicaciones/${p.slug}`}
              cta="Ver publicación"
              badge={<Badge tone="lime">{p.type}</Badge>}
            />
          );
        })}
      </Container>
    </>
  );
}
