import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { featuredNews } from "@/content/site";

export const metadata: Metadata = { title: "Noticias" };

export default function NoticiasPage() {
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
          {featuredNews.map((n) => (
            <Link key={n.slug} href={`/noticias/${n.slug}`}>
              <Card>
                <div className="aspect-[16/10] relative bg-[var(--fg-green-800)] overflow-hidden">
                  <div className="absolute inset-0 opacity-80" style={{ background: "linear-gradient(160deg,#146238,#0c3524)" }} />
                  <Badge tone="lime" className="absolute left-3 top-3">{n.section}</Badge>
                </div>
                <CardBody>
                  <span className="text-xs text-[var(--text-faint)] font-semibold">{n.date}</span>
                  <h3 className="font-bold text-[var(--text)] leading-snug">{n.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">{n.dek}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
