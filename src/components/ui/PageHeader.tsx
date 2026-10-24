import { SITE_URL } from "@/lib/site-url";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

// Cabecera de las páginas interiores: foto a sangre con velo de color, ruta en cápsula,
// título con degradado y datos clave. Compacta: la foto acompaña, no empuja el contenido.
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  image,
  imagePos = "50% 50%",
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
    <section className={`mx-hero ${image ? "mx-hero-photo" : ""}`} data-region="pagehead">
      {crumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />}
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: imagePos }} />
          <span aria-hidden className="mx-hero-shade" />
        </>
      )}
      <Container className={`relative flex flex-col items-center justify-start text-center lg:min-h-40 ${compact ? "py-4 sm:py-5" : "py-5 sm:py-6"}`}>
        <div className="flex min-w-0 max-w-full flex-col items-start self-start lg:absolute lg:left-10 lg:top-6 lg:max-w-[14rem]">
          <nav aria-label="Ruta de navegación" className="mx-crumb mb-3 max-w-full flex-nowrap self-start overflow-hidden text-xs">
            <Link href={root.href} className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{root.label}</Link>
            {trail.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex min-w-0 items-center gap-1">
                <ChevronRight size={12} aria-hidden />
                {b.href ? (
                  <Link href={b.href} title={b.label} className="max-w-[9rem] truncate rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{b.label}</Link>
                ) : (
                  <span aria-current={i === trail.length - 1 ? "page" : undefined} title={b.label} className="max-w-[10rem] truncate px-1 py-0.5 font-semibold">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          {eyebrow && <span className="mx-kicker mb-2 self-start">{eyebrow}</span>}
        </div>
        <div className="flex w-full flex-col items-center lg:px-56">
          <h1 className={`mx-title text-balance break-words font-[var(--font-display)] font-bold leading-[1.08] ${size}`}>{title}</h1>
          {description && <p className="mx-lead mx-auto mt-2.5 line-clamp-3 lg:line-clamp-2 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>}
          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:absolute lg:right-10 lg:top-6 lg:mt-0 lg:flex-col lg:items-end lg:gap-1.5">
              {chips.map((c) => (
                <li key={c} className="mx-fact">{c}</li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
