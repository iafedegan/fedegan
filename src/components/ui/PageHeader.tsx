import { SITE_URL } from "@/lib/site-url";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

type Variant = "full" | "strip" | "band";

// Cabecera de las páginas interiores. Tiene tres composiciones:
//  · "full"  (por defecto): migas, titular, bajada y datos clave apilados.
//  · "strip": solo la franja de migas (con un hueco a la derecha); el titular lo pinta la propia página dentro del contenido.
//  · "band":  franja oscura con el titular a la izquierda y un panel de datos o acciones a la derecha.
// Ya no lleva foto de banner; image/imagePos se aceptan por compatibilidad y se ignoran.
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  image,
  imagePos,
  facts,
  meta,
  compact = false,
  variant = "full",
  aside,
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
  variant?: Variant;
  /** Panel a la derecha: en «strip» va junto a las migas; en «band», junto al titular. */
  aside?: ReactNode;
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

  const crumbNav = (
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
  );
  // Foto de fondo de toda la página: queda fija detrás del contenido, con un degradé encima (se define en globals.css).
  // Va por el optimizador de Next (AVIF/WebP) con dos tamaños, uno para pantallas pequeñas y otro para grandes.
  // Se pinta con una hoja de estilos en línea: llega ya en el HTML y desaparece sola al salir de la página.
  const bgOk = Boolean(image && image.startsWith("/") && /^[\w\-./]+$/.test(image));
  const posOk = imagePos && /^[\d.% ]+$/.test(imagePos) ? imagePos : "50% 50%";
  const photo = bgOk ? (
    <>
      <i hidden className="ed-bgmark" />
      <style>{`html{--page-photo:url("/_next/image?url=${encodeURIComponent(image!)}&w=1920&q=70");--page-photo-sm:url("/_next/image?url=${encodeURIComponent(image!)}&w=768&q=70");--page-pos:${posOk}}`}</style>
    </>
  ) : null;
  const ld = crumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />;

  if (variant === "strip") {
    return (
      <section className="mx-hero ed-head ed-strip" data-region="pagehead">
        {ld}
        {photo}
        <Container>
          <div className="ed-striprow">
            {crumbNav}
            {aside && <div className="ed-stripaside">{aside}</div>}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "band") {
    // Sin panel propio, los datos clave se muestran como ficha a la derecha del titular.
    const panel =
      aside ??
      (chips.length > 0 ? (
        <>
          <p className="ed-facts-title">Datos clave</p>
          <ul className="ed-facts">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      ) : null);
    return (
      <section className="mx-hero ed-head ed-band" data-region="pagehead">
        {ld}
        {photo}
        <Container>
          <div className="ed-flagrow">
            {eyebrow && <span className="ed-flag">{eyebrow}</span>}
            {crumbNav}
          </div>
          <div className={`ed-bandgrid ${panel ? "has-aside" : ""}`}>
            <div className="min-w-0">
              <h1 className={`ed-title ${size}`}>{title}</h1>
              {description && !compact && <p className="ed-deck">{description}</p>}
            </div>
            {panel && <div className="ed-bandaside">{panel}</div>}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="mx-hero ed-head" data-region="pagehead">
      {ld}
      {photo}
      <Container>
        <div className="ed-flagrow">
          {eyebrow && <span className="ed-flag">{eyebrow}</span>}
          {crumbNav}
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
