import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NoticiaCard } from "./NoticiaCard";
import { getHomeNews } from "@/lib/contexto";

export async function NewsGrid() {
  const { latest } = await getHomeNews();
  if (latest.length === 0) return null;

  return (
    <section className="py-4 sm:py-6">
      <Container>
        <SectionHeading eyebrow="Actualidad" title="Últimas noticias" action={{ label: "Ver todas las noticias", href: "/noticias" }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((n) => (
            <NoticiaCard key={n.slug} n={n} />
          ))}
        </div>
      </Container>
    </section>
  );
}
