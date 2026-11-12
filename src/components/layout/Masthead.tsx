import Link from "next/link";
import { MastheadTools } from "./MastheadTools";
import { MastheadActions } from "./MastheadActions";
import { MastheadLados } from "./MastheadLados";
import { MastheadMarca } from "./MastheadMarca";
import { getPublishedDesign } from "@/lib/design/store";

// Cabecera de periódico: nombre en serif con degradado dorado, lema y fecha, entre filetes finos.
export async function Masthead() {
  const design = await getPublishedDesign();
  if (design.template === "marca") return <MastheadMarca />;
  const date = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date());
  return (
    <div className="mh" data-region="masthead">
      <MastheadLados />
      <div className="mh-row">
        <span aria-hidden className="mh-rule mh-rule-l" />
        <Link href="/" className="mh-title" aria-label="FEDEGÁN, inicio">
          <span aria-hidden className="mh-gem" />
          FEDEGÁN
        </Link>
        <span aria-hidden className="mh-rule mh-rule-r" />
      </div>
      <p className="mh-tag">Federación Colombiana de Ganaderos</p>
      <p className="mh-date">{date}</p>
      <MastheadTools />
      <MastheadActions />
    </div>
  );
}
