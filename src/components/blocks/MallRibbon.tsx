"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { iconMap } from "@/components/ui/icon-map";
import type { Local } from "@/content/site";

const COPIES = 3;
const GAP = 0.12;
const HIDE = 74;
const FADE = 24;
const SECONDS_PER_CARD = 5;

const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function slotStyle(j: number, step: number): CSSProperties {
  const a = wrap180(j * step);
  const abs = Math.abs(a);
  return {
    transform: `rotateY(${-a}deg) translateZ(calc(var(--R) * -1))`,
    opacity: clamp01((HIDE - abs) / FADE),
    visibility: abs < HIDE ? "visible" : "hidden",
    ["--f" as string]: clamp01(1 - abs / (step * 2.2)),
  };
}

function Card({ local, index, art }: { local: Local; index: number; art: ReactNode }) {
  const Icon = iconMap[local.icon] ?? iconMap.store;
  const open = local.status === "abierto";

  function spot(e: ReactPointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <div
      className={`mr-card ${open ? "" : "is-soon"}`}
      style={{ ["--acc-rgb" as string]: local.accent ?? "216,181,88" }}
      onPointerMove={spot}
    >
      <div className="mr-face">
        <span className="mr-spot" />
        <span className="mr-dim" />
        <div className="mr-head">
          <span className="mr-chip">LOCAL {local.numero}</span>
          <span className="mr-status">
            <i />
            {open ? "Abierto" : "Próximamente"}
          </span>
        </div>
        <div className="mr-art">
          {art}
          <span className="mr-glow" />
          <span className="mr-orbit" />
          <span className="mr-icon">
            <Icon size={32} strokeWidth={1.5} />
          </span>
          <span className="mr-num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mr-body">
          <p className="mr-kicker">{local.rubro}</p>
          <h3 className="mr-title">{local.nombre}</h3>
          <p className="mr-desc">{local.descripcion}</p>
          {local.tags && (
            <ul className="mr-tags">
              {local.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <div className="mr-cta">
            <span>{open ? "Entrar" : "Próxima apertura"}</span>
            <span className="mr-arrow">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MallRibbon({ locales, arts }: { locales: Local[]; arts: ReactNode[] }) {
  const n = locales.length;
  const M = n * COPIES;
  const step = 360 / M;
  const stepRad = (step * Math.PI) / 180;
  const auto = step / SECONDS_PER_CARD;

  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sim = useRef({
    phi: 0,
    v: 0,
    t: 0,
    drag: false,
    moved: false,
    startX: 0,
    lastX: 0,
    lastT: 0,
    flick: 0,
    snap: null as number | null,
    resumeAt: 0,
    holdFor: 0,
    nextJump: 0,
    hover: false,
    paused: false,
    reduced: false,
    visible: true,
    R: 1050,
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    active: 0,
  });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      sim.current.reduced = mq.matches;
      setReduced(mq.matches);
    };
    const raf = requestAnimationFrame(apply);
    mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    if (!wrap || !ring) return;
    const apply = () => {
      const W = wrap.clientWidth;
      const cw = W >= 900 ? Math.min(Math.max(W * 0.2, 252), 340) : Math.min(Math.max(W * 0.66, 210), 290);
      const R = (cw * (1 + GAP)) / stepRad;
      sim.current.R = R;
      ring.style.setProperty("--cw", `${cw}px`);
      ring.style.setProperty("--ch", `${cw * 1.5}px`);
      ring.style.setProperty("--R", `${R}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [stepRad]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      sim.current.visible = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const s = sim.current;
      s.snap = null;
      s.phi += e.deltaX * (180 / (Math.PI * s.R)) * 0.9;
      s.holdFor = 3500;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const s = sim.current;
    s.t = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - s.t) / 1000, 0.05);
      s.t = now;
      if (s.holdFor > 0) {
        s.resumeAt = now + s.holdFor;
        s.holdFor = 0;
      }
      if (!s.visible || document.hidden) return;

      if (!s.drag) {
        if (s.snap !== null) {
          const d = s.snap - s.phi;
          if (s.reduced || Math.abs(d) < 0.02) {
            s.phi = s.snap;
            s.snap = null;
          } else {
            s.phi += d * (1 - Math.exp(-dt * 5.5));
          }
          s.v = 0;
        } else if (s.reduced) {
          if (!s.paused && !s.hover && now > s.resumeAt && now > s.nextJump) {
            s.phi += step;
            s.nextJump = now + 4500;
          }
        } else {
          const holding = s.paused || s.hover || now < s.resumeAt;
          s.v += ((holding ? 0 : auto) - s.v) * (1 - Math.exp(-dt * (holding ? 4.5 : 1.4)));
          s.phi += s.v * dt;
        }
      }

      const slots = slotRefs.current;
      for (let j = 0; j < M; j++) {
        const el = slots[j];
        if (!el) continue;
        const a = wrap180(j * step - s.phi);
        const abs = Math.abs(a);
        if (abs >= HIDE) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        const bob = s.reduced ? 0 : Math.sin(now / 1300 + j * 0.9) * 5;
        el.style.visibility = "visible";
        el.style.opacity = String(clamp01((HIDE - abs) / FADE));
        el.style.transform = `rotateY(${-a}deg) translateZ(calc(var(--R) * -1)) translateY(${bob}px)`;
        el.style.setProperty("--f", String(clamp01(1 - abs / (step * 2.2))));
      }

      const ring = ringRef.current;
      if (ring) {
        s.tx += (s.mx - s.tx) * 0.06;
        s.ty += (s.my - s.ty) * 0.06;
        ring.style.transform = s.reduced
          ? "translateZ(var(--R))"
          : `translateZ(var(--R)) rotateX(${-s.ty * 1.6}deg) rotateY(${s.tx * 1.6}deg)`;
      }

      const idx = (((Math.round(s.phi / step) % M) + M) % M) % n;
      if (idx !== s.active) {
        s.active = idx;
        setActive(idx);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [M, n, step, auto]);

  function holdAfterInteraction() {
    sim.current.holdFor = 4500;
  }

  function goTo(k: number) {
    const s = sim.current;
    let best = s.phi;
    let bestAbs = Infinity;
    for (let c = 0; c < COPIES; c++) {
      const d = wrap180((k + c * n) * step - s.phi);
      if (Math.abs(d) < bestAbs) {
        bestAbs = Math.abs(d);
        best = s.phi + d;
      }
    }
    s.snap = best;
    holdAfterInteraction();
  }

  function nudge(dir: 1 | -1) {
    const s = sim.current;
    const base = s.snap ?? Math.round(s.phi / step) * step;
    s.snap = base + dir * step;
    holdAfterInteraction();
  }

  function togglePause() {
    const next = !paused;
    sim.current.paused = next;
    setPaused(next);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = sim.current;
    s.drag = true;
    s.moved = false;
    s.startX = e.clientX;
    s.lastX = e.clientX;
    s.lastT = e.timeStamp;
    s.flick = 0;
    s.snap = null;
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = sim.current;
    const r = e.currentTarget.getBoundingClientRect();
    s.mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    s.my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!s.drag) return;
    if (!s.moved && Math.abs(e.clientX - s.startX) > 6) {
      s.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!s.moved) return;
    const now = e.timeStamp;
    const dx = e.clientX - s.lastX;
    const degPerPx = 180 / (Math.PI * s.R);
    const dt = Math.max((now - s.lastT) / 1000, 0.001);
    s.phi -= dx * degPerPx;
    s.flick = s.flick * 0.6 + ((-dx * degPerPx) / dt) * 0.4;
    s.lastX = e.clientX;
    s.lastT = now;
  }

  function onPointerUp() {
    const s = sim.current;
    if (!s.drag) return;
    s.drag = false;
    if (s.moved) {
      s.v = Math.max(Math.min(s.flick, 160), -160);
      holdAfterInteraction();
    }
  }

  const accessibleLinks = locales.filter((l) => l.status === "abierto");

  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Locales del gremio" className="relative">
      <div
        ref={wrapRef}
        className="mr-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") sim.current.hover = true;
        }}
        onPointerLeave={() => {
          const s = sim.current;
          s.hover = false;
          s.mx = 0;
          s.my = 0;
          onPointerUp();
        }}
        onClickCapture={(e) => {
          if (sim.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            sim.current.moved = false;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") nudge(-1);
          if (e.key === "ArrowRight") nudge(1);
        }}
      >
        <span className="mr-floor" aria-hidden="true" />
        <div ref={ringRef} className="mr-ring" aria-hidden="true">
          {Array.from({ length: M }, (_, j) => {
            const k = j % n;
            const l = locales[k];
            const card = <Card local={l} index={k} art={arts?.[k] ?? null} />;
            return (
              <div
                key={j}
                ref={(el) => {
                  slotRefs.current[j] = el;
                }}
                className="mr-slot"
                style={slotStyle(j, step)}
              >
                {l.status === "abierto" ? (
                  <Link href={l.href} target={l.external ? "_blank" : undefined} tabIndex={-1} draggable={false} className="block h-full rounded-[1.6rem] outline-none">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Container className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="mr-pager" role="group" aria-label="Elegir local">
          {locales.map((l, k) => (
            <button key={l.id} type="button" aria-current={k === active} aria-label={`Ver ${l.nombre}`} className={k === active ? "is-active" : ""} onClick={() => goTo(k)}>
              <span>{l.numero}</span>
              <span className="mr-pager-name">{l.nombre}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {reduced && <span className="mr-2 text-xs text-[var(--text-faint)]">Movimiento reducido: cambia por saltos</span>}
          <button type="button" className="mr-ctrl" aria-label="Locales anteriores" onClick={() => nudge(-1)}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="mr-ctrl" aria-pressed={paused} aria-label={paused ? "Reanudar movimiento automático" : "Pausar movimiento automático"} onClick={togglePause}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button type="button" className="mr-ctrl" aria-label="Locales siguientes" onClick={() => nudge(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
        <nav
          aria-label="Enlaces a los locales"
          className="sr-only focus-within:not-sr-only focus-within:flex focus-within:basis-full focus-within:flex-wrap focus-within:gap-2"
        >
          {accessibleLinks.map((l) => (
            <Link key={l.id} href={l.href} target={l.external ? "_blank" : undefined} className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
              {l.nombre}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
}
