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
    el.style.setProperty("--ry", `${(px - 0.5) * 22}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * 22}deg`);
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
      data-card-index={index}
      className="tilt-card group relative block h-full w-full rounded-[var(--radius-lg)] p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      style={{
        transformStyle: "preserve-3d",
        transform: "translateZ(var(--lift,0px)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 0.3s var(--ease-lux)",
      }}
    >
      {/* grosor: losas traseras */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-[rgba(216,181,88,0.28)] blur-[1px]"
        style={{ transform: "translateZ(-30px)" }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] border border-[rgba(216,181,88,0.55)] bg-[#0a1c13]"
        style={{ transform: "translateZ(-15px)" }}
      />

      {/* cara: borde holográfico giratorio */}
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[inherit] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.95)]"
      >
        <span
          className="tilt-spin absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(216,181,88,0.15) 0 55%, rgba(255,240,190,0.95) 72%, rgba(47,156,98,0.6) 85%, rgba(216,181,88,0.15) 100%)",
          }}
        />
        <span
          className="absolute inset-[1.5px] rounded-[calc(var(--radius-lg)-1px)]"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 0%, rgba(231,207,140,0.16), transparent 55%), linear-gradient(165deg, #12301f, #0a1c13 70%)",
          }}
        />
        <span
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(280px circle at var(--mx,50%) var(--my,50%), rgba(255,240,190,0.28), transparent 60%)",
          }}
        />
      </span>

      <span
        aria-hidden
        className="absolute right-4 top-2 font-[var(--font-display)] text-7xl font-extrabold text-[var(--fg-lime-500)] opacity-[0.14]"
        style={{ transform: "translateZ(14px)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex h-full flex-col gap-3" style={{ transformStyle: "preserve-3d" }}>
        <span
          className="tilt-float flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[#06130c] text-[var(--fg-lime-400)] shadow-[0_18px_28px_-12px_rgba(0,0,0,0.9),0_0_22px_rgba(216,181,88,0.25)]"
          style={{ transform: "translateZ(70px)" }}
        >
          <Icon size={22} />
        </span>
        <div style={{ transform: "translateZ(46px)" }}>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">{tema.kicker}</p>
          <h3 className="mt-1 font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] [text-shadow:0_6px_18px_rgba(0,0,0,0.6)]">
            {tema.nombre}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]" style={{ transform: "translateZ(26px)" }}>
          {tema.descripcion}
        </p>
        <span
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-lime-400)]"
          style={{ transform: "translateZ(40px)" }}
        >
          {tema.proximamente ? "Próximamente" : "Entrar"}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
