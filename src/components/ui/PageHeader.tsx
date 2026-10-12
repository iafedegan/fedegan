import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

// Cabecera mínima de las páginas interiores: migas de pan, título y una línea de contexto.
// `eyebrow`, `image`, `imagePos` y `meta` se aceptan por compatibilidad pero ya no se muestran.
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  imagePos?: string;
  meta?: string;
}) {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg)]" data-region="pagehead">
      <Container className="py-4 sm:py-5">
        <nav aria-label="Ruta de navegación" className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-[var(--text-faint)]">
          <Link href="/" className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">Inicio</Link>
          {breadcrumbs.map((b) => (
            <span key={b.label} className="flex items-center gap-1">
              <ChevronRight size={12} aria-hidden />
              {b.href ? (
                <Link href={b.href} className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{b.label}</Link>
              ) : (
                <span aria-current="page" className="px-1 py-0.5 font-medium text-[var(--text-muted)]">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-balance font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </Container>
    </section>
  );
}
