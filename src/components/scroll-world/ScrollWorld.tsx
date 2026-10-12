"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { warp } from "./timing";

export interface JourneyScene {
  id: string;
  nombre: string;
  rubro: string;
  descripcion: string;
  tags: string[];
  href: string;
  external?: boolean;
  /** Triple RGB "r,g,b" del local. */
  accent: string;
  image: string;
  pos: string;
  alt: string;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const two = (n: number) => String(n).padStart(2, "0");

function EnterLink({ scene, className }: { scene: JourneyScene; className?: string }) {
  const content = (
    <>
      Entrar <ArrowRight size={15} aria-hidden />
    </>
  );
  return scene.external ? (
    <a href={scene.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={scene.href} className={className}>
      {content}
    </Link>
  );
}

// Recorrido a pantalla completa por los locales del portal: el scroll conduce una cámara que
// avanza de foto en foto (cada una real, de finca), con un empuje continuo entre escenas.
export function ScrollWorld({ scenes }: { scenes: JourneyScene[] }) {
  const K = scenes.length - 1;
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || K < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let current = -1;
    let raf = 0;
    let last = 0;
    let activeIdx = -1;

    const header = document.querySelector("header");
    const setTop = () => track.style.setProperty("--sw-top", `${header ? header.getBoundingClientRect().height : 72}px`);
    setTop();

    const paint = (pv: number) => {
      const s = warp(pv, K) * K;

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const u = s - i;
        const hidden = u < -0.85 || u > 1.15;
        el.style.visibility = hidden ? "hidden" : "visible";
        if (hidden) return;
        const cu = clamp(u, -1, 1);
        const dir = i % 2 ? 1 : -1;
        const blur = u > 0.35 ? (u - 0.35) * 5 : u < -0.3 ? (-0.3 - u) * 6 : 0;
        el.style.opacity = String(i === 0 ? 1 : smooth(-0.68, -0.32, u));
        el.style.transform = `translate3d(${(-dir * cu * 1.4).toFixed(3)}%, ${(-cu * 0.9).toFixed(3)}%, 0) scale(${(1 + 0.1 * u).toFixed(4)})`;
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      });

      blockRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = clamp(1 - (Math.abs(s - i) - 0.16) / 0.32);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(0, ${((i - s) * 36).toFixed(2)}px, 0)`;
        el.style.visibility = a > 0.01 ? "visible" : "hidden";
        el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      });

      if (barRef.current) barRef.current.style.transform = `scaleX(${pv.toFixed(4)})`;
      const idx = clamp(Math.round(s), 0, K);
      if (idx !== activeIdx) {
        activeIdx = idx;
        stage.style.setProperty("--acc", scenes[idx].accent);
        if (counterRef.current) counterRef.current.textContent = `${two(idx + 1)} / ${two(K + 1)}`;
        dotRefs.current.forEach((d, j) => d?.classList.toggle("is-active", j === idx));
        chipRefs.current.forEach((d, j) => d?.classList.toggle("is-active", j === idx));
        const chip = chipRefs.current[idx];
        const strip = chip?.parentElement;
        if (chip && strip) strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
      }
    };

    const readProgress = () => {
      const run = track.offsetHeight - stage.offsetHeight;
      return run > 0 ? clamp(-track.getBoundingClientRect().top / run) : 0;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - (last || now)) / 1000);
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - current) < 0.0002) current = target;
      paint(current);
      if (current !== target) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const onScroll = () => {
      target = readProgress();
      if (current < 0) current = target;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      setTop();
      onScroll();
    });
    ro.observe(stage);
    if (header) ro.observe(header);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [K, scenes]);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      const run = track.offsetHeight - stage.offsetHeight;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (i / K) * run, behavior: "smooth" });
    },
    [K],
  );

  const skip = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + track.offsetHeight, behavior: "auto" });
  }, []);

  return (
    <section className="sw" data-region="hero" aria-label="Recorrido por los locales del portal">
      <div ref={trackRef} className="sw-track" style={{ "--sw-k": K } as React.CSSProperties}>
        <div ref={stageRef} className="sw-stage" style={{ "--acc": scenes[0].accent } as React.CSSProperties}>
          {scenes.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="sw-layer"
              style={i === 0 ? undefined : { visibility: "hidden", opacity: 0 }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="100vw"
                priority={i < 2}
                unoptimized={s.image.startsWith("http")}
                style={{ objectFit: "cover", objectPosition: s.pos }}
              />
            </div>
          ))}
          <div className="sw-shade" aria-hidden />
          <span ref={barRef} className="sw-bar" aria-hidden />

          <div className="sw-top">
            <Container className="flex items-center justify-between gap-4">
              <span className="eyebrow sw-kicker">Directorio del portal</span>
              <button type="button" onClick={skip} className="sw-skip">
                Saltar recorrido <ArrowDown size={14} aria-hidden />
              </button>
            </Container>
          </div>

          <nav className="sw-chips" aria-label="Locales del recorrido">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                type="button"
                onClick={() => goTo(i)}
                className={`sw-chip${i === 0 ? " is-active" : ""}`}
                aria-label={`Ir a ${s.nombre}`}
              >
                {s.nombre}
              </button>
            ))}
          </nav>

          <nav className="sw-rail" aria-label="Locales del recorrido">
            <span ref={counterRef} className="sw-counter" aria-hidden>
              {two(1)} / {two(K + 1)}
            </span>
            {scenes.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                type="button"
                onClick={() => goTo(i)}
                className={`sw-dot${i === 0 ? " is-active" : ""}`}
                aria-label={`Ir a ${s.nombre}`}
              >
                <span className="sw-dot-label">{s.nombre}</span>
              </button>
            ))}
          </nav>

          <div className="sw-overlay">
            <Container>
              <div className="sw-grid">
                {scenes.map((s, i) => (
                  <div
                    key={s.id}
                    ref={(el) => {
                      blockRefs.current[i] = el;
                    }}
                    className="sw-block"
                    style={{ "--acc": s.accent } as React.CSSProperties}
                  >
                    <span className="eyebrow">{s.rubro}</span>
                    <h2 className="sw-title">{s.nombre}</h2>
                    <p className="sw-body">{s.descripcion}</p>
                    {s.tags.length > 0 && (
                      <ul className="sw-tags">
                        {s.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                    <div className="sw-actions">
                      <EnterLink scene={s} className="sw-enter" />
                      {i === K && (
                        <Link href="/directorio" className="sw-more">
                          Ver directorio completo
                        </Link>
                      )}
                    </div>
                    {i === 0 && (
                      <p className="sw-hint" aria-hidden>
                        Desliza para recorrer <ArrowDown size={14} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Respaldo sin movimiento (preferencia de movimiento reducido). */}
      <div className="sw-static">
        <Container>
          <ol className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((s) => (
              <li key={s.id} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)]">
                <div className="relative aspect-[16/9]">
                  <Image src={s.image} alt={s.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" style={{ objectFit: "cover", objectPosition: s.pos }} />
                </div>
                <div className="p-6">
                  <span className="eyebrow">{s.rubro}</span>
                  <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{s.nombre}</h3>
                  <p className="mt-2 text-[var(--text-muted)]">{s.descripcion}</p>
                  <EnterLink scene={s} className="sw-enter mt-5" />
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </section>
  );
}
