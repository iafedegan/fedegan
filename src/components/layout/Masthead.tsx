import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MastheadTools } from "./MastheadTools";

// Cabecera: el emblema con «FEDEGAN» al lado (la lupa y el ingreso van en la barra) y, en móvil, la fecha y los accesos.
export function Masthead() {
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      <div className="mh-desk mh-main">
        <Container className="mh-main-in">
          <Link href="/" className="mh-brand" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-emblema-blanco.png" alt="" width={410} height={404} priority unoptimized className="mh-emblem" />
            <span className="mh-name">FEDE<b>GAN</b></span>
          </Link>
        </Container>
      </div>
      <div className="mh-mob">
        <div className="mh-row">
          <Link href="/" className="mh-title mh-brand" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-emblema-blanco.png" alt="" width={410} height={404} priority unoptimized className="mh-emblem" />
            <span className="mh-name">FEDE<b>GAN</b></span>
          </Link>
        </div>
        <p className="mh-date">{date}</p>
        <MastheadTools />
      </div>
    </div>
  );
}
