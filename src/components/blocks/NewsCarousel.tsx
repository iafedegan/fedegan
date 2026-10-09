"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import type { Noticia } from "@/lib/contexto";

const INTERVAL_MS = 5500;

export function NewsCarousel({ items }: { items: Noticia[] }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const paused = hover || userPaused;
  const rootRef = useRef<HTMLElement>(null);
  const count = items.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [paused, count, index]);

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carrusel"
      aria-label="Notas de interés"
      className="relative overflow-hidden bg-[var(--fg-green-900)] pb-20 pt-8 sm:pb-24 sm:pt-12"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
    >
      <h1 className="sr-only">FEDEGÁN–FNG, notas de interés del sector ganadero</h1>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 85% 10%, rgba(216,181,88,0.2), transparent 55%), linear-gradient(120deg, #0a2a1b 0%, #0f4a30 60%, #146238 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 28px)" }}
      />

      <Container className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-400)]">
            <span className="h-px w-6 bg-[var(--fg-lime-400)]" />
            Notas de interés
          </span>
          <Link href="/noticias" className="text-sm font-semibold text-[var(--fg-lime-400)] hover:text-white">
            Ver todas →
          </Link>
        </div>

        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1" aria-live={userPaused ? "polite" : "off"}>
          {items.map((n, i) => {
            const active = i === index;
            return (
              <article
                key={n.slug}
                aria-hidden={!active}
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${count}`}
                {...(!active ? { inert: true } : {})}
                className={`grid items-center gap-6 transition-opacity duration-700 ease-[var(--ease-lux)] lg:grid-cols-[1.4fr_1fr] lg:gap-10 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#06130c] shadow-[var(--shadow-lg)]">
                  {n.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image}
                      alt={n.imageAlt ?? ""}
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-linear ${
                        active && !reduced ? "scale-[1.06]" : "scale-100"
                      }`}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 26px), linear-gradient(160deg,#146238,#0c3524)",
                      }}
                    />
                  )}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
                    {items.map((_, d) => (
                      <button
                        key={d}
                        type="button"
                        aria-label={`Ir a la nota ${d + 1}`}
                        aria-current={d === index}
                        onClick={() => go(d)}
                        className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${
                          d === index ? "w-8 bg-white/30" : "w-2.5 bg-white/70 hover:bg-white"
                        }`}
                      >
                        {d === index && (
                          <span
                            key={`${index}-${paused}`}
                            className="carousel-fill absolute inset-0 origin-left rounded-full bg-[var(--fg-lime-500)]"
                            style={{
                              animationDuration: `${INTERVAL_MS}ms`,
                              animationPlayState: paused ? "paused" : "running",
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-white">
                  <div className="flex items-center gap-3">
                    <Badge tone="lime">{n.section}</Badge>
                    <span className="text-xs font-semibold text-white/60">{n.date}</span>
                  </div>
                  <h2 className="line-clamp-4 font-[var(--font-display)] text-2xl font-bold leading-[1.15] text-white sm:text-3xl lg:text-[2.1rem]">
                    {n.title}
                  </h2>
                  <p className="line-clamp-4 leading-relaxed text-white/75">{n.dek}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <Link
                      href={`/noticias/${n.slug}`}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-[var(--on-accent)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Ver más <ArrowRight size={16} />
                    </Link>
                    <div className="ml-auto flex gap-2">
                      <button
                        type="button"
                        aria-label={userPaused ? "Reanudar el carrusel" : "Pausar el carrusel"}
                        onClick={() => setUserPaused((v) => !v)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
                      >
                        {userPaused ? <Play size={16} /> : <Pause size={16} />}
                      </button>
                      <button
                        type="button"
                        aria-label="Nota anterior"
                        onClick={() => go(index - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Nota siguiente"
                        onClick={() => go(index + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
