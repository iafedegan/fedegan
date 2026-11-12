import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { HubExpand, type HubLink } from "@/components/legacy/HubExpand";
import { excerptOf, getLegacyPage, legacyHref, type LegacyBlock, type LegacyPage, type NavNode } from "@/content/legacy";
import { enlaceSeguro, esExterno } from "@/components/legacy/comun";

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

// Una ficha lleva a lo sumo MAX_ENLACES páginas por lista; si hay más, el último enlace abre la página de la rama (el HTML no puede crecer sin límite).
const MAX_ENLACES = 40;
const toLinks = (nodes: NavNode[], slug: string, verTodas?: string): HubLink[] => {
  const lista: HubLink[] = nodes.slice(0, MAX_ENLACES).map((n) => {
    const href = n.key ? legacyHref(slug, n.key) : n.href;
    return { label: n.label, href, external: !n.key && /^https?:\/\//.test(n.href ?? ""), children: n.children ? toLinks(n.children, slug, href) : undefined };
  });
  if (nodes.length > MAX_ENLACES && verTodas) lista.push({ label: `Ver las ${nodes.length} páginas →`, href: verTodas });
  return lista;
};

// Entrada de la sección: celda de texto con número, título, extracto y cuántas páginas trae. Sin fotos repetidas: se escanea rápido.
export type Ficha = { titulo: string; texto: string; enlace: string };

/** Separa las fichas de tema que se armaron en el constructor del resto del contenido de la página. */
export function sacarFichas(blocks: LegacyBlock[]): { fichas: Ficha[]; resto: LegacyBlock[] } {
  const fichas: Ficha[] = [];
  const resto: LegacyBlock[] = [];
  for (const b of blocks) {
    const d = b.t === "ficha" ? b.data : undefined;
    const titulo = typeof d?.titulo === "string" ? d.titulo.trim() : "";
    const enlace = typeof d?.enlace === "string" ? d.enlace : "";
    if (b.t === "ficha") {
      if (titulo && enlaceSeguro(enlace)) fichas.push({ titulo, texto: typeof d?.texto === "string" ? d.texto : "", enlace });
    } else resto.push(b);
  }
  return { fichas, resto };
}

// Una ficha armada a mano: igual que las automáticas, con su título, descripción y enlace.
export function FichaExtra({ ficha, numero }: { ficha: Ficha; numero: number }) {
  const externo = esExterno(ficha.enlace);
  const cuerpo = (
    <>
      <span className="hub-no" aria-hidden>{String(numero).padStart(2, "0")}</span>
      <h3 className="hub-name">{ficha.titulo}</h3>
      {ficha.texto && <span className="hub-text">{ficha.texto}</span>}
      <span className="hub-foot">
        {externo ? "Sitio externo" : "Abrir"}
        {externo ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
      </span>
    </>
  );
  const style = { ["--i" as string]: (numero - 1) % 8 } as CSSProperties;
  return (
    <li style={style}>
      {externo ? (
        <a href={ficha.enlace} target="_blank" rel="noopener noreferrer" className="hub-cell">{cuerpo}</a>
      ) : (
        <Link href={ficha.enlace} className="hub-cell">{cuerpo}</Link>
      )}
    </li>
  );
}

export function SectionTiles({ nodes, slug, custom = {}, extras = [] }: { nodes: NavNode[]; slug: string; custom?: Record<string, LegacyPage>; extras?: Ficha[] }) {
  return (
    <ol className="hub-grid">
      {nodes.map((n, i) => {
        const kids = n.children ?? [];
        const total = countBelow(n);
        const href = n.key ? legacyHref(slug, n.key) : n.href;
        const page = n.key ? (getLegacyPage(n.key) ?? custom[n.key] ?? null) : null;
        const text = page ? excerptOf(page, 170).replace(/\*\*/g, "") : "";
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
            {total > 0 && !external ? (
              <HubExpand head={head} text={text} count={total} href={href} items={toLinks(kids, slug, href)} />
            ) : href ? (
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
      {extras.map((f, j) => (
        <FichaExtra key={`extra-${j}`} ficha={f} numero={nodes.length + j + 1} />
      ))}
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
