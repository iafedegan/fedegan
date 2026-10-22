import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, CreditCard, FileCheck2, Flag, HandHeart, HelpCircle, Leaf, LineChart, Milk, Megaphone, ShieldCheck, Syringe, Beef } from "lucide-react";
import { Section } from "@/components/ui/Editorial";
import { Spotlight } from "@/components/design/Spotlight";
import { campanas, pagos, tramites, type Acceso, type Campana } from "@/content/accesos";
import { excerptOf, getLegacyPage, getLegacySection, legacyHref } from "@/content/legacy";

const icons = {
  pay: CreditCard,
  bio: Syringe,
  ruv: FileCheck2,
  pqrsd: HelpCircle,
  book: BookOpen,
  chart: LineChart,
  shield: ShieldCheck,
  hands: HandHeart,
  leaf: Leaf,
  meat: Beef,
  milk: Milk,
  flag: Flag,
  mic: Megaphone,
};

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

// Pagos: dos tarjetas grandes, es lo primero que busca quien aporta la cuota.
function PayCard({ a }: { a: Acceso }) {
  const Icon = icons[a.icon];
  return (
    <Wrap to={a.href} external={a.external} className="group block h-full">
      <div className="mx-card mx-lift mx-rise flex h-full flex-col gap-4 !p-6 sm:!p-7" style={acc(a.acc)}>
        <div className="flex items-start justify-between gap-4">
          <span className="mx-icon"><Icon size={24} strokeWidth={1.7} /></span>
          {a.id === "pago" && (
            <Image src="/accesos/pago-pse.webp" alt="Pago en línea PSE, cuota de fomento ganadero y lechero" width={500} height={250} className="h-16 w-auto rounded-[var(--radius-sm)] sm:h-20" />
          )}
        </div>
        <div>
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{a.title}</h3>
          <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{a.text}</p>
        </div>
        <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-[rgb(var(--acc-rgb))] px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#0a1a11] transition-transform group-hover:translate-x-1">
          {a.cta ?? "Ir al servicio"} {a.external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
        </span>
      </div>
    </Wrap>
  );
}

function TramiteTile({ a }: { a: Acceso }) {
  const Icon = icons[a.icon];
  return (
    <li>
      <Wrap to={a.href} external={a.external} className="group block h-full">
        <div className="mx-card mx-lift mx-rise flex h-full items-start gap-3.5 !p-4 sm:!p-5" style={acc(a.acc)}>
          <span className="mx-icon !h-11 !w-11 shrink-0"><Icon size={20} strokeWidth={1.7} /></span>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 font-bold leading-snug text-[var(--text)]">
              {a.title}
              {a.external ? (
                <ArrowUpRight size={14} className="shrink-0 text-[var(--text-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              ) : (
                <ArrowRight size={14} className="shrink-0 text-[var(--text-faint)] transition-transform group-hover:translate-x-1" />
              )}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{a.text}</p>
          </div>
        </div>
      </Wrap>
    </li>
  );
}

/** Pagos y trámites: lo que el portal actual muestra en la columna lateral, ordenado por uso. */
export function AccessHub({ tinted = false }: { tinted?: boolean }) {
  return (
    <Section eyebrow="Acceso directo" title="Pagos, trámites y servicios" intro="Lo más usado por ganaderos y aportantes, a un clic." tinted={tinted}>
      <Spotlight as="div" className="grid gap-4 md:grid-cols-2">
        {pagos.map((a) => (
          <PayCard key={a.id} a={a} />
        ))}
      </Spotlight>
      <Spotlight as="ul" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tramites.map((a) => (
          <TramiteTile key={a.id} a={a} />
        ))}
      </Spotlight>
    </Section>
  );
}

function CampanaCard({ c }: { c: Campana }) {
  return (
    <li className="mb-4 break-inside-avoid">
      <Wrap to={c.href} external={c.external} className="mx-rise group block overflow-hidden rounded-[1.2rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] transition-colors hover:border-[var(--fg-lime-500)]">
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

/** La columna más reciente del presidente de FEDEGÁN y las anteriores. */
export function PresidentColumn() {
  const section = getLegacySection("columna-presidente");
  if (!section || !section.tree.length) return null;
  const [latest, ...older] = section.tree;
  const page = getLegacyPage(latest.key!);
  return (
    <Section eyebrow="Opinión" title="Columna del Presidente">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <figure className="mx-quote mx-rise flex flex-col gap-4">
          <figcaption className="mx-kicker self-start">José Félix Lafaurie Rivera</figcaption>
          <Link href={legacyHref("columna-presidente", latest.key!)} className="group">
            <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)] sm:text-[2rem] sm:leading-[1.15]">
              {latest.label}
            </h3>
          </Link>
          {page && <p className="max-w-2xl leading-relaxed text-[var(--text-muted)]">{excerptOf(page, 260)}</p>}
          <Link href={legacyHref("columna-presidente", latest.key!)} className="inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
            Leer la columna <ArrowRight size={15} />
          </Link>
        </figure>
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
    <div className={`mx-card !p-3 ${className}`}>
      <p className="px-2.5 pb-2 pt-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">Accesos rápidos</p>
      <ul className="flex flex-col">
        {items.map((a) => {
          const Icon = icons[a.icon];
          return (
            <li key={a.id}>
              <Wrap to={a.href} external={a.external} className="group flex items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--fg-lime-400)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]" style={acc(a.acc)}>
                  <Icon size={15} />
                </span>
                {a.title}
              </Wrap>
            </li>
          );
        })}
      </ul>
      <Link href="/accesos" className="mt-1 flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-faint)] transition-colors hover:text-[var(--fg-lime-400)]">
        Ver todos <ArrowRight size={13} />
      </Link>
    </div>
  );
}
