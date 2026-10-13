"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carril horizontal con ajuste por tarjeta y botones; en pantallas táctiles se desliza con el dedo.
export function ScrollRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.max(320, ref.current.clientWidth * 0.7), behavior: "smooth" });
  return (
    <div className="relative">
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" aria-label={`${label}: anterior`} onClick={() => go(-1)} className="mx-arrow"><ChevronLeft size={18} /></button>
        <button type="button" aria-label={`${label}: siguiente`} onClick={() => go(1)} className="mx-arrow"><ChevronRight size={18} /></button>
      </div>
      <div ref={ref} className="mx-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
