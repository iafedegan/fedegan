import { ArrowRight, ArrowUpRight, ChevronDown, Download, FileText } from "lucide-react";
import { ScrollRail } from "@/components/design/ScrollRail";
import { elementoDeBloque, type Bloque, type Elemento, type Tarjeta } from "@/lib/cms/bloques";
import { TIPOS_ESQUEMA } from "@/lib/cms/elementos";
import { tarjetasDeEnlaces } from "@/lib/cms/documentos-tarjetas";
import { DocList } from "./DocList";
import { ElementoExtra } from "./ElementosExtra";
import { Inline } from "./Inline";
import { botonBase, botonClase, enlaceSeguro, esExterno, imagenSegura, Vinculo } from "./comun";

// Los elementos del constructor de páginas, tal como se ven en el sitio. Los datos se leen con `elementoDeBloque`
// y los enlaces se vuelven a comprobar al pintar, por si el dato guardado no fuera el esperado.

type De<T extends Elemento["tipo"]> = Extract<Elemento, { tipo: T }>;

function Boton({ el }: { el: De<"button"> }) {
  if (!enlaceSeguro(el.href)) return null;
  return (
    <Vinculo href={el.href} className={`${botonBase} ${botonClase[el.estilo]}`}>
      {el.texto} {esExterno(el.href) && <ArrowUpRight size={15} aria-hidden />}
    </Vinculo>
  );
}

function Imagen({ el }: { el: De<"image"> }) {
  const src = imagenSegura(el.src);
  if (!src) return null;
  return (
    <figure className="my-6 max-w-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={el.alt} loading="lazy" decoding="async" className="h-auto w-full rounded-[var(--radius-md)] border border-[var(--border)]" />
      {el.pie && <figcaption className="mt-2 text-sm leading-snug text-[var(--text-muted)]">{el.pie}</figcaption>}
    </figure>
  );
}

function FichaTarjeta({ t }: { t: Tarjeta }) {
  const img = imagenSegura(t.imagen);
  const href = enlaceSeguro(t.enlace);
  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)] transition-[border-color,box-shadow] hover:border-[var(--fg-lime-500)] hover:shadow-[var(--shadow-md)]">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {t.titulo && <span className="block font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]"><Inline text={t.titulo} /></span>}
        {t.texto && <span className="block text-[0.95rem] leading-relaxed text-[var(--text-muted)]"><Inline text={t.texto} /></span>}
        {href && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-[var(--fg-lime-400)]">
            {t.boton || "Ver más"} {esExterno(href) ? <ArrowUpRight size={15} aria-hidden /> : <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />}
          </span>
        )}
      </div>
      {/* Toda la ficha es el enlace. */}
      {href && <Vinculo href={href} label={t.titulo || t.boton || "Abrir"} className="absolute inset-0 z-10 rounded-[inherit] bg-transparent" >{null}</Vinculo>}
    </article>
  );
}

// Columnas según el ancho del propio bloque (no de la pantalla), para que se acomoden igual en la página y en el editor.
const COLUMNAS = {
  2: "@md:grid-cols-2",
  3: "@md:grid-cols-2 @2xl:grid-cols-3",
  4: "@md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4",
};

function Tarjetas({ el }: { el: De<"cards"> }) {
  if (!el.items.length) return null;
  return (
    <div className="@container my-6">
      <ul className={`grid grid-cols-1 gap-4 ${COLUMNAS[el.columnas]}`}>
        {el.items.map((t, i) => (
          <li key={i} className="flex">
            <FichaTarjeta t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Carrusel({ el, preview }: { el: De<"carousel">; preview: boolean }) {
  if (!el.items.length) return null;
  return (
    <div className="my-6">
      <ScrollRail label="Carrusel" autoplay={el.auto && !preview}>
        {el.items.map((t, i) => (
          <div key={i} className="flex">
            <FichaTarjeta t={t} />
          </div>
        ))}
      </ScrollRail>
    </div>
  );
}

function Acordeon({ el }: { el: De<"accordion"> }) {
  if (!el.items.length) return null;
  return (
    <div className="my-6 divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)]">
      {el.items.map((it, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-[var(--font-display)] text-[1.05rem] font-bold leading-snug text-[var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="min-w-0"><Inline text={it.titulo} /></span>
            <ChevronDown size={18} aria-hidden className="shrink-0 text-[var(--fg-lime-400)] transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-3 px-5 pb-5 leading-relaxed text-[var(--text-muted)]">
            {it.texto.split(/\n{2,}/).filter(Boolean).map((p, n) => (
              <span key={n} className="block"><Inline text={p} /></span>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

const TONOS = {
  verde: { caja: "bg-[var(--fg-green-800)] text-[var(--text-on-brand)]", boton: "bg-white text-[var(--fg-green-900)] hover:opacity-90" },
  claro: { caja: "bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text)]", boton: "bg-[var(--fg-green-800)] text-[var(--text-on-brand)] hover:opacity-90" },
  dorado: { caja: "bg-[#fff4d6] border border-[#ecd48a] text-[#3a2d08]", boton: "bg-[#3a2d08] text-white hover:opacity-90" },
};

function Destacado({ el }: { el: De<"callout"> }) {
  const tono = TONOS[el.tono];
  const href = enlaceSeguro(el.enlace);
  return (
    <aside className={`my-6 flex flex-col gap-4 rounded-[var(--radius-md)] p-6 sm:flex-row sm:items-center sm:justify-between ${tono.caja}`}>
      <div className="min-w-0">
        {el.titulo && <span className="block font-[var(--font-display)] text-xl font-bold leading-snug"><Inline text={el.titulo} /></span>}
        {el.texto && <span className="mt-1.5 block leading-relaxed opacity-90"><Inline text={el.texto} /></span>}
      </div>
      {href && el.boton && (
        <Vinculo href={href} className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-bold no-underline transition-opacity sm:self-center ${tono.boton}`}>
          {el.boton} {esExterno(href) ? <ArrowUpRight size={15} aria-hidden /> : <ArrowRight size={15} aria-hidden />}
        </Vinculo>
      )}
    </aside>
  );
}

const extension = (url: string) => /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url)?.[1]?.toLowerCase() ?? "";

function Documentos({ el }: { el: De<"docs"> }) {
  const items = el.items.filter((d) => d.nombre && enlaceSeguro(d.url));
  if (!items.length) return null;
  // Con archivos de documentos (PDF, Excel, Word…) se ven como las tarjetas del resto del portal; con otros enlaces, como lista.
  const tarjetas = tarjetasDeEnlaces(items);
  return (
    <div className="my-6">
      {el.titulo && <span className="mb-3 block font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{el.titulo}</span>}
      {tarjetas ? (
        <DocList tarjetas={tarjetas} />
      ) : (
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)]">
          {items.map((d, i) => {
            const ext = extension(d.url);
            return (
              <li key={i}>
                <Vinculo href={d.url} className="group flex items-center gap-3 bg-transparent px-4 py-3.5 text-[var(--text)] no-underline transition-colors hover:bg-[var(--bg-muted)]">
                  <FileText size={18} aria-hidden className="shrink-0 text-[var(--fg-lime-400)]" />
                  <span className="min-w-0 flex-1 truncate font-semibold">{d.nombre}</span>
                  {ext && <span className="shrink-0 rounded bg-[var(--bg-muted)] px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase text-[var(--text-muted)] group-hover:bg-white">{ext}</span>}
                  <Download size={16} aria-hidden className="shrink-0 text-[var(--text-faint)]" />
                </Vinculo>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Tipos de bloque que se pintan aquí. */
export const BLOQUES_RICOS = new Set<string>(["button", "image", "cards", "carousel", "accordion", "callout", "docs", "divider", ...TIPOS_ESQUEMA]);

export function BloqueRico({ b, preview = false }: { b: Bloque; preview?: boolean }) {
  const el = elementoDeBloque(b);
  switch (el.tipo) {
    case "button": return <Boton el={el} />;
    case "image": return <Imagen el={el} />;
    case "cards": return <Tarjetas el={el} />;
    case "carousel": return <Carrusel el={el} preview={preview} />;
    case "accordion": return <Acordeon el={el} />;
    case "callout": return <Destacado el={el} />;
    case "docs": return <Documentos el={el} />;
    case "divider": return <hr className="my-8 border-0 border-t border-[var(--border)]" />;
    default: return "datos" in el ? <ElementoExtra tipo={el.tipo} datos={el.datos} /> : null;
  }
}
