import "./portada-tactil.css";
import Image from "next/image";
import { BotonSecciones } from "./BotonSecciones";
import { canOptimize } from "@/lib/image-host";
import { AccesosRapidos } from "@/components/layout/AccesosRapidos";
import type { JourneyScene } from "./ScrollWorld";

// Portada para celular y tableta (menos de 1024 px): foto de apertura con el titular y los
// accesos de un toque. Todo lo demás vive en un solo lugar, el menú (barra inferior → «Menú»): aquí solo se le da paso.
export function PortadaTactil({ scenes }: { scenes: JourneyScene[] }) {
  const inicio = scenes[0];

  return (
    <div className="pt">
      <div className="pt-hero">
        {/* Misma foto y mismos tamaños que la primera escena de escritorio: el navegador la baja una sola vez. */}
        <Image src={inicio.image} alt={inicio.alt} fill sizes="100vw" preload unoptimized={!canOptimize(inicio.image)} className="pt-hero-img" style={{ objectPosition: inicio.pos }} />
        <div className="pt-hero-shade" aria-hidden />
        <div className="pt-hero-in">
          <h2 className="pt-title">Todo el gremio ganadero, <em>en su mano</em></h2>
        </div>
        {/* Dentro de la foto: la hoja es transparente y deja ver la imagen completa detrás. */}
        <div className="pt-hoja">
          <AccesosRapidos className="pt-accesos" />
          <BotonSecciones />
        </div>
      </div>
    </div>
  );
}
