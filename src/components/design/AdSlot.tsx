"use client";

import Link from "next/link";
import type { AdConfig, AdZoneId } from "@/lib/design/regions";
import { useLiveDesign } from "./live";

// Zona de publicidad: imagen enlazada a un anuncio. Los anuncios llevan etiqueta «Publicidad».
export function AdSlot({ zone, initial }: { zone: AdZoneId; initial?: AdConfig }) {
  const { value } = useLiveDesign<AdConfig | undefined>(initial, (d) => d.ads[zone]);
  if (!value?.on || !value.image) return null;
  if (zone === "portada") {
    const ext = Boolean(value.href && !value.href.startsWith("/"));
    const go = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value.image} alt={value.alt || ""} className="block w-full object-cover" style={{ height: value.height ? `${value.height}px` : "auto" }} />
        {value.href && <span className="portada-btn">{value.label || "Ver más"}</span>}
      </>
    );
    return (
      <section aria-label="Destacado" className="portada-banner" style={value.width ? { maxWidth: `${value.width}%`, marginInline: "auto" } : undefined}>
        {value.href ? (
          ext ? <a href={value.href} target="_blank" rel="noopener noreferrer">{go}</a> : <Link href={value.href}>{go}</Link>
        ) : (
          <div>{go}</div>
        )}
      </section>
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={value.image} alt={value.alt || "Publicidad"} loading="lazy" className="h-auto w-full rounded-[var(--radius-md)] border border-[var(--border)] object-cover" />
  );
  return (
    <aside aria-label="Publicidad" className="mx-auto w-full max-w-[86rem] px-4 py-4 sm:px-6 lg:px-10">
      <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Publicidad</p>
      {value.href ? (
        value.href.startsWith("/") ? (
          <Link href={value.href}>{img}</Link>
        ) : (
          <a href={value.href} target="_blank" rel="noopener noreferrer sponsored">
            {img}
          </a>
        )
      ) : (
        img
      )}
    </aside>
  );
}
