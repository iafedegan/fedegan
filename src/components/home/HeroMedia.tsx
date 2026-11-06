"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AdConfig } from "@/lib/design/regions";
import { useLiveDesign } from "@/components/design/live";

// Imagen del hero: si el banner de portada (Admin → Diseño → Publicidad) está activo, es la imagen del hero y lleva a su enlace;
// si no, se usa la foto por defecto de la portada.
export function HeroMedia({ initial, fallback }: { initial?: AdConfig; fallback: ReactNode }) {
  const { value } = useLiveDesign<AdConfig | undefined>(initial, (d) => d.ads.portada);
  if (!value?.on || !value.image) return <>{fallback}</>;
  const ext = Boolean(value.href && !value.href.startsWith("/"));
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value.image} alt={value.alt || ""} className="hi-banner-img" style={{ height: value.height ? `${value.height}px` : undefined, maxWidth: value.width ? `${value.width}%` : undefined }} />
      {value.href && <span className="portada-btn">{value.label || "Ver más"}</span>}
    </>
  );
  if (!value.href) return <div className="hi-banner">{body}</div>;
  return ext ? (
    <a href={value.href} target="_blank" rel="noopener noreferrer" className="hi-banner">{body}</a>
  ) : (
    <Link href={value.href} className="hi-banner">{body}</Link>
  );
}
