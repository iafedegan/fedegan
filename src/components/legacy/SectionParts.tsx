import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Beef,
  BookOpen,
  FlaskConical,
  Globe,
  Handshake,
  Layers,
  Leaf,
  Mail,
  Megaphone,
  Milk,
  Scale,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { excerptOf, getLegacyPage, legacyHref, type NavNode } from "@/content/legacy";

// Pictograma según el tema del título: ayuda a reconocer cada rama sin leer.
const ICONS: [RegExp, LucideIcon][] = [
  [/norma|ley|decreto|resoluci|c[oó]digo|jur[ií]d|legal/i, Scale],
  [/cifra|estad[ií]stic|inventario|precio|dato|indicador/i, BarChart3],
  [/sanidad|biol[oó]g|vacun|aftosa|salud|brucel/i, Stethoscope],
  [/ciencia|tecnolog|investig|laborator|innovaci/i, FlaskConical],
  [/leche|l[aá]cte/i, Milk],
  [/carne|bovin|ganado|cadena|fondo nacional/i, Beef],
  [/exporta|mercado|internacional|comercio/i, Globe],
  [/presupuesto|financ|contable|pago|cuota|recaudo|tarifa/i, Wallet],
  [/transparen|gobierno|control|auditor|calidad|gesti[oó]n|pol[ií]tica/i, ShieldCheck],
  [/publicaci|libro|cartilla|revista|bolet[ií]n|manual/i, BookOpen],
  [/prensa|comunicad|carta|columna|noticia/i, Megaphone],
  [/ambient|sostenib|verde|carbono|sello/i, Leaf],
  [/alianza|convenio|contrato|social|fundag[aá]n|solidar/i, Handshake],
  [/servicio|tr[aá]mite|atenci[oó]n|pqrsd|contacto/i, Mail],
  [/gremi|fedeg[aá]n|c[aá]mara|asamblea|junta|directiv|congreso|regional/i, Users],
];
export const topicIcon = (label: string): LucideIcon => ICONS.find(([re]) => re.test(label))?.[1] ?? Layers;

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

// Entrada de la sección en formato ficha: número, pictograma, título, extracto y avance de lo que hay dentro.
export function SectionTiles({ nodes, slug }: { nodes: NavNode[]; slug: string }) {
  return (
    <ol className="hub-tiles">
      {nodes.map((n, i) => {
        const Icon = topicIcon(n.label);
        const kids = n.children ?? [];
        const total = countBelow(n);
        const href = n.key ? legacyHref(slug, n.key) : n.href;
        const page = n.key ? getLegacyPage(n.key) : null;
        const text = page ? excerptOf(page, 120).replace(/\*\*/g, "") : "";
        const external = !n.key && Boolean(n.href);
        const inner = (
          <>
            <span className="hub-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <span className="hub-ico" aria-hidden><Icon size={20} strokeWidth={1.75} /></span>
            <h3 className="hub-name">{n.label}</h3>
            {text && <p className="hub-text">{text}</p>}
            {kids.length > 0 && (
              <ul className="hub-kids" aria-label={`Dentro de ${n.label}`}>
                {kids.slice(0, 3).map((k) => (
                  <li key={k.label}>{k.label}</li>
                ))}
                {kids.length > 3 && <li className="hub-more">+{kids.length - 3} más</li>}
              </ul>
            )}
            <span className="hub-foot">
              {total > 0 ? `${total} ${total === 1 ? "página" : "páginas"}` : external ? "Sitio externo" : "Abrir"}
              {external ? <ArrowUpRight size={15} aria-hidden /> : <ArrowRight size={15} aria-hidden />}
            </span>
          </>
        );
        return (
          <li key={`${n.label}-${i}`}>
            {href ? (
              external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hub-tile">{inner}</a>
              ) : (
                <Link href={href} className="hub-tile">{inner}</Link>
              )
            ) : (
              // Encabezado sin página propia: se muestra como grupo con sus enlaces.
              <div className="hub-tile hub-group">
                <span className="hub-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="hub-ico" aria-hidden><Icon size={20} strokeWidth={1.75} /></span>
                <h3 className="hub-name">{n.label}</h3>
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
