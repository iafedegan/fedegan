"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Loader2 } from "lucide-react";
import { paginaEnLinea } from "@/lib/cms/seccion-vista";

// Portada de sección: el menú de temas va en vertical, numerado, y la página elegida se muestra ahí mismo, al lado,
// sin salir de la portada. Un tema con subpáginas se despliega debajo (a cualquier nivel) y cada subpágina también se abre al lado.
// Lo que se pide al elegir se guarda para no repetirlo.

export type TemaMenu = { clave?: string; nombre: string; href?: string; hijos: TemaMenu[] };
type Abierta = { titulo: string; href: string; contenido: ReactNode };

const hallar = (temas: TemaMenu[], id: string): TemaMenu | undefined => {
  let nivel = temas;
  let t: TemaMenu | undefined;
  for (const p of id.split(".")) {
    t = nivel[Number(p)];
    if (!t) return undefined;
    nivel = t.hijos;
  }
  return t;
};

export function SeccionExplorador({ slug, titulo, temas, inicial, lateral }: { slug: string; titulo: string; temas: TemaMenu[]; inicial: ReactNode; lateral?: ReactNode }) {
  const [sel, setSel] = useState<string | null>(null);
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set());
  const [, empezar] = useTransition();
  const [fallo, setFallo] = useState(false);
  const guardadas = useRef(new Map<string, Abierta>());
  const [, repintar] = useState(0);
  const panel = useRef<HTMLDivElement>(null);

  const elegir = (id: string) => {
    const t = hallar(temas, id);
    if (!t) return;
    setSel(id);
    setFallo(false);
    // Un tema con subpáginas se despliega; pulsarlo otra vez estando abierto y elegido lo pliega.
    if (t.hijos.length > 0) {
      setAbiertos((prev) => {
        const n = new Set(prev);
        if (n.has(id) && sel === id) n.delete(id);
        else n.add(id);
        return n;
      });
    }
    panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (!t.clave || guardadas.current.has(id)) return;
    empezar(async () => {
      const r = await paginaEnLinea(slug, t.clave!);
      if (r.ok) guardadas.current.set(id, { titulo: r.titulo, href: r.href, contenido: r.contenido });
      else setFallo(true);
      repintar((n) => n + 1);
    });
  };

  const actual = sel !== null ? guardadas.current.get(sel) : undefined;
  const tema = sel !== null ? hallar(temas, sel) : undefined;

  const lista = (items: TemaMenu[], prefijo: string, nivel: number): ReactNode => (
    <ol className={nivel === 0 ? undefined : "sx-sub"}>
      {items.map((t, i) => {
        const id = prefijo ? `${prefijo}.${i}` : String(i);
        const abierto = abiertos.has(id);
        const activo = sel === id;
        return (
          <li key={`${t.nombre}-${i}`}>
            <button type="button" onClick={() => elegir(id)} aria-current={activo ? "true" : undefined} aria-expanded={t.hijos.length > 0 ? abierto : undefined} className={nivel > 0 ? "sx-hijo" : undefined}>
              {nivel === 0 && <span className="sx-n">{String(i + 1).padStart(2, "0")}</span>}
              <span className="sx-nombre">{t.nombre}</span>
              {t.hijos.length > 0 && <ChevronDown size={16} aria-hidden className={`sx-flecha ${abierto ? "is-abierta" : ""}`} />}
            </button>
            {t.hijos.length > 0 && abierto && lista(t.hijos, id, nivel + 1)}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="sx">
      <nav aria-label={titulo} className="sx-menu">
        <p className="sx-menu-t">{titulo}</p>
        {lista(temas, "", 0)}
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
                <p className="sx-cargando"><Loader2 size={18} className="animate-spin" aria-hidden /> Cargando…</p>
              )
            ) : null}
            {tema.hijos.length > 0 && (
              <>
                {tema.clave && actual && <h3 className="sx-sub-t">Dentro de {tema.nombre}</h3>}
                <ul className="sx-hijos">
                  {tema.hijos.map((h, i) => (
                    <li key={`${h.nombre}-${i}`}>
                      <button type="button" onClick={() => elegir(`${sel}.${i}`)}>{h.nombre}</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {!tema.clave && tema.hijos.length === 0 && <p className="sx-vacio">Este tema aún no tiene páginas.</p>}
          </article>
        )}
      </div>
    </div>
  );
}
