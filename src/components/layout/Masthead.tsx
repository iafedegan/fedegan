import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MastheadTools } from "./MastheadTools";

// Cabecera: el emblema con «FEDEGAN» al lado (la lupa y el ingreso van en la barra) y, en móvil, la fecha y los accesos.
export function Masthead() {
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      {/* Franja institucional (maqueta del TDR): país, el sistema nacional y los accesos de la entidad. */}
      <div className="mh-util mh-desk">
        <Container className="mh-util-in">
          <span className="mh-country"><i aria-hidden="true" /> Colombia</span>
          <span className="mh-util-tag">Sistema Nacional de Identificación e Información Ganadera</span>
          <nav aria-label="Accesos institucionales">
            <Link href="/transparencia">Transparencia</Link>
            <Link href="/noticias">Sala de prensa</Link>
            <Link href="/contacto">Trabaje con nosotros</Link>
          </nav>
        </Container>
      </div>
      <div className="mh-desk mh-main">
        <Container className="mh-main-in">
          <span className="mh-line mh-line-l" aria-hidden="true" />
          <Link href="/" className="mh-brand" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-logo-completo-blanco.png" alt="" width={516} height={204} priority unoptimized className="mh-emblem" />
          </Link>
          <span className="mh-line mh-line-r" aria-hidden="true" />
        </Container>
        <p className="mh-date mh-date-desk">{date}</p>
      </div>
      <div className="mh-mob">
        <div className="mh-row">
          <span className="mh-line mh-line-l" aria-hidden="true" />
          <Link href="/" className="mh-title mh-brand" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-logo-completo-blanco.png" alt="" width={516} height={204} priority unoptimized className="mh-emblem" />
          </Link>
          <span className="mh-line mh-line-r" aria-hidden="true" />
        </div>
        <p className="mh-date">{date}</p>
        <MastheadTools />
      </div>
    </div>
  );
}
