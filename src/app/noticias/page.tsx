import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoticiaCard } from "@/components/blocks/NoticiaCard";
import { getNoticias } from "@/lib/contexto";

export const metadata: Metadata = { title: "Noticias" };

export default async function NoticiasPage() {
  const { items } = await getNoticias(24);
  return (
    <>
      <PageHeader
        eyebrow="Actualidad"
        title="Noticias"
        description="Comunicados, análisis y actualidad del sector ganadero colombiano."
        breadcrumbs={[{ label: "Noticias" }]}
      />
      <Container className="py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((n) => (
            <NoticiaCard key={n.slug} n={n} />
          ))}
        </div>
      </Container>
    </>
  );
}
