"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DoorOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TiltCard } from "./TiltCard";
import { temas } from "@/content/site";

const STORAGE_KEY = "fedegan-entered";
const OPEN_MS = 1400;

export function MallEntrance() {
  const [open, setOpen] = useState(false);
  const [doorsGone, setDoorsGone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let entered = false;
    try {
      entered = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raf = requestAnimationFrame(() => {
      if (entered || reduced) {
        setOpen(true);
        setDoorsGone(true);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function enter() {
    if (open) return;
    setOpen(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    timer.current = setTimeout(() => setDoorsGone(true), OPEN_MS + 100);
  }

  const panel =
    "absolute top-0 h-full w-1/2 border border-[var(--border-strong)] backdrop-blur-[2px] transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <section
      aria-label="Entrada al portal"
      className="relative overflow-hidden bg-[var(--bg)] transition-[max-height] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        maxHeight: open ? 3200 : "min(82svh, 720px)",
        transitionDuration: `${OPEN_MS}ms`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, rgba(216,181,88,0.16), transparent 60%), radial-gradient(70% 70% at 50% 100%, rgba(47,156,98,0.18), transparent 70%)",
        }}
      />

      <div
        className="relative"
        style={{ perspective: "1400px" }}
      >
        <Container
          className={`py-14 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "opacity-100 [filter:none]" : "opacity-50 [filter:blur(3px)_brightness(0.7)]"
          }`}
        >
          <div {...(!open ? { inert: true } : {})}>
            <div className="mb-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">
                <span className="h-px w-6 bg-[var(--fg-lime-500)]" />
                Vestíbulo principal
              </span>
              <h1 className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-[1.1] text-[var(--text)] sm:text-5xl">
                Bienvenido a FEDEGÁN–FNG
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">
                Cada tema es un local. Elija a dónde quiere entrar: buscador, navegación y atención
                son comunes a todo el portal.
              </p>
            </div>

            <div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              style={{ perspective: "1200px" }}
            >
              {temas.map((t, i) => (
                <div
                  key={t.slug}
                  className="transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transitionDelay: open ? `${500 + i * 55}ms` : "0ms",
                    transform: open ? "translateZ(0) translateY(0)" : "translateZ(-220px) translateY(50px)",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <TiltCard tema={t} index={i} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {!doorsGone && (
        <div
          className="absolute inset-x-0 top-0 z-20"
          style={{ height: "min(82svh, 720px)", perspective: "1800px" }}
          aria-hidden={open}
        >
          <div className="absolute inset-0 bg-[var(--bg)] transition-opacity duration-700" style={{ opacity: open ? 0 : 1 }} />

          <div className="absolute inset-x-0 top-0 z-30 flex flex-col items-center gap-2 pt-7 text-center">
            <Image
              src="/brand/fedegan-logo.jpg"
              alt="FEDEGÁN"
              width={64}
              height={64}
              priority
              className="h-14 w-14 rounded-[var(--radius-sm)]"
            />
            <p className="font-[var(--font-display)] text-2xl font-bold tracking-wide text-[var(--fg-lime-400)] sm:text-3xl">
              Centro del sector ganadero
            </p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-faint)]">
              FEDEGÁN · Fondo Nacional del Ganado
            </p>
          </div>

          <div
            className="absolute inset-x-0 bottom-0 top-[10rem] mx-auto w-[min(92%,64rem)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className={`${panel} left-0 origin-left rounded-tl-[var(--radius-lg)]`}
              style={{
                transitionDuration: `${OPEN_MS}ms`,
                transform: open ? "rotateY(-112deg)" : "rotateY(0deg)",
                background:
                  "linear-gradient(115deg, rgba(231,207,140,0.18), rgba(11,42,28,0.55) 40%, rgba(255,255,255,0.06) 60%, rgba(11,42,28,0.7))",
              }}
            >
              <span aria-hidden className="absolute right-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[var(--fg-lime-500)] shadow-[0_0_14px_rgba(216,181,88,0.6)]" />
            </div>
            <div
              className={`${panel} right-0 origin-right rounded-tr-[var(--radius-lg)]`}
              style={{
                transitionDuration: `${OPEN_MS}ms`,
                transform: open ? "rotateY(112deg)" : "rotateY(0deg)",
                background:
                  "linear-gradient(245deg, rgba(231,207,140,0.18), rgba(11,42,28,0.55) 40%, rgba(255,255,255,0.06) 60%, rgba(11,42,28,0.7))",
              }}
            >
              <span aria-hidden className="absolute left-3 top-1/2 h-24 w-1.5 -translate-y-1/2 rounded-full bg-[var(--fg-lime-500)] shadow-[0_0_14px_rgba(216,181,88,0.6)]" />
            </div>

            <button
              type="button"
              onClick={enter}
              className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-[var(--radius-pill)] border border-[var(--border-strong)] bg-[var(--fg-lime-500)] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--on-accent)] shadow-[0_18px_40px_-14px_rgba(216,181,88,0.55)] transition-all duration-500 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
              style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
            >
              <DoorOpen size={18} />
              Ingresar al portal
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
