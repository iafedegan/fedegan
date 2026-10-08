import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="bg-[var(--bg-muted)] border-b border-[var(--border)]">
      <Container className="py-8 sm:py-10">
        <nav aria-label="Ruta de navegación" className="flex items-center flex-wrap gap-1.5 text-xs text-[var(--text-faint)] mb-4">
          <Link href="/" className="hover:text-[var(--fg-green-700)]">Inicio</Link>
          {breadcrumbs.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {b.href ? (
                <Link href={b.href} className="hover:text-[var(--fg-green-700)]">{b.label}</Link>
              ) : (
                <span className="text-[var(--text-muted)] font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow && (
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-green-600)]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mt-1.5">{title}</h1>
        {description && (
          <p className="mt-3 text-[var(--text-muted)] max-w-2xl leading-relaxed">{description}</p>
        )}
      </Container>
    </section>
  );
}
