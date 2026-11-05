import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { elegirFoto } from "@/components/ui/WaveCard";
import { excerptOf, getLegacyPage, legacyHref, type NavNode } from "@/content/legacy";

export const countBelow = (n: NavNode): number => (n.children ?? []).reduce((a, c) => a + 1 + countBelow(c), 0);

// Buscador de la sección: lleva al buscador del portal con el término escrito.
export function SectionSearch({ label, className = "" }: { label: string; className?: string }) {
  return (
    <form action="/buscador" method="get" role="search" className={`sec-search ${className}`}>
      <Search size={16} aria-hidden />
      <input type="search" name="q" placeholder={`Buscar en ${label}`} aria-label={`Buscar en ${label}`} autoComplete="off" />
      <button type="submit">Buscar</button>
    </form>
  );
}

// Entrada de la sección: foto grande con el número en un sello redondo y, debajo, título, extracto y avance de lo que hay dentro.
export function SectionTiles({ nodes, slug }: { nodes: NavNode[]; slug: string }) {
  return (
    <ol className="hub-tiles">
      {nodes.map((n, i) => {
        const kids = n.children ?? [];
        const total = countBelow(n);
        const href = n.key ? legacyHref(slug, n.key) : n.href;
        const page = n.key ? getLegacyPage(n.key) : null;
        const text = page ? excerptOf(page, 130).replace(/\*\*/g, "") : "";
        const external = !n.key && Boolean(n.href);
        const foto = elegirFoto(n.label);
        const style = { ["--i" as string]: i % 8 } as CSSProperties;
        const media = (
          <span className="hub-img">
            <Image src={foto.src} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: foto.pos }} />
            <span className="hub-badge" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
          </span>
        );
        const meta = (
          <span className="hub-meta">
            <h3 className="hub-name">{n.label}</h3>
            <span className="hub-foot">
              {total > 0 ? `${total} ${total === 1 ? "página" : "páginas"}` : external ? "Sitio externo" : "Abrir"}
              {external ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
            </span>
          </span>
        );
        return (
          <li key={`${n.label}-${i}`} style={style}>
            {href ? (
              external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hub-tile">
                  {media}
                  {meta}
                  {text && <span className="hub-text">{text}</span>}
                </a>
              ) : (
                <Link href={href} className="hub-tile">
                  {media}
                  {meta}
                  {text && <span className="hub-text">{text}</span>}
                  {kids.length > 0 && (
                    <span className="hub-kids" aria-label={`Dentro de ${n.label}`}>
                      {kids.slice(0, 3).map((k) => (
                        <span key={k.label}>{k.label}</span>
                      ))}
                      {kids.length > 3 && <span>+{kids.length - 3} más</span>}
                    </span>
                  )}
                </Link>
              )
            ) : (
              // Encabezado sin página propia: se muestra como grupo con sus enlaces.
              <div className="hub-tile hub-group">
                {media}
                <span className="hub-meta">
                  <h3 className="hub-name">{n.label}</h3>
                </span>
                <ul className="hub-links">
                  {kids.slice(0, 6).map((k) => {
                    const kh = k.key ? legacyHref(slug, k.key) : k.href;
                    return (
                      <li key={k.label}>
                        {kh ? (k.key ? <Link href={kh}>{k.label}</Link> : <a href={kh} target="_blank" rel="noopener noreferrer">{k.label}</a>) : <span>{k.label}</span>}
                      </li>
                    );
                  })}
                  {kids.length > 6 && <li className="hub-more">+{kids.length - 6} más</li>}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type FlatPage = { label: string; href: string };

// Páginas de la sección en el orden del menú, para «Anterior / Siguiente».
export function flattenTree(nodes: NavNode[], slug: string, out: FlatPage[] = []): FlatPage[] {
  for (const n of nodes) {
    if (n.key) out.push({ label: n.label, href: legacyHref(slug, n.key) });
    if (n.children) flattenTree(n.children, slug, out);
  }
  return out;
}

export function PrevNext({ prev, next }: { prev?: FlatPage; next?: FlatPage }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Anterior y siguiente" className="pn">
      {prev ? (
        <Link href={prev.href} rel="prev" className="pn-card">
          <span className="pn-dir"><ArrowLeft size={14} aria-hidden /> Anterior</span>
          <span className="pn-name">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} rel="next" className="pn-card pn-next">
          <span className="pn-dir">Siguiente <ArrowRight size={14} aria-hidden /></span>
          <span className="pn-name">{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
