import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Pictogram, type PictogramName } from "./Pictogram";

export type WaveAccent = "esmeralda" | "oro" | "terracota" | "turquesa";

// Ficha con ola de color: arriba el pictograma y el título; abajo una ola con dos palabras clave que, al pasar el
// cursor, sube y revela la descripción y la flecha. En pantallas táctiles la descripción se ve siempre.
export function WaveCard({
  href,
  external,
  accent = "esmeralda",
  icon,
  glyph,
  title,
  tags = [],
  text,
  cta = "Ver más",
  children,
}: {
  href?: string;
  external?: boolean;
  accent?: WaveAccent;
  icon?: PictogramName;
  /** Texto grande (un año, una fecha) en lugar del pictograma. */
  glyph?: ReactNode;
  title: string;
  tags?: string[];
  text?: string;
  cta?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <span className="wc-top">
        {glyph ? <span className="wc-glyph">{glyph}</span> : icon ? <Pictogram name={icon} size={54} className="wc-icon" /> : null}
        <span className="wc-title">{title}</span>
      </span>
      <span aria-hidden className="wc-wave2" />
      <span className="wc-wave">
        {tags.length > 0 ? (
          <span className="wc-tags">
            {tags.slice(0, 3).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </span>
        ) : href ? (
          <span className="wc-tags wc-tags-cta">{cta}</span>
        ) : null}
        <span className="wc-more">
          {text && <span className="wc-desc">{text}</span>}
          {children}
          {href && (
            <span className="wc-arrow" aria-hidden>
              {external ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />}
            </span>
          )}
          {href && <span className="sr-only">{cta}</span>}
        </span>
      </span>
    </>
  );
  const cls = `wc wc-${accent}`;
  if (!href) return <div className={cls}>{body}</div>;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
