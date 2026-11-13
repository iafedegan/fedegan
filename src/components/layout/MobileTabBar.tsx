"use client";

import "./mobile-tab-bar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";
import { CreditCard, Home, Newspaper, Search } from "lucide-react";

const izquierda = [
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/buscador", label: "Buscar", icon: Search },
] as const;

// Barra inferior del celular: un círculo grande con la casa al centro (como en CONtexto) que abre la hoja con todas las secciones,
// y a cada lado dos accesos directos.
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/ingresar")) return null;
  const activa = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const abrirMenu = () => window.dispatchEvent(new Event("fedegan:menu"));

  const item = (href: string, label: string, Icon: typeof Home) => (
    <Link key={href} href={href} aria-current={activa(href) ? "page" : undefined} className="mtb-item">
      <Icon size={22} strokeWidth={activa(href) ? 2.2 : 1.8} aria-hidden />
      {label}
    </Link>
  );

  return (
    <nav aria-label="Navegación de la aplicación" className="mtb">
      {izquierda.map((t) => item(t.href, t.label, t.icon))}
      {/* El círculo del centro abre el menú; el inicio es la primera opción de la hoja y el logo del encabezado. */}
      <button type="button" aria-label="Abrir el menú" aria-haspopup="dialog" aria-controls="menu-movil" onClick={abrirMenu} className="mtb-casa">
        <span><Home size={28} strokeWidth={2} aria-hidden /></span>
      </button>
      {item("/pagos", "Pagos", CreditCard)}
      <Link href="/seccion/cifras-del-sector" aria-current={activa("/seccion/cifras-del-sector") ? "page" : undefined} className="mtb-item">
        <ChartBar size={22} weight={activa("/seccion/cifras-del-sector") ? "fill" : "regular"} aria-hidden />
        Cifras
      </Link>
    </nav>
  );
}
