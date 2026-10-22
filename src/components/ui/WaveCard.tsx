import type { ReactNode } from "react";
import { PhotoCard } from "./PhotoCard";
import { Pictogram, type PictogramName } from "./Pictogram";

export type WaveAccent = "esmeralda" | "oro" | "terracota" | "turquesa";

// Colores de marca (manual de CONtexto): esmeralda, oro y niebla verde.
const RGB: Record<WaveAccent, string> = { esmeralda: "47,156,98", oro: "216,181,88", terracota: "159,183,168", turquesa: "47,156,98" };

type Foto = { src: string; pos: string };

// Fotos reales de finca ya incluidas en el portal; cada ficha elige la que mejor encaja con su tema.
const POR_TEMA: [RegExp, Foto][] = [
  [/pago|cuota|recaudo|fomento|fondo nacional/i, { src: "/locales/fng.jpg", pos: "50% 50%" }],
  [/biol[oó]g|vacun|sanidad|salud animal/i, { src: "/headers/campo.jpg", pos: "50% 40%" }],
  [/ruv|registro|consulta/i, { src: "/locales/normatividad.jpg", pos: "45% 50%" }],
  [/pqrsd|correo|escrib|contact|institucional|judicial|anticorrupci/i, { src: "/headers/servicios.jpg", pos: "60% 40%" }],
  [/cifra|inventario|dato|estad[ií]stic|precio/i, { src: "/locales/cifras.jpg", pos: "45% 50%" }],
  [/seguridad|solidaridad/i, { src: "/headers/campo.jpg", pos: "20% 55%" }],
  [/buen gobierno|c[oó]digo|norma|ley|metodolog/i, { src: "/locales/normatividad.jpg", pos: "70% 50%" }],
  [/sello|ambient|sostenib|visi[oó]n/i, { src: "/locales/programas.jpg", pos: "62% 50%" }],
  [/evento|webinar|foro|seminario|congreso|oct|nov|dic|ene|feb|mar|abr|may|jun|jul|ago|sep/i, { src: "/headers/prensa.jpg", pos: "50% 45%" }],
  [/publica|libro|cartilla|revista|valores/i, { src: "/locales/publicaciones.jpg", pos: "60% 50%" }],
];
const POOL: Foto[] = [
  { src: "/locales/programas.jpg", pos: "40% 50%" },
  { src: "/locales/publicaciones.jpg", pos: "35% 50%" },
  { src: "/locales/sig.jpg", pos: "45% 50%" },
  { src: "/locales/fep.jpg", pos: "50% 50%" },
  { src: "/headers/campo.jpg", pos: "50% 60%" },
  { src: "/locales/fng.jpg", pos: "30% 50%" },
  { src: "/locales/cifras.jpg", pos: "70% 50%" },
];

function elegirFoto(titulo: string): Foto {
  const tema = POR_TEMA.find(([re]) => re.test(titulo));
  if (tema) return tema[1];
  let h = 0;
  for (const c of titulo) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return POOL[h % POOL.length];
}

// Ficha con foto y ola de color: la foto arriba y, abajo, la ola con el tipo y el título; al pasar el cursor sube
// y muestra el texto y la flecha. El pictograma o la fecha/año van como sello sobre la foto.
export function WaveCard({
  href,
  external,
  accent = "esmeralda",
  icon,
  glyph,
  title,
  tags = [],
  text,
  cta = "Ver más",
  image,
  imagePos,
  children,
}: {
  href?: string;
  external?: boolean;
  accent?: WaveAccent;
  icon?: PictogramName;
  /** Texto grande (un año, una fecha) como sello sobre la foto. */
  glyph?: ReactNode;
  title: string;
  tags?: string[];
  text?: string;
  cta?: string;
  image?: string;
  imagePos?: string;
  children?: ReactNode;
}) {
  const foto = image ? { src: image, pos: imagePos ?? "50% 50%" } : elegirFoto(`${title} ${tags.join(" ")}`);
  const sello = glyph ? <span className="wc-badge wc-badge-glyph">{glyph}</span> : icon ? (
    <span className="wc-badge">
      <Pictogram name={icon} size={24} />
    </span>
  ) : undefined;
  return (
    <PhotoCard image={foto.src} imagePos={foto.pos} accent={RGB[accent]} kicker={tags.slice(0, 3).join(" · ") || undefined} title={title} text={text} href={href} external={external} cta={cta} badge={sello}>
      {children}
    </PhotoCard>
  );
}
