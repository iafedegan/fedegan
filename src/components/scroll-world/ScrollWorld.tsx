"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { warp } from "./timing";

export interface JourneySub {
  label: string;
  href: string;
  external?: boolean;
}

export interface JourneyScene {
  id: string;
  nombre: string;
  rubro: string;
  descripcion: string;
  tags: string[];
  href: string;
  external?: boolean;
  /** Opciones de segundo nivel que se despliegan al elegir la escena. */
  subs?: JourneySub[];
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

function SubLink({ sub }: { sub: JourneySub }) {
  return sub.external ? (
    <a href={sub.href} target="_blank" rel="noopener noreferrer" className="sw-sub">
      {sub.label}
    </a>
  ) : (
    <Link href={sub.href} className="sw-sub">
      {sub.label}
    </Link>
  );
}

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
export function ScrollWorld({ scenes, aliados = [] }: { scenes: JourneyScene[]; aliados?: { nombre: string; href: string; logo: string }[] }) {
  const K = scenes.length - 1;
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hintRef = useRef<HTMLParagraphElement | null>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  // Escena cuyas opciones están desplegadas; «pending» evita cerrarla mientras el scroll llega a ella.
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  const pending = useRef<number | null>(null);

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

      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - pv * 40));
      if (barRef.current) barRef.current.style.transform = `scaleX(${pv.toFixed(4)})`;
      const idx = clamp(Math.round(s), 0, K);
      if (idx !== activeIdx) {
        activeIdx = idx;
        if (pending.current !== null) {
          if (pending.current === idx) pending.current = null;
        } else if (openRef.current !== null && openRef.current !== idx) {
          openRef.current = null;
          setOpen(null);
        }
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

  const navigate = useCallback(
    (s: JourneyScene | JourneySub) => {
      if (s.external) window.open(s.href, "_blank", "noopener,noreferrer");
      else router.push(s.href);
    },
    [router],
  );

  // Primer toque: lleva la cámara a la escena y despliega sus opciones. Segundo toque sobre la misma: abre la sección.
  const pick = useCallback(
    (i: number) => {
      if (openRef.current === i) {
        navigate(scenes[i]);
        return;
      }
      pending.current = i;
      window.setTimeout(() => {
        if (pending.current === i) pending.current = null;
      }, 1800);
      openRef.current = i;
      setOpen(i);
      goTo(i);
    },
    [goTo, navigate, scenes],
  );

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
          <p ref={hintRef} className="sw-hint" aria-hidden>
            Desliza para recorrer <ArrowDown size={14} />
          </p>

          <nav className="sw-chips" aria-label="Locales del recorrido">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                type="button"
                onClick={() => pick(i)}
                className={`sw-chip${i === 0 ? " is-active" : ""}`}
                aria-expanded={open === i}
              >
                {s.nombre}
              </button>
            ))}
          </nav>

          {open !== null && scenes[open].subs && scenes[open].subs.length > 0 && (
            <div className="sw-msubs" style={{ "--acc": scenes[open].accent } as React.CSSProperties}>
              <ul>
                <li>
                  <button type="button" className="sw-sub sw-sub-main" onClick={() => navigate(scenes[open])}>
                    Ver todo {scenes[open].nombre} <ArrowRight size={14} aria-hidden />
                  </button>
                </li>
                {scenes[open].subs!.map((sub) => (
                  <li key={sub.href + sub.label}>
                    <SubLink sub={sub} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aliados.length > 0 && (
            <nav className="sw-aliados" aria-label="Portales aliados">
              <Container className="flex items-center gap-x-6 gap-y-2">
                <span className="sw-aliados-label">Portales aliados</span>
                <ul className="flex min-w-0 flex-1 items-center gap-x-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {aliados.map((a) => (
                    <li key={a.nombre} className="shrink-0">
                      <a href={a.href} target="_blank" rel="noopener noreferrer" className="sw-aliado" title={a.nombre}>
                        <Image src={a.logo} alt="" width={64} height={64} className="h-9 w-9 rounded-full border border-white/30 object-cover" />
                        <span>{a.nombre}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Container>
            </nav>
          )}

          <nav className="sw-rail" aria-label="Secciones del portal">
            <span ref={counterRef} className="sw-counter" aria-hidden>
              {two(1)} / {two(K + 1)}
            </span>
            {scenes.map((s, i) => (
              <div key={s.id} className="sw-item" style={{ "--acc": s.accent } as React.CSSProperties}>
                <button
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => pick(i)}
                  className={`sw-dot${i === 0 ? " is-active" : ""}`}
                  data-open={open === i}
                  aria-expanded={open === i}
                >
                  <span className="sw-dot-label">{s.nombre}</span>
                </button>
                {open === i && (
                  <ul className="sw-subs">
                    <li>
                      <button type="button" className="sw-sub sw-sub-main" onClick={() => navigate(s)}>
                        Ver todo {s.nombre} <ArrowRight size={14} aria-hidden />
                      </button>
                    </li>
                    {s.subs?.map((sub) => (
                      <li key={sub.href + sub.label}>
                        <SubLink sub={sub} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <Link href="/directorio" className="sw-more">
              Ver directorio completo
            </Link>
          </nav>
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
