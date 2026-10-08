import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { publications } from "@/content/site";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  return { title: pub?.title ?? "Publicación" };
}

export default async function PublicacionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = publications.find((p) => p.slug === slug);
  if (!pub) notFound();

  return (
    <>
      <PageHeader
        eyebrow={pub.type}
        title={pub.title}
        breadcrumbs={[{ label: "Publicaciones", href: "/publicaciones" }, { label: pub.type }]}
      />
      <Container className="py-12 grid sm:grid-cols-[220px_1fr] gap-8 max-w-3xl">
        <div className="aspect-[3/4] rounded-[var(--radius-lg)] bg-[var(--fg-green-700)] flex items-center justify-center shadow-[var(--shadow-md)]">
          <FileText className="text-[var(--fg-lime-400)]" size={48} />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-[var(--text-muted)] leading-relaxed">{pub.dek}</p>
          <p className="text-sm text-[var(--text-faint)]">
            Documento en formato digital, publicado por FEDEGÁN–FNG para consulta pública del sector ganadero.
          </p>
          <Button variant="primary" className="self-start">
            <Download size={16} /> Descargar PDF
          </Button>
        </div>
      </Container>
    </>
  );
}
