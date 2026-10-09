import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function PhotoCard({
  image,
  imagePos = "50% 50%",
  kicker,
  title,
  text,
  href,
  cta = "Ver más",
  accent,
  aspect = "aspect-[16/10]",
  badge,
  children,
}: {
  image: string;
  imagePos?: string;
  kicker?: string;
  title: string;
  text?: string;
  href?: string;
  cta?: string;
  accent?: string;
  aspect?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const card = (
    <div className="gl gl-hover" style={accent ? ({ ["--acc-rgb" as string]: accent } as CSSProperties) : undefined}>
      <div className="gl-face">
        <div className={`relative ${aspect} overflow-hidden`}>
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.07]"
            style={{ objectPosition: imagePos }}
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, var(--card-b) 0%, rgba(5,15,9,0.55) 28%, rgba(5,15,9,0) 62%), linear-gradient(135deg, rgba(var(--acc-rgb), 0.24), transparent 55%)",
            }}
          />
          {badge && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badge}</div>}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          {kicker && <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[rgb(var(--acc-rgb))]">{kicker}</p>}
          <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{title}</h3>
          {text && <p className="text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>}
          {children}
          {href && (
            <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
              {cta} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="group block h-full">
      {card}
    </Link>
  ) : (
    <div className="group h-full">{card}</div>
  );
}
