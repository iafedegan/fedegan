"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AdConfig } from "@/lib/design/regions";
import { useLiveDesign } from "@/components/design/live";

/** Texto por defecto de la sección principal (la diapositiva 1 lo usa en los campos que queden vacíos). */
export const HERO_DEFAULTS = {
  titulo: "FEDEGÁN–FNG,",
  subtitulo: "el hub del ecosistema digital ganadero de Colombia",
  texto: "Conectamos a los actores del sector, promovemos el desarrollo sostenible y facilitamos el acceso a información, conocimiento y servicios para una ganadería más competitiva y sostenible.",
  boton1: "Conozca más sobre FEDEGÁN–FNG",
  enlace1: "/quienes-somos",
  boton2: "Explorar servicios",
  enlace2: "/servicios",
};

function Boton({ href, children, cls }: { href: string; children: React.ReactNode; cls: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className={cls}>{children}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  );
}

// Texto de la sección principal: sale de Admin → Diseño → Publicidad → «Banner de portada» (con valores por defecto).
export function HeroText({ initial }: { initial?: AdConfig }) {
  const { value } = useLiveDesign<AdConfig | undefined>(initial, (d) => d.ads.portada);
  const v = (k: keyof typeof HERO_DEFAULTS) => (value?.[k] && String(value[k]).trim()) || HERO_DEFAULTS[k];
  return (
    <div className="hi-hero-text">
      <h1>{v("titulo")}<span>{v("subtitulo")}</span></h1>
      <p>{v("texto")}</p>
      <div className="hi-btns">
        <Boton href={v("enlace1")} cls="hi-btn">{v("boton1")} <ArrowRight size={16} aria-hidden /></Boton>
        <Boton href={v("enlace2")} cls="hi-btn hi-ghost">{v("boton2")} <ArrowRight size={16} aria-hidden /></Boton>
      </div>
    </div>
  );
}
