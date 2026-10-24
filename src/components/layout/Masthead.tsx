import Link from "next/link";
import { MastheadTools } from "./MastheadTools";

// Cabecera de periódico: nombre en serif con degradado dorado, lema y fecha, entre filetes finos.
export function Masthead() {
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      <MastheadTools date={date} />
      <div className="mh-row">
        <span aria-hidden className="mh-rule mh-rule-l" />
        <Link href="/" className="mh-title" aria-label="FEDEGÁN FNG, inicio">
          FEDEGÁN <span>FNG</span>
        </Link>
        <span aria-hidden className="mh-rule mh-rule-r" />
      </div>
      <p className="mh-tag">Federación Colombiana de Ganaderos</p>
      <p className="mh-date">{date}</p>
    </div>
  );
}
