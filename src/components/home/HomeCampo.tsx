import Link from "next/link";
import { ArrowRight, Droplets, FileSearch, LineChart, Newspaper } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NextDeadline } from "@/components/pagos/NextDeadline";
import { PresidentQuote } from "@/components/blocks/Accesos";
import { Pic } from "./Pic";
import { fechaCorta, type HomeData } from "./data";

const Ola = ({ flip = false }: { flip?: boolean }) => (
  <svg className={`hc-wave ${flip ? "hc-wave-b" : ""}`} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
    <path d="M0 40 C 180 90 360 0 540 30 S 900 90 1080 40 S 1320 10 1440 40 V90 H0 Z" />
  </svg>
);

// CAMPO — la portada cuenta el día de un ganadero: bienvenida con foto en arco, «el camino» en cuatro pasos,
// las secciones como filas alternadas con fotos en arco, noticias escalonadas y ondas entre bloques.
export function HomeCampo({ d }: { d: HomeData }) {
  const foto = d.lead?.image ?? d.secciones[0]?.image ?? "/headers/campo.jpg";
  const pasos = [
    { href: "/pagos", titulo: "Pague su cuota", texto: "Cuota de fomento y planilla, en línea.", icon: Droplets },
    { href: "https://sagari.fedegan-fng.org.co/#/cnl1", titulo: "Consulte su vacunación", texto: "Registro Único de Vacunación.", icon: FileSearch, ext: true },
    { href: "/seccion/cifras-del-sector", titulo: "Mire las cifras", texto: "Precios, inventario y mercado.", icon: LineChart },
    { href: "/noticias", titulo: "Entérese", texto: "Noticias del sector, cada día.", icon: Newspaper },
  ];
  return (
    <div className="hc">
      <section data-region="hero" className="hc-hero">
        <Container className="hc-hero-in">
          <div className="hc-hero-text">
            <p className="hc-kicker">Federación Colombiana de Ganaderos</p>
            <h1>Del campo, para el campo</h1>
            <p>Todo lo que el ganadero necesita está aquí: pagos, vacunación, cifras, programas y noticias del sector.</p>
            <div className="hc-btns">
              <Link href="/pagos" className="hc-btn">Pagar la cuota <ArrowRight size={16} aria-hidden /></Link>
              <Link href="/quienes-somos" className="hc-btn hc-ghost">Conozca el gremio</Link>
            </div>
          </div>
          <div className="hc-arch">
            <Pic src={foto} alt={d.lead?.imageAlt ?? ""} sizes="(min-width: 1024px) 40vw, 90vw" priority />
            {d.stats[0] && <span className="hc-badge"><b>{d.stats[0].value}{d.stats[0].unit}</b>{d.stats[0].label}</span>}
          </div>
        </Container>
      </section>
      <Ola />

      <section className="hc-path">
        <Container>
          <h2>El camino del ganadero</h2>
          <ol>
            {pasos.map((p, i) => (
              <li key={p.titulo}>
                {p.ext ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer"><span className="hc-step"><p.icon size={26} aria-hidden /></span><small>Paso {i + 1}</small><strong>{p.titulo}</strong><span>{p.texto}</span></a>
                ) : (
                  <Link href={p.href}><span className="hc-step"><p.icon size={26} aria-hidden /></span><small>Paso {i + 1}</small><strong>{p.titulo}</strong><span>{p.texto}</span></Link>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section data-region="cards" className="hc-scenes">
        <Container>
          <h2>Lo que hace el gremio</h2>
          {d.secciones.slice(0, 5).map((s) => (
            <article key={s.id} className="hc-scene">
              <Link href={s.href} className="hc-scene-img"><Pic src={s.image} alt={s.alt} pos={s.pos} sizes="(min-width: 1024px) 30vw, 90vw" /></Link>
              <div>
                <p className="hc-kicker">{s.rubro}</p>
                <h3><Link href={s.href}>{s.nombre}</Link></h3>
                <p>{s.descripcion}</p>
                <Link href={s.href} className="hc-more">Conocer más <ArrowRight size={15} aria-hidden /></Link>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section data-region="news" className="hc-news">
        <Ola flip />
        <Container>
          <h2>Noticias del campo</h2>
          <div className="hc-news-grid">
            {[...(d.lead ? [d.lead] : []), ...d.rest].slice(0, 3).map((n) => (
              <Link key={n.slug} href={`/noticias/${n.slug}`} className="hc-card">
                {n.image && <span className="hc-card-img"><Pic src={n.image} alt={n.imageAlt ?? ""} sizes="(min-width: 1024px) 30vw, 90vw" /></span>}
                <small>{n.section} · {fechaCorta(n.publishedAt ?? n.date)}</small>
                <strong>{n.title}</strong>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="hc-duo">
        <section className="hc-quote"><PresidentQuote /></section>
        <section data-region="cards" className="hc-agenda">
          <h2>Próximas citas</h2>
          <ul>
            {d.events.slice(0, 3).map((e) => (
              <li key={e.slug}><Link href={`/eventos/${e.slug}`}><span className="hc-leaf"><b>{e.day}</b>{e.month}</span><strong>{e.title}</strong></Link></li>
            ))}
          </ul>
          <div className="hc-pay"><NextDeadline /></div>
        </section>
      </Container>
    </div>
  );
}
