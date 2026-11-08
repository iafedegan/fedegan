"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const COLORES = ["#72BF44", "#89114C", "#C9992B", "#1B7F73", "#D9772E", "#3C6DB0"];

/** Lluvia de confeti (solo CSS) que se apaga sola. */
export function Confeti({ cantidad = 42 }: { cantidad?: number }) {
  const [ver, setVer] = useState(true);
  const [piezas] = useState(() =>
    Array.from({ length: cantidad }, (_, i) => ({
      i,
      x: Math.random() * 100,
      d: Math.random() * 0.6,
      t: 1.6 + Math.random() * 1.2,
      r: Math.random() * 360,
      c: COLORES[i % COLORES.length],
      w: 6 + Math.random() * 7,
    })),
  );
  useEffect(() => {
    const id = setTimeout(() => setVer(false), 3200);
    return () => clearTimeout(id);
  }, []);
  if (!ver) return null;
  return (
    <div className="st-confeti" aria-hidden>
      {piezas.map((p) => (
        <i key={p.i} style={{ left: `${p.x}%`, background: p.c, width: p.w, height: p.w * 0.45, animationDelay: `${p.d}s`, animationDuration: `${p.t}s`, ["--r" as string]: `${p.r}deg` }} />
      ))}
    </div>
  );
}

/** Estrellas de 0 a 3 con entrada animada. */
export function Estrellas({ n, grande = false }: { n: number; grande?: boolean }) {
  return (
    <span className="inline-flex gap-1" role="img" aria-label={`${n} de 3 estrellas`}>
      {[0, 1, 2].map((k) => (
        <Star key={k} size={grande ? 40 : 15} className={k < n ? "st-estrella" : ""} style={{ animationDelay: `${k * 160}ms`, color: k < n ? "#C9992B" : "#cfd4c8", fill: k < n ? "#E6B93D" : "transparent" }} aria-hidden />
      ))}
    </span>
  );
}
