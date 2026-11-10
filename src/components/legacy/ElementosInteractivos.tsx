"use client";

import { useEffect, useRef, useState } from "react";
import { enlaceSeguro, imagenSegura } from "./comun";

// Los elementos que necesitan el navegador: la cuenta regresiva y la comparación «antes y después».

const COLOMBIA = (f: string) => {
  const [dia, hora = "00:00"] = f.split(" ");
  const ms = Date.parse(`${dia}T${hora}:00-05:00`);
  return Number.isNaN(ms) ? null : ms;
};

export function CuentaRegresiva({ titulo, fecha, fin, boton, enlace }: { titulo: string; fecha: string; fin: string; boton: string; enlace: string }) {
  const meta = COLOMBIA(fecha);
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setAhora(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  if (meta === null) return null;
  const falta = ahora === null ? null : Math.max(0, meta - ahora);
  const partes = falta === null ? null : [["días", Math.floor(falta / 86400000)], ["horas", Math.floor(falta / 3600000) % 24], ["min", Math.floor(falta / 60000) % 60], ["seg", Math.floor(falta / 1000) % 60]] as const;
  const href = enlaceSeguro(enlace);
  return (
    <section className="@container my-8 rounded-[var(--radius-lg)] bg-[var(--fg-green-800)] p-6 text-center text-white @md:p-10" aria-live="off">
      {titulo && <p className="font-[var(--font-display)] text-lg font-bold opacity-90">{titulo}</p>}
      {falta === 0 ? (
        <p className="mt-2 font-[var(--font-display)] text-3xl font-bold">{fin || "¡Ya empezó!"}</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 @md:gap-4">
          {(partes ?? [["días", "–"], ["horas", "–"], ["min", "–"], ["seg", "–"]]).map(([n, v]) => (
            <div key={n} className="rounded-xl bg-white/10 px-2 py-3">
              <span className="block font-[var(--font-display)] text-3xl font-bold tabular-nums @md:text-5xl">{typeof v === "number" ? String(v).padStart(2, "0") : v}</span>
              <span className="text-xs uppercase tracking-widest opacity-80">{n}</span>
            </div>
          ))}
        </div>
      )}
      {boton && href && (
        <a href={href} className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[var(--fg-green-800)] no-underline">{boton}</a>
      )}
    </section>
  );
}

export function Comparacion({ antes, despues, etiqueta1, etiqueta2 }: { antes: string; despues: string; etiqueta1: string; etiqueta2: string }) {
  const [pos, setPos] = useState(50);
  const caja = useRef<HTMLDivElement>(null);
  const a = imagenSegura(antes);
  const d = imagenSegura(despues);
  if (!a || !d) return null;
  const mover = (x: number) => {
    const r = caja.current?.getBoundingClientRect();
    if (r && r.width > 0) setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  return (
    <figure className="@container my-8">
      <div
        ref={caja}
        className="relative aspect-video w-full touch-none select-none overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mover(e.clientX); }}
        onPointerMove={(e) => e.buttons > 0 && mover(e.clientX)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d} alt={etiqueta2 || "Después"} className="absolute inset-0 size-full object-cover" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a} alt={etiqueta1 || "Antes"} className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} draggable={false} />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">{etiqueta1 || "Antes"}</span>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">{etiqueta2 || "Después"}</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-bold text-[var(--fg-green-800)] shadow-lg">⇆</span>
        </div>
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Comparar antes y después" className="mt-3 w-full accent-[var(--fg-green-800)]" />
    </figure>
  );
}
