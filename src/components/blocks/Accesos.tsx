import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Editorial";
import { Pictogram } from "@/components/ui/Pictogram";
import { WaveCard, type WaveAccent } from "@/components/ui/WaveCard";
import { ScrollRail } from "@/components/design/ScrollRail";
import { campanas, gruposAvisos, pagos, tramites, type Campana } from "@/content/accesos";
import { excerptOf, getLegacyPage, getLegacySection, legacyHref } from "@/content/legacy";

const WAVES: WaveAccent[] = ["esmeralda", "oro", "terracota", "turquesa"];

const acc = (v: string) => ({ ["--acc-rgb" as string]: v }) as CSSProperties;

function Wrap({ to, external, className, children }: { to: string; external?: boolean; className?: string; children: ReactNode }) {
  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={to} className={className}>
      {children}
    </Link>
  );
}

/** Pagos y trámites: lo que el portal actual muestra en la columna lateral, ordenado por uso. */
export function AccessHub({ tinted = false }: { tinted?: boolean }) {
  return (
    <Section eyebrow="Acceso directo" title="Pagos, trámites y servicios" intro="Lo más usado por ganaderos y aportantes, a un clic." tinted={tinted}>
      <Link href="/pagos" className="group mb-2 flex flex-col items-start justify-between gap-4 rounded-[0.9rem] border border-[var(--border-strong)] border-l-[3px] border-l-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-6 transition-colors hover:border-[var(--fg-lime-500)] sm:flex-row sm:items-center sm:p-7">
        <span className="flex items-center gap-5">
          <span className="text-[var(--fg-lime-400)]"><Pictogram name="pago" size={46} /></span>
          <span>
            <span className="block font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Zona de pagos</span>
            <span className="mt-0.5 block text-[var(--text-muted)]">Cuota de fomento (leche y carne), recaudo biológico, fechas límite y guía PSE.</span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
          Entrar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tramites.map((a, i) => (
          <li key={a.id}>
            <WaveCard href={a.href} external={a.external} accent={WAVES[i % WAVES.length]} icon={a.icon} title={a.title} text={a.text} cta={a.cta ?? "Ir al servicio"} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// Aviso: ficha vertical de tamaño fijo; el cartel completo se abre al hacer clic.
function AvisoTile({ c, as: Tag = "li" }: { c: Campana; as?: "li" | "div" }) {
  return (
    <Tag>
      <Wrap to={c.href} external={c.external} className="group relative block aspect-[4/5] overflow-hidden rounded-[0.9rem] border border-[var(--border-strong)] bg-[var(--bg-sunken)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1 hover:border-[var(--fg-lime-500)] hover:shadow-[0_26px_44px_-28px_rgba(0,0,0,0.85)]">
        <Image src={c.image} alt={c.alt} fill unoptimized sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover object-top transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.05]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[rgba(6,16,11,0.94)] via-[rgba(6,16,11,0.6)] to-transparent" />
        {c.ad && <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">Publicidad</span>}
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
          {c.external ? <ArrowUpRight size={15} /> : <ArrowRight size={15} />}
        </span>
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-400)]">{c.kicker}</span>
          <span className="mt-1 block font-[var(--font-display)] text-lg font-bold leading-snug text-white">{c.title}</span>
        </span>
      </Wrap>
    </Tag>
  );
}

/** Portada: carrusel de avisos con fichas del mismo tamaño; se desliza con los botones o con el dedo. */
export function CampaignWall() {
  return (
    <Section eyebrow="Avisos" title="Convocatorias y comunicados">
      <ScrollRail label="Avisos" autoplay>
        {campanas.map((c) => (
          <AvisoTile key={c.id} c={c} as="div" />
        ))}
      </ScrollRail>
      <Link href="/avisos" className="group mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
        Ver los avisos por tema <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </Section>
  );
}

/** Página de avisos: agrupados por tema, cada grupo con fichas iguales. */
export function AvisosGrouped() {
  return (
    <>
      {gruposAvisos.map((g, i) => (
        <Section key={g.id} eyebrow="Avisos" title={g.titulo} intro={g.texto} tinted={i % 2 === 1}>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {campanas.filter((c) => c.group === g.id).map((c) => (
              <AvisoTile key={c.id} c={c} />
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}

/** La columna más reciente del presidente de FEDEGÁN. */
export function PresidentQuote() {
  const section = getLegacySection("columna-presidente");
  if (!section || !section.tree.length) return null;
  const latest = section.tree[0];
  const page = getLegacyPage(latest.key!);
  return (
    <figure className="mx-quote mx-rise flex h-full flex-col gap-4">
      <figcaption className="mx-kicker self-start">José Félix Lafaurie Rivera</figcaption>
      <Link href={legacyHref("columna-presidente", latest.key!)} className="group">
        <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold leading-snug text-[var(--text)] sm:text-[2rem] sm:leading-[1.15]">
          <span className="lnk">{latest.label}</span>
        </h3>
      </Link>
      {page && <p className="max-w-2xl leading-relaxed text-[var(--text-muted)]">{excerptOf(page, 260)}</p>}
      <Link href={legacyHref("columna-presidente", latest.key!)} className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
        Leer la columna <ArrowRight size={15} />
      </Link>
    </figure>
  );
}

/** La columna más reciente del presidente de FEDEGÁN y las anteriores. */
export function PresidentColumn() {
  const section = getLegacySection("columna-presidente");
  if (!section || !section.tree.length) return null;
  const older = section.tree.slice(1);
  return (
    <Section eyebrow="Opinión" title="Columna del Presidente">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <PresidentQuote />
        <div className="mx-card mx-rise !p-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">Columnas anteriores</p>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {older.slice(0, 5).map((n) => (
              <li key={n.key}>
                <Link href={legacyHref("columna-presidente", n.key!)} className="group flex items-start justify-between gap-3 py-3 text-sm font-semibold leading-snug text-[var(--text)] transition-colors hover:text-[var(--fg-lime-400)]">
                  {n.label}
                  <ArrowRight size={14} className="mt-0.5 shrink-0 text-[var(--text-faint)] transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/seccion/columna-presidente" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--fg-lime-400)]">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/** Los tres accesos que la columna lateral del portal actual repite en todas las páginas. */
export function QuickRail({ className = "" }: { className?: string }) {
  const items = [pagos[0], tramites.find((t) => t.id === "pqrsd")!, tramites.find((t) => t.id === "ruv")!];
  return (
    <div className={`rounded-[0.9rem] border border-[var(--border-strong)] border-t-2 border-t-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-3 ${className}`}>
      <p className="px-2.5 pb-2 pt-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">Accesos rápidos</p>
      <ul className="flex flex-col">
        {items.map((a) => (
          <li key={a.id}>
            <Wrap to={a.href} external={a.external} className="group flex items-center gap-3 border-t border-[var(--border)] px-2.5 py-2.5 font-[var(--font-display)] text-[1.02rem] font-bold text-[var(--text)] transition-colors hover:text-[var(--fg-lime-400)]">
              <span style={acc(a.acc)} className="text-[rgb(var(--acc-rgb))]"><Pictogram name={a.icon} size={26} /></span>
              {a.title}
            </Wrap>
          </li>
        ))}
      </ul>
      <Link href="/accesos" className="flex items-center gap-1.5 border-t border-[var(--border)] px-2.5 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)] transition-colors hover:text-[var(--fg-lime-400)]">
        Ver todos <ArrowRight size={13} />
      </Link>
    </div>
  );
}
