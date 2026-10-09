"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Menu, Newspaper, Search } from "lucide-react";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/directorio", label: "Locales", icon: LayoutGrid },
  { href: "/buscador", label: "Buscar", icon: Search },
];

// Barra de pestañas flotante tipo app, solo en móvil. "Más" abre el menú completo del encabezado.
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/ingresar")) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const item =
    "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.62rem] font-semibold tracking-wide transition-colors";

  return (
    <nav
      aria-label="Navegación de la aplicación"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] flex items-center rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-1.5 shadow-[0_22px_44px_-14px_rgba(0,0,0,0.95)] backdrop-blur-xl md:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${item} ${active ? "text-[var(--fg-lime-400)]" : "text-[var(--text-muted)] active:text-[var(--text)]"}`}>
            <span className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-300 ${active ? "bg-[rgba(216,181,88,0.16)]" : ""}`}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            </span>
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("fedegan:menu"))}
        className={`${item} text-[var(--text-muted)] active:text-[var(--text)]`}
      >
        <span className="flex h-8 w-14 items-center justify-center rounded-full">
          <Menu size={21} strokeWidth={1.8} />
        </span>
        Más
      </button>
    </nav>
  );
}
