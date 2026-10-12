import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        <Link
          href="/seccion/publicaciones"
          className="group mt-10 flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 transition-colors hover:border-[var(--fg-lime-500)] sm:p-6"
        >
          <span>
            <span className="block font-[var(--font-display)] text-lg font-bold text-[var(--text)]">Catálogo histórico de publicaciones</span>
            <span className="mt-1 block text-sm text-[var(--text-muted)]">Libros, cartillas, Carta Fedegán, cuadernos ganaderos y presentaciones del gremio.</span>
          </span>
          <ArrowRight size={20} className="shrink-0 text-[var(--fg-lime-400)] transition-transform group-hover:translate-x-1" />
        </Link>
      </Container>
    </>
  );
}
