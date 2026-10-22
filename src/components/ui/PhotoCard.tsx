import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

// "r,g,b" → versión más oscura para el degradado de la ola.
const darker = (rgb: string) => rgb.split(",").map((n) => Math.round(Number(n) * 0.5)).join(",");

// Ficha con foto y ola de color: la foto arriba, una ola con el tipo y el título abajo; al pasar el cursor la ola
// sube y muestra el texto y la flecha. En pantallas táctiles el texto se ve siempre.
export function PhotoCard({
  image,
  imagePos = "50% 50%",
  kicker,
  title,
  text,
  href,
  external,
  cta = "Ver más",
  accent = "47,156,98",
  badge,
  children,
}: {
  image: string;
  imagePos?: string;
  kicker?: string;
  title: string;
  text?: string;
  href?: string;
  external?: boolean;
  cta?: string;
  accent?: string;
  aspect?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const style = { ["--wa" as string]: accent, ["--wb" as string]: darker(accent) } as CSSProperties;
  const body = (
    <>
      <span className="wp-img">
        <Image src={image} alt="" fill unoptimized={image.startsWith("http")} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" style={{ objectPosition: imagePos }} />
      </span>
      {badge && <span className="absolute left-3 top-3 z-[3] flex flex-wrap gap-1.5">{badge}</span>}
      <span aria-hidden className="wc-wave2" />
      <span className="wc-wave">
        {kicker && <span className="wp-kicker">{kicker}</span>}
        <span className="wp-title">{title}</span>
        <span className="wp-more">
          {text && <span className="wp-text">{text}</span>}
          {children}
          {href && (
            <span className="wc-arrow" aria-hidden>
              {external ? <ArrowUpRight size={18} /> : <ArrowRight size={18} />}
            </span>
          )}
          {href && <span className="sr-only">{cta}</span>}
        </span>
      </span>
    </>
  );
  if (!href) {
    return (
      <div className="wc wp" style={style}>
        {body}
      </div>
    );
  }
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="wc wp" style={style}>
      {body}
    </a>
  ) : (
    <Link href={href} className="wc wp" style={style}>
      {body}
    </Link>
  );
}
