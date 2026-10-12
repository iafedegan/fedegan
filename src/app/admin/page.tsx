import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Plus, Sparkles, Store } from "lucide-react";
import { auth } from "@/auth";
import { readDb } from "@/lib/cms/client";
import { entities } from "@/lib/cms/entities";
import { getPortada } from "@/lib/contexto";
import { AreaChart, Donut } from "@/components/admin/charts";
import { ConfigNotice } from "@/components/admin/ConfigNotice";

export const metadata: Metadata = { title: "Panel del portal", robots: { index: false } };

type Row = Record<string, unknown>;
type Audit = { at: string; actor: string; action: string; entity: string; summary: string | null };

const TZ = "America/Bogota";

export default async function AdminDashboard() {
  const session = await auth();
  const { db, writable } = readDb();

  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const todayLabel = new Intl.DateTimeFormat("es-CO", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(now);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
  const firstName = (session?.user?.name ?? "").split(" ")[0] || "equipo";

  const load = async (table: string, cols: string): Promise<Row[]> => {
    if (!db) return [];
    const { data } = await db.from(table).select(cols);
    return (data ?? []) as unknown as Row[];
  };

  const since = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const [pubs, events, locales, stats, faqs, partners, navItems, portada, auditRes] = await Promise.all([
    load("publications", "published"),
    load("events", "slug,title,kind,place,starts_on,published"),
    load("locales", "status,published"),
    load("stats", "published"),
    load("faqs", "published"),
    load("partners", "published"),
    load("nav_items", "published"),
    getPortada(),
    writable && db
      ? db.from("audit_log").select("at,actor,action,entity,summary").gte("at", since).order("at", { ascending: false }).limit(500)
      : Promise.resolve({ data: [] as Audit[] }),
  ]);
  const audit = (auditRes.data ?? []) as Audit[];

  const tables: Record<string, Row[]> = { locales, cifras: stats, publicaciones: pubs, eventos: events, preguntas: faqs, portales: partners, menu: navItems };
  const all = Object.values(tables).flat();
  const published = all.filter((r) => r.published).length;
  const hidden = all.length - published;

  const pubCount = pubs.filter((r) => r.published).length;
  const upcoming = events.filter((e) => e.published && String(e.starts_on) >= today).sort((a, b) => String(a.starts_on).localeCompare(String(b.starts_on)));
  const openLocales = locales.filter((l) => l.published && l.status === "abierto").length;

  // Actividad por día (últimos 14 días, hora de Bogotá)
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  const days = Array.from({ length: 14 }, (_, i) => new Date(now.getTime() - (13 - i) * 86_400_000));
  const perDay = new Map<string, number>();
  for (const a of audit) {
    const k = fmt.format(new Date(a.at));
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const series = days.map((d) => ({ label: String(Number(fmt.format(d).slice(8))), value: perDay.get(fmt.format(d)) ?? 0 }));
  const changes = audit.length;

  const niceDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="ad-eyebrow">{todayLabel}</p>
          <h1 className="mt-1.5 text-3xl font-bold sm:text-4xl">{greeting}, {firstName}</h1>
          <p className="mt-1.5 text-[#5d6e65]">Así va el portal hoy: contenido, actividad del equipo y lo que viene de CONtexto.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/eventos/nuevo" className="ad-btn ad-btn-ghost"><CalendarDays size={16} /> Nuevo evento</Link>
          <Link href="/admin/publicaciones/nuevo" className="ad-btn ad-btn-primary"><Plus size={16} /> Nueva publicación</Link>
        </div>
      </header>

      {!writable && <ConfigNotice compact />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ad-card-dark ad-rise relative overflow-hidden p-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#a9d1bd]">Cambios · 14 días</p>
          <p className="mt-3 font-[var(--font-display)] text-5xl font-bold">{writable ? changes : "—"}</p>
          <p className="mt-2 text-sm text-[#b9d8c8]">{writable ? "ediciones del equipo en el panel" : "se muestra con la clave de servicio"}</p>
          <Sparkles size={64} strokeWidth={1} className="absolute -bottom-3 -right-2 text-white/10" />
        </div>
        <div className="ad-card ad-rise p-6">
          <div className="flex items-start justify-between">
            <p className="ad-eyebrow">Publicaciones</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7edcf] text-[#8a6d1f]"><FileText size={17} /></span>
          </div>
          <p className="mt-3 font-[var(--font-display)] text-4xl font-bold">{pubCount}</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#eceae0]"><div className="h-full rounded-full bg-[#d8b558]" style={{ width: `${pct(pubCount, pubs.length)}%` }} /></div>
          <p className="mt-2 text-xs text-[#8a978f]">{pubCount} de {pubs.length} visibles en el sitio</p>
        </div>
        <div className="ad-card ad-rise p-6">
          <div className="flex items-start justify-between">
            <p className="ad-eyebrow">Próximos eventos</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f1e7] text-[#146040]"><CalendarDays size={17} /></span>
          </div>
          <p className="mt-3 font-[var(--font-display)] text-4xl font-bold">{upcoming.length}</p>
          <p className="mt-3 text-sm text-[#5d6e65]">{upcoming[0] ? `Próximo: ${niceDate(String(upcoming[0].starts_on))}` : "Sin eventos programados"}</p>
        </div>
        <div className="ad-card ad-rise p-6">
          <div className="flex items-start justify-between">
            <p className="ad-eyebrow">Locales abiertos</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcefe9] text-[#14665a]"><Store size={17} /></span>
          </div>
          <p className="mt-3 font-[var(--font-display)] text-4xl font-bold">{openLocales}</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#eceae0]"><div className="h-full rounded-full bg-[#165a43]" style={{ width: `${pct(openLocales, locales.length)}%` }} /></div>
          <p className="mt-2 text-xs text-[#8a978f]">{openLocales} de {locales.length} locales del directorio</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="ad-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ad-eyebrow">Tendencia</p>
              <h2 className="mt-1 text-xl font-bold">Actividad del equipo por día</h2>
            </div>
            <span className="text-xs text-[#8a978f]">Últimos 14 días</span>
          </div>
          <div className="mt-4">
            {writable ? <AreaChart data={series} /> : <p className="py-16 text-center text-sm text-[#8a978f]">El historial de actividad requiere la clave de servicio.</p>}
          </div>
        </div>
        <div className="ad-card p-6">
          <p className="ad-eyebrow">Contenido</p>
          <h2 className="mt-1 text-xl font-bold">Estado de los elementos</h2>
          <div className="mt-3">
            <Donut
              segments={[{ label: "Publicados", value: published, color: "#165a43" }, { label: "Ocultos", value: hidden, color: "#d8b558" }]}
              centerValue={String(all.length)}
              centerLabel="ELEMENTOS"
            />
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#165a43]" />Publicados</span><strong>{published}</strong></li>
            <li className="flex items-center justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#d8b558]" />Ocultos</span><strong>{hidden}</strong></li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="ad-card flex flex-col p-6">
          <p className="ad-eyebrow">Desde CONtexto</p>
          <h2 className="mt-1 text-xl font-bold">Noticias de portada</h2>
          <ul className="mt-4 flex flex-1 flex-col divide-y divide-[#eceae0]">
            {portada.length === 0 && <li className="py-6 text-sm text-[#8a978f]">No se pudieron cargar las noticias de CONtexto.</li>}
            {portada.slice(0, 4).map((n) => (
              <li key={n.slug} className="py-3">
                <Link href={`/noticias/${n.slug}`} target="_blank" className="font-semibold leading-snug hover:text-[#165a43]">{n.title}</Link>
                <p className="mt-0.5 text-xs text-[#8a978f]">{n.section} · {n.date}</p>
              </li>
            ))}
          </ul>
          <a href="https://contexto-olive.vercel.app/panel" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#165a43]">
            Editar en CONtexto <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="ad-card flex flex-col p-6">
          <p className="ad-eyebrow">Agenda</p>
          <h2 className="mt-1 text-xl font-bold">Próximos eventos</h2>
          <ul className="mt-4 flex flex-1 flex-col divide-y divide-[#eceae0]">
            {upcoming.length === 0 && <li className="py-6 text-sm text-[#8a978f]">No hay eventos próximos.</li>}
            {upcoming.slice(0, 4).map((e) => (
              <li key={String(e.slug)} className="flex items-center gap-3 py-3">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#e8f0eb] text-[#165a43]">
                  <span className="text-[0.6rem] font-bold uppercase">{niceDate(String(e.starts_on)).split(" ")[1]}</span>
                  <span className="font-[var(--font-display)] text-lg font-bold leading-none">{niceDate(String(e.starts_on)).split(" ")[0]}</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{String(e.title)}</p>
                  <p className="text-xs text-[#8a978f]">{String(e.kind)} · {String(e.place)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/eventos" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#165a43]">Administrar eventos <ArrowUpRight size={15} /></Link>
        </div>

        <div className="ad-card flex flex-col p-6">
          <p className="ad-eyebrow">Auditoría</p>
          <h2 className="mt-1 text-xl font-bold">Actividad reciente</h2>
          <ul className="mt-4 flex flex-1 flex-col divide-y divide-[#eceae0]">
            {(!writable || audit.length === 0) && <li className="py-6 text-sm text-[#8a978f]">{writable ? "Todavía no hay cambios registrados." : "Disponible con la clave de servicio."}</li>}
            {audit.slice(0, 5).map((a, i) => (
              <li key={i} className="py-3 text-sm">
                <p><strong className="font-semibold capitalize">{a.action}</strong> · {a.entity}{a.summary ? ` · ${a.summary}` : ""}</p>
                <p className="mt-0.5 text-xs text-[#8a978f]">{a.actor} · {new Date(a.at).toLocaleString("es-CO", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" })}</p>
              </li>
            ))}
          </ul>
          <Link href="/admin/actividad" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#165a43]">Ver todo <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section>
        <p className="ad-eyebrow mb-3">Contenido editable</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {entities.map((e) => (
            <Link key={e.key} href={`/admin/${e.key}`} className="ad-card group flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-[#d8b558]">
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.plural}</p>
                <p className="text-xs text-[#8a978f]">{tables[e.key]?.length ?? 0} {tables[e.key]?.length === 1 ? "elemento" : "elementos"}</p>
              </div>
              <ArrowUpRight size={18} className="shrink-0 text-[#8a978f] transition-colors group-hover:text-[#165a43]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
