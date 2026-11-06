"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { AdConfig } from "@/lib/design/regions";
import { useLiveDesign } from "@/components/design/live";

// Imagen del hero: los banners activos (el de portada y los adicionales de Admin → Diseño → Publicidad) se alternan solos,
// con puntos para elegir; cada uno lleva a su enlace. Sin banners se usa la foto por defecto de la portada.
export function HeroMedia({ initial, fallback }: { initial: AdConfig[]; fallback: ReactNode }) {
  const { value } = useLiveDesign<AdConfig[]>(initial, (d) => [d.ads.portada, ...(d.banners ?? [])].filter((b): b is AdConfig => Boolean(b)));
  const slides = value.filter((b) => b.on && b.image);
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (n < 2 || pausa) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [n, pausa]);
  if (!n) return <>{fallback}</>;
  const act = slides[Math.min(i, n - 1)];
  const ext = Boolean(act.href && !act.href.startsWith("/"));
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={act.image} src={act.image} alt={act.alt || ""} className="hi-banner-img" style={{ height: act.height ? `${act.height}px` : undefined, maxWidth: act.width ? `${act.width}%` : undefined }} />
      {act.href && <span className="portada-btn">{act.label || "Ver más"}</span>}
    </>
  );
  return (
    <div className="hi-carousel" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      {act.href ? (
        ext ? <a href={act.href} target="_blank" rel="noopener noreferrer" className="hi-banner">{body}</a> : <Link href={act.href} className="hi-banner">{body}</Link>
      ) : (
        <div className="hi-banner">{body}</div>
      )}
      {n > 1 && (
        <div className="hi-dots" role="tablist" aria-label="Banners">
          {slides.map((_, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`Banner ${k + 1}`} onClick={() => setI(k)} className={k === i ? "on" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}
