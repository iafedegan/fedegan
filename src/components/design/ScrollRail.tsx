"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Carril horizontal con ajuste por tarjeta y botones; en pantallas táctiles se desliza con el dedo.
// Con `autoplay` avanza solo una tarjeta cada pocos segundos, vuelve al inicio al llegar al final y se detiene
// al pasar el cursor, al enfocar, al tocar o si la persona prefiere menos movimiento.
export function ScrollRail({ children, label, autoplay = false, interval = 3800 }: { children: ReactNode; label: string; autoplay?: boolean; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.max(320, ref.current.clientWidth * 0.7), behavior: "smooth" });

  useEffect(() => {
    const el = ref.current;
    if (!autoplay || paused || held || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "16");
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, interval);
    return () => window.clearInterval(id);
  }, [autoplay, paused, held, interval]);

  return (
    <div className="relative" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocusCapture={() => setHeld(true)} onBlurCapture={() => setHeld(false)} onTouchStart={() => setHeld(true)} onTouchEnd={() => setHeld(false)}>
      <div className="mb-3 flex justify-end gap-2">
        {autoplay && (
          <button type="button" aria-label={paused ? `${label}: reanudar` : `${label}: pausar`} onClick={() => setPaused((p) => !p)} className="mx-arrow">
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
        <button type="button" aria-label={`${label}: anterior`} onClick={() => go(-1)} className="mx-arrow"><ChevronLeft size={18} /></button>
        <button type="button" aria-label={`${label}: siguiente`} onClick={() => go(1)} className="mx-arrow"><ChevronRight size={18} /></button>
      </div>
      <div ref={ref} className="mx-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
