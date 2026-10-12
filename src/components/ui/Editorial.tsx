import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "./Container";

// Piezas editoriales compartidas por las páginas interiores.

export function Section({
  eyebrow,
  title,
  intro,
  children,
  id,
  tinted = false,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  id?: string;
  tinted?: boolean;
}) {
  return (
    <section id={id} className={`py-7 sm:py-9 ${tinted ? "border-y border-[var(--border)] bg-[var(--bg-muted)]" : ""}`}>
      <Container>
        {(eyebrow || title) && (
          <header className="mb-5 max-w-2xl sm:mb-6">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && (
              <h2 className="mt-2 text-balance font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">{title}</h2>
            )}
            {intro && <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{intro}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

// Lista numerada a modo de índice editorial: número grande, título y texto.
export function PrincipleList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((it, i) => (
        <li key={it.title} className="grid grid-cols-[3.2rem_1fr] gap-x-4 py-6 sm:grid-cols-[4.4rem_1fr] sm:py-7">
          <span aria-hidden className="font-[var(--font-display)] text-3xl font-bold leading-none text-[var(--fg-lime-500)] sm:text-4xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{it.title}</h3>
            <p className="mt-1.5 leading-relaxed text-[var(--text-muted)]">{it.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Timeline({ items }: { items: { year: string; title: string; text: string }[] }) {
  return (
    <ol className="relative ml-2 border-l border-[var(--border-strong)] pl-7 sm:ml-3 sm:pl-9">
      {items.map((it) => (
        <li key={`${it.year}-${it.title}`} className="relative pb-9 last:pb-0">
          <span aria-hidden className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--fg-lime-500)] bg-[var(--bg)] sm:-left-[2.85rem]" />
          <p className="font-[var(--font-display)] text-2xl font-bold leading-none tabular-nums text-[var(--fg-lime-400)]">{it.year}</p>
          <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--text)]">{it.title}</h3>
          <p className="mt-1 max-w-xl leading-relaxed text-[var(--text-muted)]">{it.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function PhotoTile({
  image,
  pos = "50% 50%",
  kicker,
  title,
  text,
  href,
  accent = "216,181,88",
  className = "",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  image: string;
  pos?: string;
  kicker?: string;
  title: string;
  text?: string;
  href?: string;
  accent?: string;
  className?: string;
  sizes?: string;
}) {
  const inner = (
    <div
      className={`group relative isolate flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] ${className}`}
      style={{ ["--acc-rgb" as string]: accent } as CSSProperties}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes}
        className="-z-10 object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.06]"
        style={{ objectPosition: pos }}
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(0deg, rgba(5,16,11,0.92) 0%, rgba(5,16,11,0.55) 42%, rgba(5,16,11,0.05) 78%), linear-gradient(135deg, rgba(var(--acc-rgb),0.22), transparent 55%)" }}
      />
      <div className="p-5 sm:p-6">
        {kicker && <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[rgb(var(--acc-rgb))]">{kicker}</p>}
        <h3 className="mt-1 font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] sm:text-2xl">{title}</h3>
        {text && <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>}
        {href && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
            Ver más <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function CtaBand({
  eyebrow,
  title,
  text,
  actions,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  actions: { label: string; href: string; variant?: "lime" | "secondary" }[];
}) {
  return (
    <section className="py-7 sm:py-9">
      <Container>
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] p-6 sm:p-8"
          style={{
            background:
              "radial-gradient(60% 140% at 100% 0%, rgba(216,181,88,0.2), transparent 70%), radial-gradient(50% 120% at 0% 100%, rgba(47,156,98,0.28), transparent 70%), var(--surface-solid)",
          }}
        >
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <h2 className="mt-3 text-balance font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">{title}</h2>
              {text && <p className="mt-2.5 leading-relaxed text-[var(--text-muted)]">{text}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {actions.map((a, i) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-5 py-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] transition-all duration-300 [transition-timing-function:var(--ease-lux)] hover:-translate-y-0.5 pointer-coarse:min-h-12 ${
                    (a.variant ?? (i === 0 ? "lime" : "secondary")) === "lime"
                      ? "bg-[var(--fg-lime-500)] text-[var(--fg-green-900)] hover:bg-[var(--fg-lime-400)]"
                      : "border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--fg-lime-500)]"
                  }`}
                >
                  {a.label} <ArrowUpRight size={15} aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
