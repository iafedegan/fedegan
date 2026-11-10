"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { paginaEnLinea } from "@/lib/cms/seccion-vista";

// Portada de sección: el menú de temas va en vertical, numerado, y la página elegida se muestra ahí mismo, al lado,
// sin salir de la portada. Lo que se pide al elegir un tema se guarda para no repetirlo.

export type TemaMenu = { clave?: string; nombre: string; href?: string; hijos: { nombre: string; href: string }[] };
type Abierta = { titulo: string; href: string; contenido: ReactNode };

export function SeccionExplorador({ slug, titulo, temas, inicial, lateral }: { slug: string; titulo: string; temas: TemaMenu[]; inicial: ReactNode; lateral?: ReactNode }) {
  const [sel, setSel] = useState<number | null>(null);
  const [enCurso, empezar] = useTransition();
  const [fallo, setFallo] = useState(false);
  const guardadas = useRef(new Map<number, Abierta>());
  const [, repintar] = useState(0);
  const panel = useRef<HTMLDivElement>(null);

  const elegir = (i: number) => {
    setSel(i);
    setFallo(false);
    panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const t = temas[i];
    if (!t.clave || guardadas.current.has(i)) return;
    empezar(async () => {
      const r = await paginaEnLinea(slug, t.clave!);
      if (r.ok) guardadas.current.set(i, { titulo: r.titulo, href: r.href, contenido: r.contenido });
      else setFallo(true);
      repintar((n) => n + 1);
    });
  };

  const actual = sel !== null ? guardadas.current.get(sel) : undefined;
  const tema = sel !== null ? temas[sel] : undefined;

  return (
    <div className="sx">
      <nav aria-label={titulo} className="sx-menu">
        <p className="sx-menu-t">{titulo}</p>
        <ol>
          {temas.map((t, i) => (
            <li key={`${t.nombre}-${i}`}>
              <button type="button" onClick={() => elegir(i)} aria-current={sel === i ? "true" : undefined}>
                <span className="sx-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="sx-nombre">{t.nombre}</span>
              </button>
            </li>
          ))}
        </ol>
        {lateral && <div className="sx-lateral">{lateral}</div>}
      </nav>

      <div ref={panel} className="sx-panel" aria-live="polite">
        {tema === undefined ? (
          inicial ?? <p className="sx-vacio">Elija un tema del menú: su contenido se muestra aquí.</p>
        ) : (
          <article className="ed-body min-w-0 [overflow-wrap:anywhere]">
            <header className="sx-cab">
              <h2>{actual?.titulo ?? tema.nombre}</h2>
              {(actual?.href ?? tema.href) && (
                <Link href={actual?.href ?? tema.href!} className="sx-abrir">Abrir página completa <ArrowUpRight size={15} aria-hidden /></Link>
              )}
            </header>
            {actual ? (
              actual.contenido
            ) : tema.clave ? (
              fallo ? (
                <p className="sx-vacio">No pudimos cargar esta página. <Link href={tema.href ?? `/seccion/${slug}`}>Ábrala completa</Link>.</p>
              ) : (
                <p className="sx-cargando"><Loader2 size={18} className="animate-spin" aria-hidden /> Cargando…{enCurso ? "" : ""}</p>
              )
            ) : (
              <ul className="sx-hijos">
                {tema.hijos.map((h) => <li key={h.href}><Link href={h.href}>{h.nombre}</Link></li>)}
                {tema.hijos.length === 0 && <li className="sx-vacio">Este tema aún no tiene páginas.</li>}
              </ul>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
