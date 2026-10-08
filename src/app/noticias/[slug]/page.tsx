import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { featuredNews } from "@/content/site";

export function generateStaticParams() {
  return featuredNews.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = featuredNews.find((n) => n.slug === slug);
  return { title: article?.title ?? "Noticia" };
}

export default async function NoticiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = featuredNews.find((n) => n.slug === slug);
  if (!article) notFound();

  return (
    <>
      <PageHeader
        eyebrow={article.section}
        title={article.title}
        breadcrumbs={[{ label: "Noticias", href: "/noticias" }, { label: article.section }]}
      />
      <Container className="py-12 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Badge tone="green">{article.section}</Badge>
          <span className="text-sm text-[var(--text-faint)]">{article.date} · {article.author}</span>
        </div>
        <div className="aspect-[16/8] rounded-[var(--radius-lg)] overflow-hidden mb-8 relative">
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#146238,#0c3524)" }} />
        </div>
        <div className="flex flex-col gap-5 text-[var(--text)] leading-relaxed text-[1.05rem]">
          {(article.body ?? [article.dek]).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Container>
    </>
  );
}
