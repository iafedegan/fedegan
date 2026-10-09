import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  image,
  imagePos = "50% 50%",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  imagePos?: string;
}) {
  return (
    <section className="pg-stage">
      {image && (
        <div className="pg-photo" aria-hidden="true">
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 56vw, 100vw" style={{ objectPosition: imagePos }} />
        </div>
      )}
      <Container className="relative py-12 sm:py-16 lg:py-24">
        <nav aria-label="Ruta de navegación" className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-faint)]">
          <Link href="/" className="transition-colors hover:text-[var(--fg-lime-400)]">Inicio</Link>
          {breadcrumbs.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {b.href ? (
                <Link href={b.href} className="transition-colors hover:text-[var(--fg-lime-400)]">{b.label}</Link>
              ) : (
                <span className="font-medium text-[var(--text-muted)]">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="max-w-3xl">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="mt-4 text-balance font-[var(--font-display)] text-4xl font-bold leading-[1.06] text-[var(--text)] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">{description}</p>}
        </div>
      </Container>
    </section>
  );
}
