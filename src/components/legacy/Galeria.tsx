"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type FotoGaleria = { src: string; pie: string };

const COLUMNAS = {
  2: "grid-cols-2",
  3: "grid-cols-2 @lg:grid-cols-3",
  4: "grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4",
};

// Cuadrícula de fotos; al pulsar una se abre grande, con flechas para pasar a la siguiente.
export function Galeria({ fotos, columnas }: { fotos: FotoGaleria[]; columnas: 2 | 3 | 4 }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierta !== null && !el.open) el.showModal();
    if (abierta === null && el.open) el.close();
  }, [abierta]);

  const ir = (d: 1 | -1) => setAbierta((i) => (i === null ? i : (i + d + fotos.length) % fotos.length));
  const actual = abierta !== null ? fotos[abierta] : null;

  return (
    <div className="@container my-6">
      <ul className={`grid gap-3 ${COLUMNAS[columnas]}`}>
        {fotos.map((f, i) => (
          <li key={i}>
            <button type="button" onClick={() => setAbierta(i)} aria-label={f.pie ? `Ampliar: ${f.pie}` : `Ampliar la foto ${i + 1}`} className="group block w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.pie} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            </button>
            {f.pie && <span className="mt-1.5 block text-sm leading-snug text-[var(--text-muted)]">{f.pie}</span>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        aria-label="Foto ampliada"
        onClose={() => setAbierta(null)}
        onClick={(e) => e.target === dialogo.current && setAbierta(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") ir(1);
          if (e.key === "ArrowLeft") ir(-1);
        }}
        className="m-auto max-h-[94vh] w-[min(68rem,94vw)] overflow-hidden rounded-xl border-0 bg-[#0b140a] p-0 text-white backdrop:bg-black/80"
      >
        {actual && (
          <div className="relative flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={actual.src} alt={actual.pie} className="max-h-[82vh] w-full object-contain" />
            {actual.pie && <p className="px-5 py-3 text-center text-sm text-white/90">{actual.pie}</p>}
            <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X size={20} aria-hidden /></button>
            {fotos.length > 1 && (
              <>
                <button type="button" onClick={() => ir(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><ChevronLeft size={22} aria-hidden /></button>
                <button type="button" onClick={() => ir(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><ChevronRight size={22} aria-hidden /></button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
