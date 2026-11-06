import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MastheadTools } from "./MastheadTools";

// Cabecera: barra superior de servicios, logo con buscador (escritorio) y, en móvil, el logo con la fecha y los accesos.
export function Masthead() {
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      <div className="mh-desk mh-util">
        <Container className="mh-util-in">
          <span className="mh-country"><i aria-hidden /> COLOMBIA</span>
          <span className="mh-util-tag">Sistema Nacional de Identificación e Información Ganadera</span>
          <nav aria-label="Servicios del portal">
            <Link href="/transparencia">Transparencia</Link>
            <Link href="/noticias">Sala de prensa</Link>
            <Link href="/contacto">Trabaje con nosotros</Link>
          </nav>
        </Container>
      </div>
      <div className="mh-desk mh-main">
        <Container className="mh-main-in">
          <Link href="/" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-horizontal-desc.svg" alt="FEDEGÁN, Federación Colombiana de Ganaderos" width={917} height={329} priority unoptimized className="mh-logo-d" />
          </Link>
          <form action="/buscador" method="get" role="search" className="mh-search">
            <input type="search" name="q" placeholder="¿Qué está buscando?" aria-label="Buscar en el portal" autoComplete="off" />
            <button type="submit" aria-label="Buscar"><Search size={18} aria-hidden /></button>
          </form>
        </Container>
      </div>
      <div className="mh-mob">
        <div className="mh-row">
          <Link href="/" className="mh-title" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-horizontal-desc.svg" alt="FEDEGÁN, Federación Colombiana de Ganaderos" width={917} height={329} priority unoptimized className="mh-logo" />
          </Link>
        </div>
        <p className="mh-date">{date}</p>
        <MastheadTools />
      </div>
    </div>
  );
}
