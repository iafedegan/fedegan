import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CreditCard, FileSearch, LineChart, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NextDeadline } from "@/components/pagos/NextDeadline";
import { Pic } from "./Pic";
import { fechaCorta, type HomeData } from "./data";

// AURORA — la portada es un panel de control: búsqueda con acciones rápidas, indicadores, las secciones en una fila
// que se desliza y, abajo, una línea de tiempo de noticias junto a pagos y agenda.
export function HomeAurora({ d }: { d: HomeData }) {
  const rapidas = [
    { href: "/pagos", label: "Pagar la cuota", icon: CreditCard },
    { href: "/seccion/cifras-del-sector", label: "Observatorio", icon: LineChart },
    { href: "https://sagari.fedegan-fng.org.co/#/cnl1", label: "Consulta RUV", icon: FileSearch, ext: true },
    { href: "/eventos", label: "Agenda", icon: CalendarDays },
  ];
  return (
    <div className="ha">
      <section data-region="hero" className="ha-hero">
        <Container>
          <p className="ha-chip"><i aria-hidden /> FEDEGÁN · FNG · Portal del gremio</p>
          <h1>El ecosistema digital de la ganadería colombiana</h1>
          <p className="ha-sub">Pagos, cifras, noticias, programas y servicios del gremio, en un solo panel.</p>
          <form action="/buscador" method="get" role="search" className="ha-cmd">
            <Search size={18} aria-hidden />
            <input type="search" name="q" placeholder="Busque una norma, una publicación, un servicio…" aria-label="Buscar en el portal" autoComplete="off" />
            <kbd>/</kbd>
            <button type="submit">Buscar</button>
          </form>
          <ul className="ha-quick">
            {rapidas.map((r) => (
              <li key={r.label}>
                {r.ext ? (
                  <a href={r.href} target="_blank" rel="noopener noreferrer"><r.icon size={16} aria-hidden /> {r.label} <ArrowUpRight size={13} aria-hidden /></a>
                ) : (
                  <Link href={r.href}><r.icon size={16} aria-hidden /> {r.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {d.stats.length > 0 && (
        <section aria-label="Indicadores del sector">
          <Container className="ha-kpis">
            {d.stats.slice(0, 4).map((s) => (
              <div key={s.label} className="ha-kpi">
                <span>{s.label}</span>
                <b>{s.value}<small>{s.unit}</small></b>
                {s.delta && <em>{s.delta}</em>}
              </div>
            ))}
          </Container>
        </section>
      )}

      <section data-region="cards" className="ha-explore">
        <Container>
          <div className="ha-head"><h2>Explorar</h2><span>Deslice para ver todas las secciones</span></div>
        </Container>
        <ul className="ha-scroller">
          {d.secciones.map((s) => {
            const body = (
              <>
                <Pic src={s.image} alt={s.alt} pos={s.pos} sizes="320px" />
                <span className="ha-glass">
                  <small>{s.rubro}</small>
                  <strong>{s.nombre}</strong>
                  <span>{s.descripcion}</span>
                </span>
              </>
            );
            const style = { ["--acc" as string]: s.accent };
            return (
              <li key={s.id} style={style}>
                {s.external ? <a href={s.href} target="_blank" rel="noopener noreferrer">{body}</a> : <Link href={s.href}>{body}</Link>}
              </li>
            );
          })}
        </ul>
      </section>

      <Container className="ha-feed">
        <section data-region="news" aria-label="Noticias">
          <div className="ha-head"><h2>Actividad reciente</h2><Link href="/noticias">Todas las noticias <ArrowRight size={14} aria-hidden /></Link></div>
          <ol className="ha-timeline">
            {[...(d.lead ? [d.lead] : []), ...d.rest].slice(0, 6).map((n) => (
              <li key={n.slug}>
                <time>{fechaCorta(n.publishedAt ?? n.date)}</time>
                <Link href={`/noticias/${n.slug}`}>
                  <small>{n.section}</small>
                  <strong>{n.title}</strong>
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <aside className="ha-side">
          <section className="ha-widget">
            <p className="ha-wk">Zona de pagos</p>
            <NextDeadline />
            <Link href="/pagos" className="ha-btn">Ir a pagar <ArrowRight size={15} aria-hidden /></Link>
          </section>
          <section data-region="cards" className="ha-widget">
            <p className="ha-wk">Agenda</p>
            <ul>
              {d.events.slice(0, 3).map((e) => (
                <li key={e.slug}><Link href={`/eventos/${e.slug}`}><b>{e.day} {e.month}</b><span>{e.title}</span></Link></li>
              ))}
            </ul>
          </section>
        </aside>
      </Container>
    </div>
  );
}
