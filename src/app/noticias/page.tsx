import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoticiaCard } from "@/components/blocks/NoticiaCard";
import { NewsUnavailable } from "@/components/blocks/NewsUnavailable";
import { getNoticias, getSecciones } from "@/lib/contexto";

export const metadata: Metadata = { title: "Noticias" };

const PAGE_SIZE = 12;

function href(params: { categoria?: string; cursor?: string }) {
  const qs = new URLSearchParams();
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.cursor) qs.set("cursor", params.cursor);
  const s = qs.toString();
  return s ? `/noticias?${s}` : "/noticias";
}

export default async function NoticiasPage({ searchParams }: { searchParams: Promise<{ categoria?: string; cursor?: string }> }) {
  const { categoria, cursor } = await searchParams;
  const [{ ok, items, nextCursor }, secciones] = await Promise.all([
    getNoticias({ limit: PAGE_SIZE, categoria, cursor }),
    getSecciones(),
  ]);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
      active
        ? "border-transparent bg-[var(--fg-lime-500)] text-[var(--on-accent)]"
        : "border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)]"
    }`;

  return (
    <>
      <PageHeader
        eyebrow="Actualidad"
        title="Noticias"
        description="Notas, análisis y actualidad del sector ganadero colombiano, publicadas por CONtexto Ganadero."
        image="/headers/prensa.jpg"
        imagePos="60% 40%"
        breadcrumbs={[{ label: "Noticias" }]}
      />
      <Container className="py-12 sm:py-16">
        {secciones.length > 0 && (
          <nav aria-label="Secciones" className="-mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-2">
            <Link href="/noticias" className={chip(!categoria)}>Todas</Link>
            {secciones.map((s) => (
              <Link key={s.slug} href={href({ categoria: s.slug })} className={chip(categoria === s.slug)}>
                {s.nombre}
              </Link>
            ))}
          </nav>
        )}

        {!ok ? (
          <NewsUnavailable />
        ) : items.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8 text-[var(--text-muted)]">
            {categoria || cursor ? "No hay notas para mostrar aquí." : "Todavía no hay notas publicadas."}{" "}
            {(categoria || cursor) && (
              <Link href="/noticias" className="font-semibold text-[var(--fg-lime-400)] underline">Ver todas las noticias</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <NoticiaCard key={n.slug} n={n} />
              ))}
            </div>
            {(cursor || nextCursor) && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
                {cursor ? (
                  <Link href={href({ categoria })} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg-lime-400)]">
                    <ArrowLeft size={16} /> Más recientes
                  </Link>
                ) : (
                  <span />
                )}
                {nextCursor && (
                  <Link
                    href={href({ categoria, cursor: nextCursor })}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
                  >
                    Notas anteriores <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}
