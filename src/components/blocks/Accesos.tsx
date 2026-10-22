import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Editorial";
import { Pictogram } from "@/components/ui/Pictogram";
import { campanas, pagos, tramites, type Acceso, type Campana } from "@/content/accesos";
import { excerptOf, getLegacyPage, getLegacySection, legacyHref } from "@/content/legacy";

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

function TramiteRow({ a }: { a: Acceso }) {
  return (
    <li>
      <Wrap to={a.href} external={a.external} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-[var(--border)] px-1 py-5 transition-colors hover:bg-[rgba(216,181,88,0.05)] sm:grid-cols-[3.5rem_1fr_auto]" >
        <span style={acc(a.acc)} className="flex justify-center text-[rgb(var(--acc-rgb))]">
          <Pictogram name={a.icon} size={38} />
        </span>
        <span className="min-w-0">
          <span className="block font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{a.title}</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-[var(--text-muted)]">{a.text}</span>
        </span>
        <span className="text-[var(--text-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--fg-lime-400)]">
          {a.external ? <ArrowUpRight size={20} /> : <ArrowRight size={20} />}
        </span>
      </Wrap>
    </li>
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
      <ul className="mt-9 grid gap-x-14 border-t border-[var(--border-strong)] lg:grid-cols-2">
        {tramites.map((a) => (
          <TramiteRow key={a.id} a={a} />
        ))}
      </ul>
    </Section>
  );
}

function CampanaCard({ c }: { c: Campana }) {
  return (
    <li className="mb-4 break-inside-avoid">
      <Wrap to={c.href} external={c.external} className="mx-rise group block overflow-hidden rounded-[0.75rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] transition-colors hover:border-[var(--fg-lime-500)]">
        <div className="relative w-full overflow-hidden bg-[var(--bg-muted)]" style={{ aspectRatio: c.ratio }}>
          <Image
            src={c.image}
            alt={c.alt}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.04]"
          />
          {c.ad && (
            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">Publicidad</span>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">{c.kicker}</p>
          <h3 className="mt-1 flex items-start justify-between gap-2 text-sm font-bold leading-snug text-[var(--text)]">
            {c.title}
            {c.external ? <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[var(--text-faint)]" /> : <ArrowRight size={14} className="mt-0.5 shrink-0 text-[var(--text-faint)]" />}
          </h3>
        </div>
      </Wrap>
    </li>
  );
}

/** Campañas, avisos y convocatorias (los banners de la columna lateral del portal actual). */
export function CampaignWall({ limit, all = false }: { limit?: number; all?: boolean }) {
  const list = limit ? campanas.slice(0, limit) : campanas;
  return (
    <Section eyebrow="Avisos y campañas" title="Convocatorias, comunicados y aliados">
      <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {list.map((c) => (
          <CampanaCard key={c.id} c={c} />
        ))}
      </ul>
      {!all && (
        <Link href="/accesos" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:text-[var(--text)]">
          Ver todos los accesos y avisos <ArrowRight size={15} />
        </Link>
      )}
    </Section>
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
