import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NextDeadline } from "@/components/pagos/NextDeadline";
import { Pic } from "./Pic";
import { fechaCorta, two, type HomeData } from "./data";

const MARQUEE = "FEDEGÁN ★ FNG ★ GANADERÍA ★ COLOMBIA ★ ";

// BRUTALISTA — la portada es un afiche: cinta de texto en movimiento, titular gigante, las secciones como filas enormes,
// noticias en bloques de color, la cuota en un bloque rosa y la agenda como boletas.
export function HomeBrutal({ d }: { d: HomeData }) {
  const blocks = ["hr-a", "hr-b", "hr-c"];
  return (
    <div className="hr">
      <div className="hr-marquee" aria-hidden>
        <div className="hr-track">{Array.from({ length: 10 }, (_, i) => <span key={i}>{MARQUEE}</span>)}</div>
      </div>

      <section data-region="hero" className="hr-hero">
        <Container>
          <span className="hr-sticker" aria-hidden>63 años</span>
          <h1>Ganaderos<br />de Colombia</h1>
          <p>La federación que representa a los productores bovinos del país. Aquí se paga la cuota, se consultan las cifras y se encuentra todo lo del gremio.</p>
          <div className="hr-btns">
            <Link href="/pagos">Pagar la cuota →</Link>
            <Link href="/seccion/cifras-del-sector">Cifras del sector →</Link>
            <Link href="/noticias">Noticias →</Link>
          </div>
        </Container>
      </section>

      <section data-region="cards" className="hr-list" aria-label="Secciones del portal">
        <Container>
          <ol>
            {d.secciones.map((s, i) => (
              <li key={s.id} style={{ ["--acc" as string]: s.accent }}>
                {s.external ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hr-row"><span>{two(i + 1)}</span><strong>{s.nombre}</strong><em>{s.rubro}</em><ArrowUpRight aria-hidden /></a>
                ) : (
                  <Link href={s.href} className="hr-row"><span>{two(i + 1)}</span><strong>{s.nombre}</strong><em>{s.rubro}</em><b aria-hidden>→</b></Link>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section data-region="news" className="hr-news">
        <Container>
          <h2><mark>Lo que pasa</mark></h2>
          <div className="hr-blocks">
            {[...(d.lead ? [d.lead] : []), ...d.rest].slice(0, 3).map((n, i) => (
              <Link key={n.slug} href={`/noticias/${n.slug}`} className={`hr-block ${blocks[i % 3]} ${i === 0 ? "hr-big" : ""}`}>
                {n.image && <span className="hr-img"><Pic src={n.image} alt={n.imageAlt ?? ""} sizes="(min-width: 1024px) 33vw, 100vw" /></span>}
                <small>{n.section} · {fechaCorta(n.publishedAt ?? n.date)}</small>
                <strong>{n.title}</strong>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="hr-duo">
        <section className="hr-cuota">
          <h2>La cuota<br />no espera</h2>
          <NextDeadline />
          <Link href="/pagos" className="hr-cta">Pagar ahora →</Link>
        </section>
        <section data-region="cards" className="hr-tickets">
          <h2><mark>Agenda</mark></h2>
          <ul>
            {d.events.slice(0, 4).map((e) => (
              <li key={e.slug}>
                <Link href={`/eventos/${e.slug}`}>
                  <b>{e.day}<small>{e.month}</small></b>
                  <span>{e.title}<em>{e.place}</em></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </div>
  );
}
