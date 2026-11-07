import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LoginMenu } from "./LoginMenu";
import { MastheadTools } from "./MastheadTools";

// Cabecera: logo con buscador (escritorio) y, en móvil, el logo con la fecha y los accesos.
export function Masthead() {
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      <div className="mh-desk mh-main">
        <Container className="mh-main-in">
          <Link href="/" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-horizontal-desc-blanco.svg" alt="FEDEGÁN, Federación Colombiana de Ganaderos" width={917} height={329} priority unoptimized className="mh-logo-d" />
          </Link>
          <form action="/buscador" method="get" role="search" className="mh-search">
            <input type="search" name="q" placeholder="¿Qué está buscando?" aria-label="Buscar en el portal" autoComplete="off" />
            <button type="submit" aria-label="Buscar"><Search size={18} aria-hidden /></button>
          </form>
          <LoginMenu />
        </Container>
      </div>
      <div className="mh-mob">
        <div className="mh-row">
          <Link href="/" className="mh-title" aria-label="FEDEGÁN FNG, inicio">
            <Image src="/brand/fedegan-horizontal-desc-blanco.svg" alt="FEDEGÁN, Federación Colombiana de Ganaderos" width={917} height={329} priority unoptimized className="mh-logo" />
          </Link>
        </div>
        <p className="mh-date">{date}</p>
        <MastheadTools />
      </div>
    </div>
  );
}
