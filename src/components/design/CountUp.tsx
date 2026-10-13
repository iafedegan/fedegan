"use client";

import { useEffect, useRef, useState } from "react";

// Cifra que sube hasta su valor al entrar en pantalla (sin animación si se prefiere menos movimiento).
export function CountUp({ to, from = 0, duration = 1400, className = "" }: { to: number; from?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(from + (to - from) * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setValue(from);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}
