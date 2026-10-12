import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

// Cabecera compacta de las páginas interiores: ruta, título y bajada en una franja corta
// para que el contenido quede a la vista sin hacer scroll.
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  image,
  imagePos = "50% 50%",
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  imagePos?: string;
  /** Dato breve junto al antetítulo, p. ej. "12 documentos". */
  meta?: string;
}) {
  return (
    <section className="ph">
      {image && (
        <div className="ph-photo" aria-hidden="true">
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 46vw, 100vw" style={{ objectPosition: imagePos }} />
        </div>
      )}
      <Container className="relative py-5 sm:py-6 lg:py-7">
        <nav aria-label="Ruta de navegación" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-[var(--text-faint)] sm:mb-4">
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
        <div className="max-w-3xl">
          {(eyebrow || meta) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              {meta && (
                <span className="rounded-full border border-[var(--border-strong)] px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  {meta}
                </span>
              )}
            </div>
          )}
          <h1 className="mt-2 text-balance font-[var(--font-display)] text-[1.7rem] font-bold leading-[1.1] text-[var(--text)] sm:text-3xl lg:text-[2.4rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--text-muted)] sm:text-base">{description}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
