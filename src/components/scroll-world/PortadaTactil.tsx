import "./portada-tactil.css";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { CalendarDots, ChartBar, ChatCircleDots, CreditCard, GraduationCap, Handshake } from "@phosphor-icons/react/dist/ssr";
import { canOptimize } from "@/lib/image-host";
import { registrarUso } from "@/lib/uso";
import type { JourneyScene } from "./ScrollWorld";

// Accesos de un toque, como iconos de app de iOS: cuadro redondeado con degradado de color y figura blanca rellena.
// `tono` son los dos colores del degradado (claro arriba, intenso abajo).
const ACCESOS = [
  { href: "/pagos", label: "Pagos", icon: CreditCard, tono: ["#4cd964", "#1f9d3f"] },
  { href: "/seccion/cifras-del-sector", label: "Cifras", icon: ChartBar, tono: ["#7d7aff", "#4a3fd6"] },
  { href: "/eventos", label: "Eventos", icon: CalendarDots, tono: ["#ff6961", "#e0261b"] },
  { href: "/servicios", label: "Servicios", icon: Handshake, tono: ["#4aa8ff", "#0a66e0"] },
  { href: "/escuela-virtual", label: "Escuela", icon: GraduationCap, tono: ["#ffb340", "#f57c00"] },
  { href: "/contacto", label: "Contacto", icon: ChatCircleDots, tono: ["#5ad7e8", "#0e93b3"] },
] as const;

const two = (n: number) => String(n).padStart(2, "0");

// Portada para celular y tableta (menos de 1024 px): foto de apertura con buscador y la noticia del día,
// accesos de un toque y las secciones como tarjetas que se deslizan con el dedo. Sin recorrido atado al scroll.
export function PortadaTactil({ scenes }: { scenes: JourneyScene[] }) {
  const inicio = scenes[0];
  const noticias = scenes.find((s) => s.id === "noticias");
  const nota = noticias?.extra;
  const tarjetas = scenes.filter((s) => s.id !== "inicio");

  return (
    <div className="pt">
      <div className="pt-hero">
        {/* Misma foto y mismos tamaños que la primera escena de escritorio: el navegador la baja una sola vez. */}
        <Image src={inicio.image} alt={inicio.alt} fill sizes="100vw" preload unoptimized={!canOptimize(inicio.image)} className="pt-hero-img" style={{ objectPosition: inicio.pos }} />
        <div className="pt-hero-shade" aria-hidden />
        <div className="pt-hero-in">
          <p className="pt-kicker"><i aria-hidden />Federación Colombiana de Ganaderos</p>
          <h2 className="pt-title">Todo el gremio ganadero, <em>en su mano</em></h2>
          <Link href="/buscador" className="pt-search">
            <Search size={18} aria-hidden />
            <span>¿Qué está buscando?</span>
          </Link>
          {nota && noticias && (
            <Link href={nota.href ?? noticias.href} className="pt-news" onClick={() => registrarUso("noticias")}>
              <span className="pt-news-img">
                <Image src={noticias.image} alt="" fill sizes="88px" unoptimized={!canOptimize(noticias.image)} />
              </span>
              <span className="pt-news-txt">
                <small>{nota.etiqueta}</small>
                <b>{nota.texto}</b>
              </span>
              <ArrowUpRight size={18} aria-hidden className="pt-news-go" />
            </Link>
          )}
        </div>
      </div>

      <div className="pt-hoja">
        <nav className="pt-quick" aria-label="Accesos rápidos">
          {ACCESOS.map(({ href, label, icon: Icon, tono }) => (
            <Link key={href} href={href} className="pt-q">
              <span className="pt-q-ico" style={{ "--a": tono[0], "--b": tono[1] } as React.CSSProperties}><Icon size={30} weight="fill" aria-hidden /></span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="pt-sec-head">
          <h2>Explore el portal</h2>
          <span aria-hidden>Deslice <ArrowRight size={14} /></span>
        </div>
        <ul className="pt-rail">
          {tarjetas.map((s, i) => {
            const cuerpo = (
              <>
                <Image src={s.image} alt="" fill sizes="(min-width: 768px) 42vw, 78vw" unoptimized={!canOptimize(s.image)} style={{ objectPosition: s.pos }} />
                <span className="pt-card-shade" aria-hidden />
                <span className="pt-card-n">{two(i + 1)} / {two(tarjetas.length)}</span>
                <span className="pt-card-in">
                  <small>{s.rubro}</small>
                  <b>{s.nombre}</b>
                  <span className="pt-card-desc">{s.descripcion}</span>
                  <span className="pt-card-cta">{s.external ? "Visitar sitio" : "Entrar"} <ArrowRight size={15} aria-hidden /></span>
                </span>
              </>
            );
            const props = { className: "pt-card", style: { "--acc": s.accent } as React.CSSProperties, onClick: () => registrarUso(s.id) };
            return (
              <li key={s.id}>
                {s.external ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" {...props}>{cuerpo}</a>
                ) : (
                  <Link href={s.href} {...props}>{cuerpo}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
