import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { excerptOf, getLegacyPage, legacyHref, type LegacyPage, type NavNode } from "@/content/legacy";

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

// Entrada de la sección: celda de texto con número, título, extracto y cuántas páginas trae. Sin fotos repetidas: se escanea rápido.
export function SectionTiles({ nodes, slug, custom = {} }: { nodes: NavNode[]; slug: string; custom?: Record<string, LegacyPage> }) {
  return (
    <ol className="hub-grid">
      {nodes.map((n, i) => {
        const kids = n.children ?? [];
        const total = countBelow(n);
        const href = n.key ? legacyHref(slug, n.key) : n.href;
        const page = n.key ? (getLegacyPage(n.key) ?? custom[n.key] ?? null) : null;
        const text = page ? excerptOf(page, 120).replace(/\*\*/g, "") : "";
        const external = !n.key && /^https?:\/\//.test(n.href ?? "");
        const style = { ["--i" as string]: i % 8 } as CSSProperties;
        const head = (
          <>
            <span className="hub-no" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <h3 className="hub-name">{n.label}</h3>
          </>
        );
        const foot = (
          <span className="hub-foot">
            {total > 0 ? `${total} ${total === 1 ? "página" : "páginas"}` : external ? "Sitio externo" : "Abrir"}
            {external ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
          </span>
        );
        return (
          <li key={`${n.label}-${i}`} style={style}>
            {href ? (
              external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hub-cell">
                  {head}
                  {text && <span className="hub-text">{text}</span>}
                  {foot}
                </a>
              ) : (
                <Link href={href} className="hub-cell">
                  {head}
                  {text && <span className="hub-text">{text}</span>}
                  {foot}
                </Link>
              )
            ) : (
              // Encabezado sin página propia: se muestra como grupo con sus enlaces.
              <div className="hub-cell hub-group">
                {head}
                <ul className="hub-links">
                  {kids.slice(0, 6).map((k) => {
                    const kh = k.key ? legacyHref(slug, k.key) : k.href;
                    return (
                      <li key={k.label}>
                        {kh ? (k.key || kh.startsWith("/") ? <Link href={kh}>{k.label}</Link> : <a href={kh} target="_blank" rel="noopener noreferrer">{k.label}</a>) : <span>{k.label}</span>}
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
