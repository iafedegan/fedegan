"use client";

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronsDown, DoorOpen, Map } from "lucide-react";
import { MallScene, type SceneState } from "./MallScene";
import { TiltCard } from "./TiltCard";
import { Container } from "@/components/ui/Container";
import { temas } from "@/content/site";

const ROW_STEP = 660;
const FIRST_DEPTH = 1250;
const PUSH = 520;
const FOCUS_D = 360;
const DOOR_END = 0.16;
const TRAVEL_START = 0.2;
const TRACK_VH = 900;

const depthOf = (i: number) => FIRST_DEPTH + Math.floor(i / 2) * ROW_STEP;
const TOTAL = depthOf(temas.length - 1) - FOCUS_D - PUSH;
const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const pFor = (i: number) => TRAVEL_START + clamp((depthOf(i) - FOCUS_D - PUSH) / TOTAL) * (1 - TRAVEL_START);

export function MallEntrance() {
  const [flat, setFlat] = useState(false);
  const [active, setActive] = useState(-1);

  const state = useRef<SceneState>({ p: 0, mx: 0, my: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const doorsRef = useRef<HTMLDivElement>(null);
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hdrRef = useRef(110);
  const activeRef = useRef(-1);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFlat(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (flat) return;
    const header = document.querySelector("header");
    const setHdr = () => {
      hdrRef.current = header?.getBoundingClientRect().height ?? 110;
      stageRef.current?.style.setProperty("--hdr", `${hdrRef.current}px`);
    };
    setHdr();
    const ro = header ? new ResizeObserver(setHdr) : null;
    if (header && ro) ro.observe(header);

    const s = state.current;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const track = trackRef.current;
      const stage = stageRef.current;
      const world = worldRef.current;
      if (!track || !stage || !world) return;

      const rect = track.getBoundingClientRect();
      const range = Math.max(track.offsetHeight - stage.offsetHeight, 1);
      const target = clamp((hdrRef.current - rect.top) / range);
      s.p += (target - s.p) * 0.085;
      if (Math.abs(target - s.p) < 0.0002) s.p = target;

      const pd = clamp(s.p / DOOR_END);
      const e = ease(pd);
      if (doorL.current) doorL.current.style.transform = `rotateY(${-e * 118}deg)`;
      if (doorR.current) doorR.current.style.transform = `rotateY(${e * 118}deg)`;
      if (doorsRef.current) doorsRef.current.style.visibility = pd >= 1 ? "hidden" : "visible";
      if (signRef.current) signRef.current.style.opacity = String(1 - clamp(pd * 2.4));
      if (beamRef.current) {
        beamRef.current.style.opacity = String(e * (1 - clamp((pd - 0.75) * 4)));
        beamRef.current.style.transform = `translateX(-50%) scaleX(${0.15 + e * 1.8})`;
      }
      if (dimRef.current) dimRef.current.style.opacity = String((1 - e) * 0.8);
      if (introRef.current) {
        const a = clamp((s.p - 0.17) / 0.05) * (1 - clamp((s.p - 0.32) / 0.06));
        introRef.current.style.opacity = String(a);
        introRef.current.style.transform = `translateY(${(1 - a) * 18}px)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp((s.p - TRAVEL_START) / (1 - TRAVEL_START))})`;

      const worldZ = e * PUSH + clamp((s.p - TRAVEL_START) / (1 - TRAVEL_START)) * TOTAL;
      world.style.transform = `translate3d(0,0,${worldZ}px) rotateY(${s.mx * 3}deg) rotateX(${-s.my * 2}deg)`;

      let best = -1;
      let bestF = 0.05;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const d = worldZ - depthOf(i);
        const far = clamp((d + 2300) / 700);
        const near = clamp((-40 - d) / 170);
        const op = Math.min(far, near);
        const f = clamp(1 - Math.abs(d + FOCUS_D) / 600);
        card.style.opacity = String(op);
        card.style.pointerEvents = op > 0.5 && s.p > DOOR_END ? "auto" : "none";
        card.style.setProperty("--lift", `${f * 46}px`);
        if (f > bestF && s.p > TRAVEL_START - 0.02) {
          bestF = f;
          best = i;
        }
      });
      if (best !== activeRef.current) {
        activeRef.current = best;
        setActive(best);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [flat]);

  function scrollToP(p: number) {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const range = track.offsetHeight - stage.offsetHeight;
    const top = track.getBoundingClientRect().top + window.scrollY - hdrRef.current + p * range;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    state.current.mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    state.current.my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }

  function onFocusCapture(e: FocusEvent<HTMLDivElement>) {
    const el = (e.target as HTMLElement).closest("[data-card-index]");
    if (!el) return;
    scrollToP(pFor(Number(el.getAttribute("data-card-index"))));
  }

  if (flat) {
    return (
      <section aria-label="Temas del portal" className="bg-[var(--bg)] py-14">
        <Container>
          <h1 className="mb-8 font-[var(--font-display)] text-4xl font-bold text-[var(--text)] sm:text-5xl">
            Bienvenido a FEDEGÁN–FNG
          </h1>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {temas.map((t, i) => (
              <div key={t.slug} className="h-72">
                <TiltCard tema={t} index={i} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  const panel = "absolute top-0 h-full w-1/2 border border-[var(--border-strong)] backdrop-blur-[1.5px]";

  return (
    <section aria-label="Recorrido por el portal">
      <h1 className="sr-only">FEDEGÁN–FNG, centro del sector ganadero</h1>
      <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
        <div
          ref={stageRef}
          onPointerMove={onPointerMove}
          className="sticky overflow-hidden bg-[var(--bg)] [--cw:min(62vw,17rem)] [--xf:0.78] md:[--cw:19.5rem] md:[--xf:1.4]"
          style={{ top: "var(--hdr, 110px)", height: "calc(100svh - var(--hdr, 110px))" }}
        >
          <MallScene state={state} />

          <div className="absolute inset-0" style={{ perspective: "1100px", perspectiveOrigin: "50% 44%" }}>
            <div
              ref={worldRef}
              onFocusCapture={onFocusCapture}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >
              {temas.map((t, i) => {
                const side = i % 2 === 0 ? -1 : 1;
                const row = Math.floor(i / 2);
                const y = [-14, 22, -4, 28][row % 4];
                return (
                  <div
                    key={t.slug}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="absolute"
                    style={{
                      width: "var(--cw)",
                      height: "18.5rem",
                      left: "calc(var(--cw) / -2)",
                      top: "-9.25rem",
                      opacity: 0,
                      transformStyle: "preserve-3d",
                      transform: `translate3d(calc(var(--cw) * var(--xf) * ${side}), ${y}px, ${-depthOf(i)}px) rotateY(${-side * 24}deg)`,
                    }}
                  >
                    <TiltCard tema={t} index={i} />
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={dimRef} className="pointer-events-none absolute inset-0 z-20 bg-[#05100b] backdrop-blur-[5px]" />

          <div
            ref={introRef}
            className="pointer-events-none absolute left-0 right-0 top-8 z-20 mx-auto max-w-3xl px-4 text-center opacity-0"
          >
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--fg-lime-500)]">
              Vestíbulo principal
            </span>
            <p className="mt-2 font-[var(--font-display)] text-3xl font-bold text-[var(--text)] [text-shadow:0_8px_30px_rgba(0,0,0,0.8)] sm:text-5xl">
              Cada tema es un local
            </p>
          </div>

          <div ref={doorsRef} className="absolute inset-0 z-30" style={{ perspective: "1800px" }}>
            <div ref={signRef} className="absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-4 pt-6 text-center">
              <Image src="/brand/fedegan-logo.jpg" alt="FEDEGÁN" width={64} height={64} priority className="h-14 w-14 rounded-[var(--radius-sm)]" />
              <p className="font-[var(--font-display)] text-3xl font-bold tracking-wide text-[var(--fg-lime-400)] [text-shadow:0_0_30px_rgba(216,181,88,0.45)] sm:text-4xl">
                Centro del sector ganadero
              </p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
                FEDEGÁN · Fondo Nacional del Ganado
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-[10.5rem] mx-auto w-[min(92%,64rem)]" style={{ transformStyle: "preserve-3d" }}>
              <div
                ref={beamRef}
                aria-hidden
                className="absolute left-1/2 top-0 h-full w-[60%] origin-center opacity-0"
                style={{ background: "radial-gradient(closest-side, rgba(255,240,190,0.85), rgba(216,181,88,0.25) 55%, transparent 80%)" }}
              />
              <div
                ref={doorL}
                className={`${panel} left-0 origin-left rounded-tl-[var(--radius-lg)]`}
                style={{ background: "linear-gradient(115deg, rgba(231,207,140,0.26), rgba(11,42,28,0.42) 40%, rgba(255,255,255,0.08) 58%, rgba(11,42,28,0.55))" }}
              >
                <span aria-hidden className="absolute right-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[var(--fg-lime-500)] shadow-[0_0_14px_rgba(216,181,88,0.7)]" />
              </div>
              <div
                ref={doorR}
                className={`${panel} right-0 origin-right rounded-tr-[var(--radius-lg)]`}
                style={{ background: "linear-gradient(245deg, rgba(231,207,140,0.26), rgba(11,42,28,0.42) 40%, rgba(255,255,255,0.08) 58%, rgba(11,42,28,0.55))" }}
              >
                <span aria-hidden className="absolute left-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[var(--fg-lime-500)] shadow-[0_0_14px_rgba(216,181,88,0.7)]" />
              </div>

              <button
                type="button"
                onClick={() => scrollToP(0.24)}
                className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-[var(--radius-pill)] border border-[var(--border-strong)] bg-[var(--fg-lime-500)] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--on-accent)] shadow-[0_18px_40px_-14px_rgba(216,181,88,0.6)] transition-transform duration-500 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
              >
                <DoorOpen size={18} />
                Ingresar al portal
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-4 px-4 pb-4 sm:px-8">
            <div className="max-w-[60%] text-left">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">
                {active >= 0 ? `Local ${String(active + 1).padStart(2, "0")} / ${temas.length}` : "Desplácese para ingresar"}
              </p>
              <p className="font-[var(--font-display)] text-lg font-bold text-[var(--text)] [text-shadow:0_4px_16px_rgba(0,0,0,0.8)]">
                {active >= 0 ? temas[active].nombre : ""}
              </p>
            </div>
            <div className="scroll-cue flex flex-col items-center text-[var(--fg-lime-400)]" aria-hidden>
              <ChevronsDown size={22} />
            </div>
            <Link
              href="/directorio"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-strong)] bg-[rgba(5,16,11,0.7)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)] backdrop-blur hover:bg-[var(--fg-lime-500)] hover:text-[var(--on-accent)]"
            >
              <Map size={14} /> Directorio
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-40 h-[3px] bg-[rgba(216,181,88,0.15)]">
            <div ref={barRef} className="h-full origin-left bg-[var(--fg-lime-500)]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
