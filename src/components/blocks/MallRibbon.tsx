"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { iconMap } from "@/components/ui/icon-map";
import type { Local } from "@/content/site";

const STEP_DESKTOP = 17.5;
const STEP_MOBILE = 26;

export function MallRibbon({ locales }: { locales: Local[] }) {
  const n = locales.length;
  const c = (n - 1) / 2;
  const [step, setStep] = useState(STEP_DESKTOP);
  const cap = c * step;
  const [rot, setRot] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, moved: false, active: false });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      setStep(mq.matches ? STEP_DESKTOP : STEP_MOBILE);
      setRot(0);
    };
    const raf = requestAnimationFrame(apply);
    mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, []);

  const clamp = (v: number) => Math.min(Math.max(v, -cap), cap);

  function onDown(e: PointerEvent<HTMLDivElement>) {
    drag.current = { x: e.clientX, moved: false, active: true };
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) {
      d.x = e.clientX;
      setRot((r) => clamp(r + dx * 0.14));
    }
  }
  function onUp() {
    drag.current.active = false;
    setDragging(false);
  }

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden select-none"
        style={{ perspective: "1500px", perspectiveOrigin: "50% 45%", touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        <div
          className="relative mx-auto [--cw:min(68vw,17rem)] [--ch:25rem] [--R:640px] md:[--R:1050px]"
          style={
            {
              height: "var(--ch)",
              margin: "2.5rem 0",
              transformStyle: "preserve-3d",
              transform: "translateZ(var(--R))",
              "--c": c,
              "--rot": `${rot}deg`,
              "--step": `${step}deg`,
            } as CSSProperties
          }
        >
          {locales.map((l, i) => {
            const Icon = iconMap[l.icon] ?? iconMap.store;
            const open = l.status === "abierto";
            const inner = (
              <div
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.4rem] border p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ${
                  open
                    ? "border-[var(--border-strong)] bg-[linear-gradient(165deg,var(--surface-solid),var(--bg-muted))]"
                    : "border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] opacity-80"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-3"
                  style={{
                    background: open
                      ? "repeating-linear-gradient(90deg, var(--fg-lime-500) 0 18px, var(--fg-lime-400) 18px 36px)"
                      : "repeating-linear-gradient(90deg, var(--border-strong) 0 18px, var(--border) 18px 36px)",
                  }}
                />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--fg-green-700)] transition-colors group-hover:bg-[var(--fg-green-700)] group-hover:text-[var(--on-accent)]">
                    <Icon size={22} />
                  </span>
                  <span className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-1.5 py-0.5 font-mono text-[0.66rem] font-bold tracking-wider text-[var(--text-faint)]">
                    LOCAL {l.numero}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-green-600)]">{l.rubro}</p>
                  <h3 className="font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)]">{l.nombre}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{l.descripcion}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${open ? "text-[var(--fg-green-700)]" : "text-[var(--text-faint)]"}`}>
                    <span className={`h-2 w-2 rounded-full ${open ? "bg-[var(--fg-lime-500)] shadow-[0_0_0_3px_rgba(216,181,88,0.25)]" : "bg-[var(--border-strong)]"}`} />
                    {open ? "Abierto" : "Próxima apertura"}
                  </span>
                  {open && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--fg-green-700)]">
                      Entrar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={l.id}
                className="absolute top-0"
                style={
                  {
                    "--i": i,
                    left: "calc(50% - var(--cw) / 2)",
                    width: "var(--cw)",
                    height: "var(--ch)",
                    transformStyle: "preserve-3d",
                    transform:
                      "rotateY(calc((var(--c) - var(--i)) * var(--step) - var(--rot))) translateZ(calc(var(--R) * -1))",
                    transition: dragging ? "none" : "transform 0.7s var(--ease-lux)",
                  } as CSSProperties
                }
              >
                {open ? (
                  <Link href={l.href} target={l.external ? "_blank" : undefined} draggable={false} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-[1.4rem]">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Locales anteriores"
          onClick={() => setRot((r) => clamp(r + step * 2))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-green-700)] transition-colors hover:bg-[var(--fg-green-700)] hover:text-[var(--on-accent)]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">Arrastre o use las flechas</span>
        <button
          type="button"
          aria-label="Locales siguientes"
          onClick={() => setRot((r) => clamp(r - step * 2))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-green-700)] transition-colors hover:bg-[var(--fg-green-700)] hover:text-[var(--on-accent)]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
