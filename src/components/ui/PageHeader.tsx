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
  // El tamaño del titular se ajusta a su largo: los títulos de documentos pueden pasar de 100 caracteres.
  const n = title.length;
  const size = n > 90 ? "ed-t4" : n > 60 ? "ed-t3" : n > 32 ? "ed-t2" : "ed-t1";
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
    <section className="mx-hero ed-head" data-region="pagehead">
      {crumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />}
      <Container>
        <div className="ed-flagrow">
          {eyebrow && <span className="ed-flag">{eyebrow}</span>}
          <nav aria-label="Ruta de navegación" className="mx-crumb ed-crumb">
            <Link href={root.href}>{root.label}</Link>
            {trail.map((b, i) => (
              <span key={`${b.label}-${i}`}>
                <ChevronRight size={11} aria-hidden />
                {b.href ? (
                  <Link href={b.href} title={b.label}>{b.label}</Link>
                ) : (
                  <span aria-current={i === trail.length - 1 ? "page" : undefined} title={b.label}>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        <h1 className={`ed-title ${size}`}>{title}</h1>
        {description && !compact && <p className="ed-deck">{description}</p>}
        {chips.length > 0 && (
          <ul className="ed-dateline">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <span aria-hidden className="ed-rule" />
      </Container>
    </section>
  );
}
