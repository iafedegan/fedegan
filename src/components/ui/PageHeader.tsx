import { SITE_URL } from "@/lib/site-url";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

// Cabecera de las páginas interiores: ruta, título y datos clave sobre el fondo nacarado de la página.
// Ya no lleva foto de banner; las propiedades image/imagePos se aceptan por compatibilidad y se ignoran.
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  facts,
  meta,
  compact = false,
  root = { label: "Inicio", href: "/" },
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  imagePos?: string;
  facts?: string[];
  meta?: string;
  /** Franja baja, para páginas de trabajo donde el contenido debe verse de inmediato. */
  compact?: boolean;
  /** Primer eslabón de la ruta (por defecto, «Inicio» del portal). */
  root?: { label: string; href: string };
}) {
  const chips = facts ?? (meta ? [meta] : []);
  // El tamaño del título se ajusta a su largo: los títulos de documentos pueden pasar de 100 caracteres.
  const n = title.length;
  const size = compact
    ? n > 80 ? "text-lg sm:text-xl lg:text-2xl" : n > 45 ? "text-xl sm:text-2xl lg:text-3xl" : "text-2xl sm:text-3xl"
    : n > 90 ? "text-xl sm:text-2xl lg:text-3xl" : n > 60 ? "text-2xl sm:text-3xl lg:text-4xl" : n > 32 ? "text-2xl sm:text-4xl lg:text-5xl" : "text-3xl sm:text-5xl";
  // Ruta larga: se conserva la raíz y los dos últimos tramos, con texto recortado.
  const trail = breadcrumbs.length > 2 ? [{ label: "…" }, ...breadcrumbs.slice(-2)] : breadcrumbs;
  const crumbs = [root, ...breadcrumbs];
  const crumbLd = breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}) })),
      }
    : null;
  return (
    <section className="mx-hero" data-region="pagehead">
      {crumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />}
      <Container className={`relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between ${compact ? "py-4" : "py-5 sm:py-6"}`}>
        <div className="min-w-0">
          <nav aria-label="Ruta de navegación" className="mx-crumb mb-2 max-w-full flex-nowrap overflow-hidden text-xs">
            <Link href={root.href} className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{root.label}</Link>
            {trail.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex min-w-0 items-center gap-1">
                <ChevronRight size={12} aria-hidden />
                {b.href ? (
                  <Link href={b.href} title={b.label} className="max-w-[12rem] truncate rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{b.label}</Link>
                ) : (
                  <span aria-current={i === trail.length - 1 ? "page" : undefined} title={b.label} className="max-w-[16rem] truncate px-1 py-0.5 font-semibold">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-stretch gap-3">
            <span aria-hidden className="mx-title-bar" />
            <div className="min-w-0">
              {eyebrow && <span className="mx-kicker mb-1">{eyebrow}</span>}
              <h1 className={`mx-title max-w-4xl text-balance break-words font-[var(--font-display)] font-bold leading-[1.1] ${size}`}>{title}</h1>
              {description && <p className="mx-lead mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed">{description}</p>}
            </div>
          </div>
        </div>
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 lg:justify-end">
            {chips.map((c) => (
              <li key={c} className="mx-fact">{c}</li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
