import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { getNoticia, getNoticias } from "@/lib/contexto";

export async function generateStaticParams() {
  const { items } = await getNoticias({ limit: 50 });
  return items.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNoticia(slug);
  if (!n) return { title: "Noticia" };
  return {
    title: n.title,
    description: n.dek,
    openGraph: {
      type: "article",
      title: n.title,
      description: n.dek,
      publishedTime: n.publishedAt ?? undefined,
      modifiedTime: n.updatedAt ?? undefined,
      images: n.image ? [{ url: n.image }] : undefined,
    },
  };
}

export default async function NoticiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await getNoticia(slug);
  if (!n) notFound();

  const generatedByAi = n.imageAlt?.toLowerCase().startsWith("imagen generada con ia") ?? false;
  const updatedLater = n.updatedAt && n.publishedAt && new Date(n.updatedAt).getTime() - new Date(n.publishedAt).getTime() > 60 * 60 * 1000;

  return (
    <article>
      <section className="pg-stage">
        <Container className="relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <nav aria-label="Ruta de navegación" className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-faint)]">
            <Link href="/" className="transition-colors hover:text-[var(--fg-lime-400)]">Inicio</Link>
            <ChevronRight size={12} />
            <Link href="/noticias" className="transition-colors hover:text-[var(--fg-lime-400)]">Noticias</Link>
            {n.sectionSlug ? (
              <>
                <ChevronRight size={12} />
                <Link href={`/noticias?categoria=${n.sectionSlug}`} className="transition-colors hover:text-[var(--fg-lime-400)]">{n.section}</Link>
              </>
            ) : null}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="lime">{n.section}</Badge>
            {n.ultimaHora && <Badge tone="alert">Última hora</Badge>}
            {n.enVivo && <Badge tone="alert">En vivo</Badge>}
          </div>
          <h1 className="mt-5 text-balance font-[var(--font-display)] text-3xl font-bold leading-[1.1] text-[var(--text)] sm:text-5xl">{n.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--text-muted)]">{n.dek}</p>
          <p className="mt-6 text-sm text-[var(--text-faint)]">
            Por <span className="font-semibold text-[var(--text-muted)]">{n.author}</span> · {n.date}
            {updatedLater && <> · Actualizada el {new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date(n.updatedAt!))}</>}
          </p>
        </Container>
      </section>

      <Container className="max-w-3xl py-12 sm:py-16">
        {n.image && (
          <figure className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.image} alt={n.imageAlt ?? ""} className="aspect-[16/9] w-full rounded-[1.25rem] border border-[var(--border)] object-cover shadow-[var(--shadow-lg)]" />
            {generatedByAi && <figcaption className="mt-3 text-xs text-[var(--text-faint)]">Imagen generada con IA</figcaption>}
          </figure>
        )}

        {n.bodyHtml ? (
          <div className="article-body" dangerouslySetInnerHTML={{ __html: n.bodyHtml }} />
        ) : (
          <p className="article-body">{n.dek}</p>
        )}

        {n.tags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Etiquetas">
            {n.tags.map((t) => (
              <li key={t} className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <Link href="/noticias" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg-lime-400)]">
            <ArrowLeft size={16} /> Volver a las noticias
          </Link>
        </div>
      </Container>
    </article>
  );
}
