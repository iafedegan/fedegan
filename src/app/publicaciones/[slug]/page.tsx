import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { publications, publicationCovers } from "@/content/site";

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
  const c = publicationCovers[pub.type] ?? publicationCovers.Informe;

  return (
    <>
      <PageHeader
        eyebrow={pub.type}
        title={pub.title}
        breadcrumbs={[{ label: "Publicaciones", href: "/publicaciones" }, { label: pub.type }]}
      />
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="gl" style={{ ["--acc-rgb" as string]: c.accent }}>
          <div className="gl-face">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" style={{ objectPosition: c.pos }} />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--card-b)_0%,transparent_60%),linear-gradient(135deg,rgba(var(--acc-rgb),0.28),transparent_55%)]" />
              <Badge tone="lime" className="absolute left-4 top-4">{pub.type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-5">
          <p className="text-xl leading-relaxed text-[var(--text)]">{pub.dek}</p>
          <p className="text-[var(--text-muted)]">
            Documento en formato digital, publicado por FEDEGÁN–FNG para consulta pública del sector ganadero.
          </p>
          <Button variant="primary">
            <Download size={16} /> Descargar PDF
          </Button>
        </div>
      </Container>
    </>
  );
}
