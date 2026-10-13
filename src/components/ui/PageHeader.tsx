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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  imagePos?: string;
  facts?: string[];
  meta?: string;
}) {
  const chips = facts ?? (meta ? [meta] : []);
  return (
    <section className={`mx-hero ${image ? "mx-hero-photo" : ""}`} data-region="pagehead">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: imagePos }} />
          <span aria-hidden className="mx-hero-shade" />
        </>
      )}
      <Container className="relative flex min-h-[10.5rem] flex-col justify-end py-6 sm:min-h-[13rem] sm:py-8">
        <nav aria-label="Ruta de navegación" className="mx-crumb mb-3 self-start text-xs">
          <Link href="/" className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">Inicio</Link>
          {breadcrumbs.map((b) => (
            <span key={b.label} className="flex items-center gap-1">
              <ChevronRight size={12} aria-hidden />
              {b.href ? (
                <Link href={b.href} className="rounded px-1 py-0.5 transition-colors hover:text-[var(--fg-lime-400)]">{b.label}</Link>
              ) : (
                <span aria-current="page" className="px-1 py-0.5 font-semibold">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow && <span className="mx-kicker mb-2 self-start">{eyebrow}</span>}
        <h1 className="mx-title text-balance font-[var(--font-display)] text-3xl font-bold leading-[1.05] sm:text-5xl">{title}</h1>
        {description && <p className="mx-lead mt-2.5 line-clamp-3 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>}
        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c} className="mx-fact">{c}</li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
