import "./accesos-rapidos.css";
import Link from "next/link";
import { CalendarDots, ChartBar, ChatCircleDots, CreditCard, GraduationCap, Handshake } from "@phosphor-icons/react/dist/ssr";
import { ACCESOS_RAPIDOS, type AccesoId } from "@/content/accesos-rapidos";

// Cada acceso como icono de app de iOS: cuadro redondeado con degradado (claro arriba, intenso abajo) y figura blanca rellena.
const ICONOS: Record<AccesoId, { icon: typeof CreditCard; tono: [string, string] }> = {
  pagos: { icon: CreditCard, tono: ["#4cd964", "#1f9d3f"] },
  cifras: { icon: ChartBar, tono: ["#7d7aff", "#4a3fd6"] },
  eventos: { icon: CalendarDots, tono: ["#ff6961", "#e0261b"] },
  servicios: { icon: Handshake, tono: ["#4aa8ff", "#0a66e0"] },
  escuela: { icon: GraduationCap, tono: ["#ffb340", "#f57c00"] },
  contacto: { icon: ChatCircleDots, tono: ["#5ad7e8", "#0e93b3"] },
};

/** Los accesos de un toque. Los usan la portada táctil y el menú, así se ven y se llaman igual en los dos lados. */
export function AccesosRapidos({ onPick, className = "" }: { onPick?: () => void; className?: string }) {
  return (
    <nav className={`ar ${className}`} aria-label="Accesos rápidos">
      {ACCESOS_RAPIDOS.map(({ id, href, label }) => {
        const { icon: Icon, tono } = ICONOS[id];
        return (
          <Link key={id} href={href} onClick={onPick} className="ar-item">
            <span className="ar-ico" style={{ "--a": tono[0], "--b": tono[1] } as React.CSSProperties}><Icon size={30} weight="fill" aria-hidden /></span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
