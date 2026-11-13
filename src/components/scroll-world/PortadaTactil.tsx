import "./portada-tactil.css";
import Image from "next/image";
import { canOptimize } from "@/lib/image-host";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import type { AdConfig } from "@/lib/design/regions";
import type { JourneyScene } from "./ScrollWorld";

// Portada para celular y tableta (menos de 1024 px): el carrusel de portada que se maneja en Admin → Diseño → Publicidad
// (diapositivas con imagen, títulos, texto y hasta dos botones con enlace). Sin diapositivas, la foto de siempre con su titular.
// Todo lo demás vive en el menú (círculo de la casa en la barra inferior o los tres puntos del encabezado).
export function PortadaTactil({ scenes, banners }: { scenes: JourneyScene[]; banners: AdConfig[] }) {
  const inicio = scenes[0];
  const respaldo = (
    <div className="pt-hero">
      <Image src={inicio.image} alt={inicio.alt} fill sizes="100vw" preload unoptimized={!canOptimize(inicio.image)} className="pt-hero-img" style={{ objectPosition: inicio.pos }} />
      <div className="pt-hero-shade" aria-hidden />
      <div className="pt-hero-in">
        <h2 className="pt-title">Todo el gremio ganadero, <em>en su mano</em></h2>
      </div>
    </div>
  );
  return (
    <div className="pt">
      <HeroCarousel initial={banners} fallback={respaldo} />
    </div>
  );
}
