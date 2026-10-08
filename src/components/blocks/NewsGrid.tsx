import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NoticiaCard } from "./NoticiaCard";
import { getNoticias } from "@/lib/contexto";

export async function NewsGrid() {
  const { items } = await getNoticias(3);
  return (
    <section className="py-4 sm:py-6">
      <Container>
        <SectionHeading eyebrow="Noticias de portada" title="Noticias destacadas" action={{ label: "Ver todas las noticias", href: "/noticias" }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((n) => (
            <NoticiaCard key={n.slug} n={n} />
          ))}
        </div>
      </Container>
    </section>
  );
}
