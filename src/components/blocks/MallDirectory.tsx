import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { journeyPhotos } from "@/content/scroll-world";
import { getPisos } from "@/lib/cms/content";

// Directorio: cada local del portal como una ficha con foto, descripción y entrada directa.
export async function MallDirectory({ showLink = true }: { showLink?: boolean }) {
  const pisos = (await getPisos()).filter((p) => p.locales.length > 0);
  if (!pisos.length) return null;
  return (
    <section aria-labelledby="locales-title" className="py-12 sm:py-16">
      <Container className="flex flex-col gap-14">
        {pisos.map((piso, p) => (
          <div key={piso.id}>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <span className="eyebrow">Directorio del portal</span>
                <h2 id={p === 0 ? "locales-title" : undefined} className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                  {piso.nombre}
                </h2>
                <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{piso.descripcion}</p>
              </div>
              {showLink && p === 0 && (
                <Link href="/directorio" className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
                  Ver directorio completo <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </header>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {piso.locales.map((l) => {
                const photo = journeyPhotos[l.id];
                const src = photo?.src ?? l.imagen;
                const soon = l.status === "proximamente";
                const card = (
                  <article className="group flex h-full flex-col overflow-hidden rounded-[0.9rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-[var(--fg-lime-500)] hover:shadow-[0_26px_44px_-28px_rgba(0,0,0,0.85)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-sunken)]">
                      {src && (
                        <Image
                          src={src}
                          alt={photo?.alt ?? ""}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          style={{ objectPosition: photo?.pos ?? l.imagenPos ?? "50% 50%" }}
                          className="object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.05]"
                        />
                      )}
                      {soon && <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">Próximamente</span>}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">{l.rubro}</p>
                      <h3 className="font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)]">{l.nombre}</h3>
                      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{l.descripcion}</p>
                      {l.tags && l.tags.length > 0 && <p className="text-xs text-[var(--text-faint)]">{l.tags.join(" · ")}</p>}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
                        {soon ? "En preparación" : "Entrar"} {!soon && (l.external ? <ArrowUpRight size={15} /> : <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />)}
                      </span>
                    </div>
                  </article>
                );
                return (
                  <li key={l.id}>
                    {soon ? (
                      card
                    ) : l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="block h-full">{card}</a>
                    ) : (
                      <Link href={l.href} className="block h-full">{card}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}
