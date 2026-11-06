"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideItem = { id: string; label: string; href: string; external?: boolean };

// Menú del recorrido de la portada, siempre a mano en las demás páginas: una franja fina en el borde derecho
// que se despliega al pasar el cursor (o al enfocarla con el teclado).
export function SideMenuView({ items }: { items: SideItem[] }) {
  const path = usePathname() || "/";
  if (path === "/" || path.startsWith("/admin") || path.startsWith("/panel")) return null;
  return (
    <nav className="sm" aria-label="Secciones del portal">
      <span className="sm-tab" aria-hidden>
        <em className="sm-arrow" />
        <span className="sm-label">Más secciones</span>
      </span>
      <ul className="sm-panel">
        {items.map((i) => {
          const on = i.href === path || (i.href !== "/" && path.startsWith(`${i.href}/`));
          const inner = (
            <>
              <span>{i.label}</span>
              <b aria-hidden />
            </>
          );
          return (
            <li key={i.id} data-on={on || undefined}>
              {i.external ? (
                <a href={i.href} target="_blank" rel="noopener noreferrer">{inner}</a>
              ) : (
                <Link href={i.href}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
