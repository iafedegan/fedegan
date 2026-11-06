import Link from "next/link";
import { ArrowRight, Bank, CalendarBlank, Clock, DownloadSimple, FileText, GraduationCap, MapPin, Newspaper, Question, Scales, Television, UserCircle, UsersThree, Wallet } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Pic } from "./Pic";
import { HeroMedia } from "./HeroMedia";
import { HeroText } from "./HeroText";
import type { AdConfig } from "@/lib/design/regions";
import { fechaCorta, type HomeData } from "./data";

// Portada institucional: hero con dos botones, accesos rápidos, noticias, publicaciones, agenda, tres bloques de información y Mi FEDEGÁN.
export function HomeInstitucional({ d, banners }: { d: HomeData; banners: AdConfig[] }) {
  const portada = banners[0];
  const foto = d.lead?.image ?? d.secciones[0]?.image ?? "/headers/campo.jpg";
  const accesos = [
    { href: "/servicios", icon: FileText, t: "Trámites y servicios", x: "Gestione aquí sus trámites y solicitudes." },
    { href: "/pagos", icon: Wallet, t: "Zona de pagos", x: "Pague la cuota de fomento y consulte las fechas límite." },
    { href: "/escuela-virtual", icon: GraduationCap, t: "Escuela Virtual", x: "Capacitación y formación para el sector ganadero." },
    { href: "/noticias", icon: Newspaper, t: "CONtexto Ganadero", x: "Información estratégica del sector." },
    { href: "https://www.tvgan.com.co/", icon: Television, t: "TvGan", x: "El canal del ganadero colombiano.", ext: true },
  ];
  const trio = [
    { href: "/seccion/programas", icon: UsersThree, t: "Programas y proyectos", x: "Conozca nuestras iniciativas para el desarrollo y la competitividad del sector.", c: "Explorar programas" },
    { href: "/seccion/normatividad", icon: Scales, t: "Normatividad", x: "Consulte la normatividad vigente que aplica al sector ganadero.", c: "Ver normatividad" },
    { href: "/preguntas-frecuentes", icon: Question, t: "Preguntas frecuentes", x: "Resuelva sus dudas sobre trámites, servicios y procesos.", c: "Ir a preguntas frecuentes" },
  ];
  const noticias = [...(d.lead ? [d.lead] : []), ...d.rest].slice(0, 3);
  return (
    <div className="hi">
      <section data-region="hero" className="hi-hero">
        <Container className="hi-hero-in">
          <HeroText initial={portada} />
          <div className="hi-hero-img"><HeroMedia initial={banners} fallback={<Pic src={foto} alt={d.lead?.imageAlt ?? ""} sizes="(min-width: 1024px) 50vw, 100vw" priority />} /></div>
        </Container>
      </section>

      <Container>
        <ul className="hi-quick">
          {accesos.map((a) => (
            <li key={a.t}>
              {a.ext ? (
                <a href={a.href} target="_blank" rel="noopener noreferrer"><a.icon size={30} weight="duotone" aria-hidden /><strong>{a.t}</strong><span>{a.x}</span><ArrowRight size={16} weight="bold" aria-hidden /></a>
              ) : (
                <Link href={a.href}><a.icon size={30} weight="duotone" aria-hidden /><strong>{a.t}</strong><span>{a.x}</span><ArrowRight size={16} weight="bold" aria-hidden /></Link>
              )}
            </li>
          ))}
        </ul>

        <section data-region="news" className="hi-sec">
          <div className="hi-head"><h2>Noticias destacadas</h2><Link href="/noticias">Ver todas las noticias <ArrowRight size={14} weight="bold" aria-hidden /></Link></div>
          <div className="hi-grid3">
            {noticias.length === 0 && <p className="hi-empty">Las noticias no están disponibles en este momento. Puede leerlas en <Link href="/noticias">la sala de prensa</Link>.</p>}
            {noticias.map((n) => (
              <Link key={n.slug} href={`/noticias/${n.slug}`} className="hi-card">
                <span className="hi-img">{n.image && <Pic src={n.image} alt={n.imageAlt ?? ""} sizes="(min-width: 1024px) 30vw, 100vw" />}<em>{n.section}</em></span>
                <small>{fechaCorta(n.publishedAt ?? n.date)}</small>
                <strong>{n.title}</strong>
                {n.dek && <span className="hi-dek">{n.dek}</span>}
              </Link>
            ))}
          </div>
        </section>

        <section data-region="cards" className="hi-sec">
          <div className="hi-head"><h2>Publicaciones y recursos</h2><Link href="/publicaciones">Ver todas las publicaciones <ArrowRight size={14} weight="bold" aria-hidden /></Link></div>
          <div className="hi-grid3">
            {d.pubs.slice(0, 3).map((p) => (
              <Link key={p.slug} href={`/publicaciones/${p.slug}`} className="hi-pub">
                <span className="hi-cover">{p.coverImage ? <Pic src={p.coverImage} sizes="140px" /> : <FileText size={36} weight="duotone" aria-hidden />}</span>
                <span><small>{p.type}</small><strong>{p.title}</strong><span className="hi-dek">{p.dek}</span><b>{p.fileUrl ? "Descargar PDF" : "Ver publicación"} <DownloadSimple size={15} weight="bold" aria-hidden /></b></span>
              </Link>
            ))}
          </div>
        </section>

        <section data-region="cards" className="hi-sec">
          <div className="hi-head"><h2>Eventos y agenda</h2><Link href="/eventos">Ver todos los eventos <ArrowRight size={14} weight="bold" aria-hidden /></Link></div>
          <div className="hi-grid3">
            {d.events.slice(0, 3).map((e) => (
              <Link key={e.slug} href={`/eventos/${e.slug}`} className="hi-ev">
                <span className="hi-date"><small>{e.month}</small><b>{e.day}</b></span>
                <span><small>{e.kind}</small><strong>{e.title}</strong>
                  {e.time && <span className="hi-meta"><Clock size={14} weight="duotone" aria-hidden /> {e.time}</span>}
                  {e.place && <span className="hi-meta"><MapPin size={14} weight="duotone" aria-hidden /> {e.place}</span>}
                  <span className="hi-meta hi-cal"><CalendarBlank size={14} weight="duotone" aria-hidden /> Agregar a mi calendario</span></span>
              </Link>
            ))}
          </div>
        </section>

        <ul className="hi-trio">
          {trio.map((t) => (
            <li key={t.t}><Link href={t.href}><t.icon size={38} weight="duotone" aria-hidden /><span><strong>{t.t}</strong>{t.x}<b>{t.c} <ArrowRight size={14} weight="bold" aria-hidden /></b></span></Link></li>
          ))}
        </ul>

        <section className="hi-mi">
          <div>
            <p><Bank size={15} weight="duotone" aria-hidden /> Próximamente</p>
            <h2>Mi FEDEGÁN, su espacio personalizado</h2>
            <span>Un área exclusiva para nuestros afiliados y usuarios registrados, con acceso a información, herramientas y beneficios del ecosistema FEDEGÁN–FNG.</span>
            <ul><li>Gestione sus trámites en línea</li><li>Reciba comunicaciones y alertas</li><li>Acceda a información personalizada</li></ul>
            <Link href="/mi-fedegan" className="hi-btn hi-dark"><UserCircle size={18} weight="duotone" aria-hidden /> Conozca más <ArrowRight size={16} weight="bold" aria-hidden /></Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
