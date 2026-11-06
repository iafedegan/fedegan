import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NextDeadline } from "@/components/pagos/NextDeadline";
import { Pic } from "./Pic";
import { fechaCorta, type HomeData } from "./data";

// BENTO — la portada es un tablero de módulos: bienvenida con buscador, noticia principal, cifras, pagos,
// las secciones como fichas con foto y, abajo, agenda, publicaciones y aliados.
export function HomeBento({ d }: { d: HomeData }) {
  return (
    <div className="hb">
      <Container className="hb-grid">
        <section data-region="hero" className="hb-tile hb-hero">
          <p className="hb-kicker">FEDEGÁN · Fondo Nacional del Ganado</p>
          <h1>El gremio ganadero de Colombia, en un solo lugar</h1>
          <p className="hb-lead">Pague la cuota de fomento, consulte las cifras del sector, siga las noticias y encuentre los programas y servicios del gremio.</p>
          <form action="/buscador" method="get" role="search" className="hb-search">
            <Search size={18} aria-hidden />
            <input type="search" name="q" placeholder="¿Qué está buscando?" aria-label="Buscar en el portal" autoComplete="off" />
            <button type="submit">Buscar</button>
          </form>
          <div className="hb-actions">
            <Link href="/pagos">Pagar la cuota</Link>
            <Link href="/seccion/cifras-del-sector">Ver las cifras</Link>
          </div>
        </section>

        {d.lead && (
          <Link data-region="news" href={`/noticias/${d.lead.slug}`} className="hb-tile hb-lead-news">
            {d.lead.image && <Pic src={d.lead.image} alt={d.lead.imageAlt ?? ""} sizes="(min-width: 1024px) 40vw, 100vw" priority />}
            <span className="hb-shade" aria-hidden />
            <span className="hb-over">
              <span className="hb-chip">{d.lead.ultimaHora ? "Última hora" : d.lead.section}</span>
              <strong>{d.lead.title}</strong>
              <span className="hb-go">Leer la nota <ArrowRight size={15} aria-hidden /></span>
            </span>
          </Link>
        )}

        {d.stats.slice(0, 3).map((s) => (
          <div key={s.label} className="hb-tile hb-stat">
            <span className="hb-stat-l">{s.label}</span>
            <b>{s.value}<small>{s.unit}</small></b>
            {s.delta && <span className="hb-delta">{s.delta}</span>}
          </div>
        ))}

        <section className="hb-tile hb-pay">
          <p className="hb-kicker">Zona de pagos</p>
          <NextDeadline />
          <Link href="/pagos" className="hb-btn">Pagar ahora <ArrowRight size={15} aria-hidden /></Link>
        </section>

        {d.secciones.slice(0, 8).map((s, i) => {
          const body = (
            <>
              <Pic src={s.image} alt={s.alt} pos={s.pos} sizes="(min-width: 1024px) 25vw, 50vw" />
              <span className="hb-shade" aria-hidden />
              <span className="hb-over">
                <span className="hb-chip">{s.rubro}</span>
                <strong>{s.nombre}</strong>
              </span>
              <span className="hb-arrow" aria-hidden>{s.external ? <ArrowUpRight size={18} /> : <ArrowRight size={18} />}</span>
            </>
          );
          const cls = `hb-tile hb-scene ${i === 0 ? "hb-w2" : ""}`;
          const style = { ["--acc" as string]: s.accent };
          return s.external ? (
            <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{body}</a>
          ) : (
            <Link key={s.id} href={s.href} className={cls} style={style}>{body}</Link>
          );
        })}

        <section data-region="cards" className="hb-tile hb-list hb-w2">
          <h2>Lo último</h2>
          <ul>
            {d.rest.slice(0, 4).map((n) => (
              <li key={n.slug}>
                <Link href={`/noticias/${n.slug}`}>
                  <span>{n.section} · {fechaCorta(n.publishedAt ?? n.date)}</span>
                  <strong>{n.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/noticias" className="hb-more">Todas las noticias <ArrowRight size={14} aria-hidden /></Link>
        </section>

        <section data-region="cards" className="hb-tile hb-list">
          <h2>Agenda</h2>
          <ul>
            {d.events.slice(0, 3).map((e) => (
              <li key={e.slug}>
                <Link href={`/eventos/${e.slug}`} className="hb-ev">
                  <span className="hb-date"><b>{e.day}</b>{e.month}</span>
                  <strong>{e.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/eventos" className="hb-more">Ver eventos <ArrowRight size={14} aria-hidden /></Link>
        </section>

        <section data-region="cards" className="hb-tile hb-list">
          <h2>Publicaciones</h2>
          <ul>
            {d.pubs.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/publicaciones/${p.slug}`}>
                  <span>{p.type}</span>
                  <strong>{p.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/publicaciones" className="hb-more">Ver publicaciones <ArrowRight size={14} aria-hidden /></Link>
        </section>

        {d.partners.length > 0 && (
          <section className="hb-tile hb-allies hb-w2">
            <h2>Portales aliados</h2>
            <ul>
              {d.partners.slice(0, 6).map((p) => (
                <li key={p.nombre}>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" title={p.nombre}>
                    <span className="hb-logo"><Pic src={p.logo} alt="" sizes="56px" /></span>
                    <small>{p.nombre}</small>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}
