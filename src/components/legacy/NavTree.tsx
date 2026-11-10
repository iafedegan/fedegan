"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";

export type NavItem = { label: string; href?: string; external?: boolean; key?: string; children?: NavItem[] };

const holds = (n: NavItem, key: string): boolean => n.key === key || Boolean(n.children?.some((c) => holds(c, key)));

// Menú lateral de una sección, con el mismo estilo que el de la portada (numerado, barra guinda, tema activo en verde):
// todas las ramas se pueden desplegar y recoger; la de la página actual arranca abierta.
export function NavTree({ nodes, current, depth = 0 }: { nodes: NavItem[]; current: string; depth?: number }) {
  return (
    <ol className={depth === 0 ? undefined : "sx-sub"}>
      {nodes.map((n, i) => (
        <NavRow key={`${n.label}-${i}`} node={n} current={current} depth={depth} indice={i} />
      ))}
    </ol>
  );
}

function NavRow({ node: n, current, depth, indice }: { node: NavItem; current: string; depth: number; indice: number }) {
  const hasKids = Boolean(n.children?.length);
  const [open, setOpen] = useState(() => hasKids && holds(n, current));
  const active = n.key === current;
  const contenido = (
    <>
      {depth === 0 && <span className="sx-n">{String(indice + 1).padStart(2, "0")}</span>}
      <span className="sx-nombre">{n.label}</span>
      {n.external && <ExternalLink size={13} aria-hidden className="shrink-0 opacity-70" />}
    </>
  );
  return (
    <li>
      <div className="sx-fila">
        {n.href && n.external ? (
          <a href={n.href} target="_blank" rel="noopener noreferrer" className="sx-fila-a">{contenido}</a>
        ) : n.href ? (
          <Link href={n.href} className="sx-fila-a" aria-current={active ? "page" : undefined}>{contenido}</Link>
        ) : (
          <span className="sx-fila-a sx-fila-t">{contenido}</span>
        )}
        {hasKids && (
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`${open ? "Recoger" : "Desplegar"} ${n.label}`} className="sx-fila-b">
            <ChevronDown size={16} aria-hidden className={`sx-flecha ${open ? "is-abierta" : ""}`} />
          </button>
        )}
      </div>
      {hasKids && open && <NavTree nodes={n.children!} current={current} depth={depth + 1} />}
    </li>
  );
}
