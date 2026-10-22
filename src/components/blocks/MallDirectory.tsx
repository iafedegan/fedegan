import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PhotoCard } from "@/components/ui/PhotoCard";
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
                return (
                  <li key={l.id}>
                    {src && (
                      <PhotoCard
                        image={src}
                        imagePos={photo?.pos ?? l.imagenPos ?? "50% 50%"}
                        accent={l.accent ?? "47,156,98"}
                        kicker={l.rubro}
                        title={l.nombre}
                        text={[l.descripcion, l.tags?.join(" · ")].filter(Boolean).join(" ")}
                        href={soon ? undefined : l.href}
                        external={l.external}
                        cta="Entrar"
                        badge={soon ? <span className="rounded-full bg-black/60 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">Próximamente</span> : undefined}
                      />
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
