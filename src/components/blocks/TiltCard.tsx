"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/components/ui/icon-map";
import type { Tema } from "@/content/site";

export function TiltCard({ tema, index }: { tema: Tema; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const Icon = iconMap[tema.icon] ?? iconMap.store;

  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * 16}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={tema.href}
      target={tema.external ? "_blank" : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="tilt-card group relative block h-full min-h-[15rem] rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(216,181,88,0.1))] p-5 shadow-[0_26px_50px_-30px_rgba(0,0,0,0.95)] hover:shadow-[0_40px_70px_-30px_rgba(216,181,88,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 0.25s var(--ease-lux), border-color 0.4s, box-shadow 0.4s",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(216,181,88,0.22), transparent 60%)",
        }}
      />
      <span
        aria-hidden
        className="absolute right-4 top-2 font-[var(--font-display)] text-6xl font-extrabold text-[var(--fg-lime-500)] opacity-[0.16]"
        style={{ transform: "translateZ(12px)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex h-full flex-col gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--fg-lime-500)] shadow-[0_14px_24px_-12px_rgba(0,0,0,0.8)]"
          style={{ transform: "translateZ(56px)" }}
        >
          <Icon size={22} />
        </span>
        <div style={{ transform: "translateZ(38px)" }}>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">
            {tema.kicker}
          </p>
          <h3 className="mt-1 font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">
            {tema.nombre}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]" style={{ transform: "translateZ(22px)" }}>
          {tema.descripcion}
        </p>
        <span
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-lime-400)]"
          style={{ transform: "translateZ(30px)" }}
        >
          {tema.proximamente ? "Próximamente" : "Entrar"}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
