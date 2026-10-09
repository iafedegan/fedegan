import { Container } from "@/components/ui/Container";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { publications, publicationCovers } from "@/content/site";

export function PublicationsGrid() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Recursos" title="Publicaciones y recursos" action={{ label: "Ver todas las publicaciones", href: "/publicaciones" }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </Container>
    </section>
  );
}
