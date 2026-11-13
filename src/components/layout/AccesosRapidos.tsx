import "./accesos-rapidos.css";
import Image from "next/image";
import Link from "next/link";
import { ACCESOS_RAPIDOS, type AccesoId } from "@/content/accesos-rapidos";

// Cada acceso es una foto con su nombre encima. Las fotos son las mismas de las cabeceras de cada sección del portal.
const FOTOS: Record<AccesoId, { src: string; pos: string }> = {
  pagos: { src: "/headers/ia-pagos.jpg", pos: "50% 45%" },
  cifras: { src: "/journey/cifras.jpg", pos: "50% 50%" },
  eventos: { src: "/headers/ia-eventos.jpg", pos: "50% 50%" },
  servicios: { src: "/headers/ia-servicios.jpg", pos: "50% 50%" },
  escuela: { src: "/headers/ia-escuela.jpg", pos: "50% 50%" },
  contacto: { src: "/headers/ia-contacto.jpg", pos: "50% 40%" },
};

/** Los accesos de un toque. Los usan la portada táctil y el menú, así se ven y se llaman igual en los dos lados. */
export function AccesosRapidos({ onPick, className = "" }: { onPick?: () => void; className?: string }) {
  return (
    <nav className={`ar ${className}`} aria-label="Accesos rápidos">
      {ACCESOS_RAPIDOS.map(({ id, href, label }) => (
        <Link key={id} href={href} onClick={onPick} className="ar-item">
          <Image src={FOTOS[id].src} alt="" fill sizes="(min-width: 768px) 16vw, 31vw" className="ar-foto" style={{ objectPosition: FOTOS[id].pos }} />
          <span className="ar-vela" aria-hidden />
          <span className="ar-nombre">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
