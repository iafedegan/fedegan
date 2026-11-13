"use client";

import "./mobile-tab-bar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, LayoutGrid, Newspaper, Search } from "lucide-react";

const izquierda = [
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/buscador", label: "Buscar", icon: Search },
] as const;

// Barra inferior del celular: el inicio es un círculo grande al centro (como en CONtexto), a cada lado dos accesos,
// y «Menú» abre la hoja con todas las secciones.
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
      <Link href="/" aria-label="Inicio" aria-current={pathname === "/" ? "page" : undefined} className="mtb-casa">
        <span><Home size={28} strokeWidth={2} aria-hidden /></span>
      </Link>
      {item("/pagos", "Pagos", CreditCard)}
      <button type="button" aria-haspopup="dialog" aria-controls="menu-movil" onClick={abrirMenu} className="mtb-item">
        <LayoutGrid size={22} strokeWidth={1.8} aria-hidden />
        Menú
      </button>
    </nav>
  );
}
