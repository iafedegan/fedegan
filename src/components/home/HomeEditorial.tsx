import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NextDeadline } from "@/components/pagos/NextDeadline";
import { PresidentQuote } from "@/components/blocks/Accesos";
import { Pic } from "./Pic";
import { fechaCorta, two, type HomeData } from "./data";

// EDITORIAL — la portada es la primera plana de un periódico: nota principal con columna «Lo último»,
// «En esta edición» en columnas con filetes, columna del presidente junto a la agenda, cifras y avisos.
export function HomeEditorial({ d }: { d: HomeData }) {
  return (
    <div className="he">
      <Container>
        <section data-region="news" className="he-front">
          {d.lead ? (
            <article className="he-lead">
              <p className="he-kicker">{d.lead.ultimaHora ? "Última hora" : d.lead.section}</p>
              <h1><Link href={`/noticias/${d.lead.slug}`}>{d.lead.title}</Link></h1>
              {d.lead.dek && <p className="he-dek">{d.lead.dek}</p>}
              {d.lead.image && (
                <Link href={`/noticias/${d.lead.slug}`} className="he-photo" aria-hidden tabIndex={-1}>
                  <Pic src={d.lead.image} alt={d.lead.imageAlt ?? ""} sizes="(min-width: 1024px) 60vw, 100vw" priority />
                </Link>
              )}
              <p className="he-by">Por {d.lead.author || "CONtexto Ganadero"} · {fechaCorta(d.lead.publishedAt ?? d.lead.date)}</p>
            </article>
          ) : (
            <article className="he-lead">
              <p className="he-kicker">FEDEGÁN · FNG</p>
              <h1>Federación Colombiana de Ganaderos</h1>
              <p className="he-dek">Noticias, programas, publicaciones, servicios y cifras del sector ganadero colombiano.</p>
            </article>
          )}
          <aside className="he-side" aria-label="Lo último">
            <h2>Lo último</h2>
            <ol>
              {d.rest.slice(0, 5).map((n) => (
                <li key={n.slug}>
                  <span>{n.section}</span>
                  <Link href={`/noticias/${n.slug}`}>{n.title}</Link>
                  <time>{fechaCorta(n.publishedAt ?? n.date)}</time>
                </li>
              ))}
            </ol>
            <Link href="/noticias" className="he-more">Todas las noticias <ArrowRight size={14} aria-hidden /></Link>
          </aside>
        </section>

        <section data-region="cards" className="he-edition">
          <h2 className="he-head"><span>En esta edición</span></h2>
          <div className="he-cols">
            {d.secciones.slice(0, 6).map((s, i) => (
              <article key={s.id}>
                <p className="he-kicker">{two(i + 1)} · {s.rubro}</p>
                <h3><Link href={s.href}>{s.nombre}</Link></h3>
                <p>{s.descripcion}</p>
                <Link href={s.href} className="he-more">Entrar <ArrowRight size={14} aria-hidden /></Link>
              </article>
            ))}
          </div>
        </section>

        <section data-region="cards" className="he-split">
          <div><PresidentQuote /></div>
          <div className="he-agenda">
            <h2 className="he-head"><span>Agenda</span></h2>
            <ul>
              {d.events.slice(0, 4).map((e) => (
                <li key={e.slug}>
                  <time><b>{e.day}</b> {e.month}</time>
                  <Link href={`/eventos/${e.slug}`}>{e.title}</Link>
                  <span>{e.place}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {d.stats.length > 0 && (
          <section className="he-figures" aria-label="Cifras del sector">
            {d.stats.slice(0, 4).map((s) => (
              <div key={s.label}>
                <b>{s.value}<small>{s.unit}</small></b>
                <span>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        <section data-region="cards" className="he-shelf">
          <h2 className="he-head"><span>Publicaciones</span></h2>
          <ul>
            {d.pubs.slice(0, 4).map((p) => (
              <li key={p.slug}>
                <Link href={`/publicaciones/${p.slug}`}>
                  <span className="he-cover">{p.coverImage ? <Pic src={p.coverImage} sizes="200px" /> : <i>{p.type}</i>}</span>
                  <small>{p.type}</small>
                  <strong>{p.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="he-ads" aria-label="Avisos">
          <div className="he-ad">
            <p className="he-kicker">Aviso · Recaudo de la cuota</p>
            <NextDeadline />
            <Link href="/pagos" className="he-more">Zona de pagos <ArrowRight size={14} aria-hidden /></Link>
          </div>
          {d.aliados.slice(0, 2).map((a) => (
            <a key={a.id} href={a.href} target="_blank" rel="noopener noreferrer" className="he-ad">
              <p className="he-kicker">Portal aliado</p>
              <strong>{a.nombre}</strong>
              <span>{a.descripcion}</span>
            </a>
          ))}
        </section>
      </Container>
    </div>
  );
}
