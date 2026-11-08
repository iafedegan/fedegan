import type { ReactNode } from "react";
import {
  ArrowRight, ArrowUpRight, CheckCircle2, Clock, Download, Globe, Headphones, Info, Mail, MapPin, MessageCircle, Music2, OctagonAlert, Phone, Quote, TriangleAlert,
} from "lucide-react";
import type { Datos, TipoEsquema } from "@/lib/cms/elementos";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { Galeria } from "./Galeria";
import { ICONOS_CARACT } from "./iconos-caracteristicas";
import { Inline } from "./Inline";
import { Pestanas } from "./Pestanas";
import { FichaExtra } from "./SectionParts";
import { botonClase, botonForma, enlaceSeguro, esExterno, imagenSegura, Parrafos, Vinculo } from "./comun";

// Los elementos descritos por esquema (src/lib/cms/elementos.ts), tal como se ven en el sitio. Reciben los datos ya limpios
// del servidor, pero igual se comprueban los enlaces y las imágenes al pintar. Las columnas se acomodan según el ancho del
// propio elemento (no el de la pantalla), así se ven igual en la página y en la vista previa del editor.

const t = (v: unknown) => (typeof v === "string" ? v : "");
const lista = (v: unknown): Datos[] => (Array.isArray(v) ? v.filter((x): x is Datos => !!x && typeof x === "object" && !Array.isArray(x)) : []);
const columnas = (v: unknown, def: 2 | 3 | 4): 2 | 3 | 4 => (v === "2" || v === "3" || v === "4" ? (Number(v) as 2 | 3 | 4) : def);

// Los títulos de cada elemento se marcan como encabezados para los lectores de pantalla sin heredar el estilo de h2/h3 de la página.
function Titulo({ children, nivel = 3, className = "" }: { children: ReactNode; nivel?: 2 | 3 | 4; className?: string }) {
  return (
    <span role="heading" aria-level={nivel} className={`block font-[var(--font-display)] font-bold leading-snug text-[var(--text)] ${className}`}>
      {children}
    </span>
  );
}

// ───────────────────────── Texto

const AVISOS = {
  info: { Icono: Info, caja: "border-[#9dbbe1] bg-[#eef5fc] text-[#173f6e]", icono: "text-[#1f5fa8]" },
  exito: { Icono: CheckCircle2, caja: "border-[#9ed07a] bg-[#f0f8ea] text-[#1f4a0d]", icono: "text-[#3d7a22]" },
  alerta: { Icono: TriangleAlert, caja: "border-[#ecd48a] bg-[#fff6dc] text-[#5a4308]", icono: "text-[#b07d0a]" },
  importante: { Icono: OctagonAlert, caja: "border-[#e1a39d] bg-[#fdf1f0] text-[#7a1f1f]", icono: "text-[#b42318]" },
} as const;

function Aviso({ d }: { d: Datos }) {
  const { Icono, caja, icono } = AVISOS[t(d.tono) as keyof typeof AVISOS] ?? AVISOS.info;
  return (
    <aside role="note" className={`my-6 flex gap-3.5 rounded-[var(--radius-md)] border border-l-4 p-4 sm:p-5 ${caja}`}>
      <Icono size={22} aria-hidden className={`mt-0.5 shrink-0 ${icono}`} />
      <div className="min-w-0">
        {t(d.titulo) && (
          <Titulo className="!text-inherit text-[1.05rem]">
            <Inline text={t(d.titulo)} />
          </Titulo>
        )}
        {t(d.texto) && (
          <span className={`block leading-relaxed ${t(d.titulo) ? "mt-1" : ""}`}>
            <Parrafos texto={t(d.texto)} />
          </span>
        )}
      </div>
    </aside>
  );
}

function Cita({ d }: { d: Datos }) {
  const foto = imagenSegura(t(d.imagen));
  const autor = t(d.autor);
  const cargo = t(d.cargo);
  return (
    <figure className="my-8 max-w-3xl rounded-[var(--radius-md)] border-l-4 border-[var(--fg-lime-500)] bg-[var(--bg-muted)] p-6 sm:p-8">
      <Quote size={30} aria-hidden className="mb-2 text-[var(--fg-lime-500)]" />
      <blockquote className="m-0 border-0 p-0">
        <span className="block font-[var(--font-display)] text-xl font-semibold leading-snug text-[var(--text)] sm:text-2xl">
          <Inline text={t(d.texto)} />
        </span>
      </blockquote>
      {(autor || cargo || foto) && (
        <figcaption className="mt-5 flex items-center gap-3">
          {foto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full border border-[var(--border)] object-cover" />
          )}
          <span className="block min-w-0">
            {autor && <span className="block font-bold text-[var(--text)]">{autor}</span>}
            {cargo && <span className="block text-sm text-[var(--text-muted)]">{cargo}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function Columnas({ d }: { d: Datos }) {
  const items = lista(d.items).filter((c) => t(c.titulo) || t(c.texto));
  if (!items.length) return null;
  const tres = t(d.columnas) === "3";
  return (
    <div className="@container my-6">
      <div className={`grid grid-cols-1 gap-x-8 gap-y-6 ${tres ? "@2xl:grid-cols-3" : "@xl:grid-cols-2"}`}>
        {items.map((c, i) => (
          <div key={i} className="min-w-0">
            {t(c.titulo) && (
              <Titulo className="mb-1.5 text-lg">
                <Inline text={t(c.titulo)} />
              </Titulo>
            )}
            <Parrafos texto={t(c.texto)} className="leading-relaxed text-[var(--text-muted)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── Acciones

function Botones({ d }: { d: Datos }) {
  const items = lista(d.items).filter((b) => t(b.texto) && enlaceSeguro(t(b.enlace)));
  if (!items.length) return null;
  const alin = t(d.alineacion) === "centro" ? "justify-center" : t(d.alineacion) === "derecha" ? "justify-end" : "";
  return (
    <div className={`my-5 flex flex-wrap gap-3 ${alin}`}>
      {items.map((b, i) => (
        <Vinculo key={i} href={t(b.enlace)} className={`${botonForma} ${botonClase[t(b.estilo) === "borde" ? "borde" : "solido"]}`}>
          {t(b.texto)} {esExterno(t(b.enlace)) && <ArrowUpRight size={15} aria-hidden />}
        </Vinculo>
      ))}
    </div>
  );
}

const FONDOS_BANNER = { verde: "bg-[var(--fg-green-800)]", oscuro: "bg-[#10240f]", dorado: "bg-[#8a6d1f]" } as const;
const ALTOS_BANNER = { bajo: "min-h-[10rem]", medio: "min-h-[15rem]", alto: "min-h-[22rem]" } as const;

function Banner({ d }: { d: Datos }) {
  const foto = imagenSegura(t(d.imagen));
  const centro = t(d.alineacion) === "centro";
  const fondo = FONDOS_BANNER[t(d.fondo) as keyof typeof FONDOS_BANNER] ?? FONDOS_BANNER.verde;
  const alto = ALTOS_BANNER[t(d.alto) as keyof typeof ALTOS_BANNER] ?? ALTOS_BANNER.medio;
  const hayBoton = t(d.boton) && enlaceSeguro(t(d.enlace));
  return (
    <section className={`relative my-6 flex overflow-hidden rounded-[var(--radius-md)] text-white ${alto} ${foto ? "bg-[#10240f]" : fondo}`}>
      {foto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <span aria-hidden className={`absolute inset-0 ${centro ? "bg-black/55" : "bg-gradient-to-r from-black/75 via-black/45 to-black/10"}`} />
        </>
      )}
      <div className={`relative flex w-full flex-col justify-center gap-3 p-6 sm:p-10 ${centro ? "items-center text-center" : "items-start"}`}>
        {t(d.titulo) && <span role="heading" aria-level={2} className="block max-w-2xl font-[var(--font-display)] text-2xl font-bold leading-tight sm:text-4xl">{t(d.titulo)}</span>}
        {t(d.texto) && <span className="block max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/90 sm:text-lg">{t(d.texto)}</span>}
        {hayBoton && (
          <Vinculo href={t(d.enlace)} className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--fg-green-900)] no-underline transition-opacity hover:opacity-90">
            {t(d.boton)} {esExterno(t(d.enlace)) ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
          </Vinculo>
        )}
      </div>
    </section>
  );
}

const REDES: Record<string, { nombre: string; Icono: (p: { size?: number; className?: string }) => ReactNode }> = {
  facebook: { nombre: "Facebook", Icono: FacebookIcon },
  x: { nombre: "X", Icono: XIcon },
  instagram: { nombre: "Instagram", Icono: InstagramIcon },
  youtube: { nombre: "YouTube", Icono: YoutubeIcon },
  linkedin: { nombre: "LinkedIn", Icono: LinkedinIcon },
  tiktok: { nombre: "TikTok", Icono: ({ size = 16, className }) => <Music2 size={size} className={className} aria-hidden /> },
  whatsapp: { nombre: "WhatsApp", Icono: ({ size = 16, className }) => <MessageCircle size={size} className={className} aria-hidden /> },
  web: { nombre: "Sitio web", Icono: ({ size = 16, className }) => <Globe size={size} className={className} aria-hidden /> },
};

function Redes({ d }: { d: Datos }) {
  const items = lista(d.items).filter((r) => enlaceSeguro(t(r.enlace)));
  if (!items.length) return null;
  return (
    <div className="my-6">
      {t(d.titulo) && <Titulo className="mb-3 text-lg"><Inline text={t(d.titulo)} /></Titulo>}
      <ul className="flex flex-wrap gap-2.5">
        {items.map((r, i) => {
          const red = REDES[t(r.red)] ?? REDES.web;
          return (
            <li key={i}>
              <Vinculo href={t(r.enlace)} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-2 text-sm font-semibold text-[var(--text)] no-underline transition-colors hover:border-[var(--fg-lime-500)] hover:bg-[var(--bg-muted)]">
                <red.Icono size={16} className="text-[var(--fg-green-800)]" /> {red.nombre}
              </Vinculo>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────────────────────── Medios

function ImagenTexto({ d }: { d: Datos }) {
  const foto = imagenSegura(t(d.imagen));
  if (!foto) return null;
  const izquierda = t(d.posicion) !== "derecha";
  const tercio = t(d.ancho) === "tercio";
  const rejilla = tercio ? (izquierda ? "@xl:grid-cols-[1fr_2fr]" : "@xl:grid-cols-[2fr_1fr]") : "@xl:grid-cols-2";
  const hayBoton = t(d.boton) && enlaceSeguro(t(d.enlace));
  return (
    <div className="@container my-8">
      <div className={`grid grid-cols-1 items-center gap-6 @xl:gap-10 ${rejilla}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt={t(d.alt)} loading="lazy" decoding="async" className={`h-auto w-full rounded-[var(--radius-md)] border border-[var(--border)] object-cover ${izquierda ? "" : "@xl:order-2"}`} />
        <div className="min-w-0">
          {t(d.titulo) && <Titulo className="mb-2 text-xl sm:text-2xl"><Inline text={t(d.titulo)} /></Titulo>}
          <Parrafos texto={t(d.texto)} className="leading-relaxed text-[var(--text-muted)]" />
          {hayBoton && (
            <Vinculo href={t(d.enlace)} className={`mt-4 ${botonForma} ${botonClase.solido}`}>
              {t(d.boton)} {esExterno(t(d.enlace)) ? <ArrowUpRight size={15} aria-hidden /> : <ArrowRight size={15} aria-hidden />}
            </Vinculo>
          )}
        </div>
      </div>
    </div>
  );
}

function GaleriaFotos({ d }: { d: Datos }) {
  const fotos = lista(d.items).flatMap((f) => (imagenSegura(t(f.imagen)) ? [{ src: t(f.imagen), pie: t(f.pie) }] : []));
  if (!fotos.length) return null;
  return <Galeria fotos={fotos} columnas={columnas(d.columnas, 3)} />;
}

function Audio({ d }: { d: Datos }) {
  const url = enlaceSeguro(t(d.url));
  if (!url) return null;
  return (
    <figure className="my-6 flex max-w-2xl flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)] p-4 sm:p-5">
      <figcaption className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3e9f8] text-[#7a3c9a]">
          <Headphones size={20} aria-hidden />
        </span>
        <span className="block min-w-0 font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{t(d.titulo) || "Audio"}</span>
      </figcaption>
      <audio controls preload="none" src={url} className="w-full" />
      <Vinculo href={url} className="inline-flex w-fit items-center gap-1.5 bg-transparent text-sm font-semibold text-[var(--fg-green-800)] no-underline hover:underline">
        <Download size={14} aria-hidden /> Descargar el audio
      </Vinculo>
    </figure>
  );
}

const COLUMNAS_LOGOS = { 3: "grid-cols-2 @md:grid-cols-3", 4: "grid-cols-2 @md:grid-cols-3 @3xl:grid-cols-4", 5: "grid-cols-2 @md:grid-cols-3 @3xl:grid-cols-5" } as const;

function Logos({ d }: { d: Datos }) {
  const items = lista(d.items).filter((l) => imagenSegura(t(l.imagen)));
  if (!items.length) return null;
  const n = (["3", "4", "5"].includes(t(d.columnas)) ? Number(t(d.columnas)) : 4) as 3 | 4 | 5;
  return (
    <div className="@container my-8">
      {t(d.titulo) && <Titulo className="mb-4 text-lg"><Inline text={t(d.titulo)} /></Titulo>}
      <ul className={`grid items-stretch gap-3 ${COLUMNAS_LOGOS[n]}`}>
        {items.map((l, i) => {
          const contenido = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t(l.imagen)} alt={t(l.nombre)} loading="lazy" decoding="async" className="max-h-16 max-w-full object-contain" />
          );
          const caja = "grid h-24 w-full place-items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 grayscale transition duration-300 hover:grayscale-0";
          return (
            <li key={i}>
              {enlaceSeguro(t(l.enlace)) ? (
                <Vinculo href={t(l.enlace)} label={t(l.nombre) || undefined} className={`${caja} bg-white no-underline hover:border-[var(--fg-lime-500)]`}>
                  {contenido}
                </Vinculo>
              ) : (
                <div className={caja}>{contenido}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────────────────────── Contenido

function PestanasTexto({ d }: { d: Datos }) {
  const items = lista(d.items).filter((p) => t(p.titulo)).map((p) => ({ titulo: t(p.titulo), texto: t(p.texto) }));
  return items.length ? <Pestanas items={items} /> : null;
}

const COLUMNAS_CIFRAS = { 2: "@md:grid-cols-2", 3: "@md:grid-cols-2 @3xl:grid-cols-3", 4: "@md:grid-cols-2 @3xl:grid-cols-4" } as const;

function Cifras({ d }: { d: Datos }) {
  const items = lista(d.items).filter((c) => t(c.valor));
  if (!items.length) return null;
  return (
    <div className="@container my-8">
      {t(d.titulo) && <Titulo className="mb-4 text-lg"><Inline text={t(d.titulo)} /></Titulo>}
      <ul className={`grid grid-cols-1 gap-4 ${COLUMNAS_CIFRAS[columnas(d.columnas, 3)]}`}>
        {items.map((c, i) => (
          <li key={i} className="rounded-[var(--radius-md)] border border-[var(--border)] border-t-4 border-t-[var(--fg-lime-500)] bg-[var(--surface-solid)] px-5 py-5">
            <span className="block font-[var(--font-display)] text-4xl font-extrabold leading-none tracking-tight text-[var(--fg-green-800)]">{t(c.valor)}</span>
            {t(c.etiqueta) && <span className="mt-2 block font-semibold leading-snug text-[var(--text)]">{t(c.etiqueta)}</span>}
            {t(c.nota) && <span className="mt-1 block text-sm text-[var(--text-muted)]">{t(c.nota)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pasos({ d }: { d: Datos }) {
  const items = lista(d.items).filter((p) => t(p.titulo));
  if (!items.length) return null;
  return (
    <ol className="my-6 flex list-none flex-col p-0">
      {items.map((p, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--fg-green-800)] text-sm font-bold text-[var(--text-on-brand)]">{i + 1}</span>
          {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-9 w-px bg-[var(--border)]" />}
          <div className="min-w-0 pt-1">
            <Titulo className="text-[1.05rem]"><Inline text={t(p.titulo)} /></Titulo>
            {t(p.texto) && <Parrafos texto={t(p.texto)} className="mt-1 leading-relaxed text-[var(--text-muted)]" />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Cronologia({ d }: { d: Datos }) {
  const items = lista(d.items).filter((h) => t(h.fecha));
  if (!items.length) return null;
  const fechas = t(d.estilo) === "fechas";
  return (
    <ol className="my-6 flex list-none flex-col p-0">
      {items.map((h, i) => (
        <li key={i} className={`relative flex gap-4 pb-6 last:pb-0 ${fechas ? "" : "pl-6"}`}>
          {fechas ? (
            <span className="h-fit min-w-[6.5rem] shrink-0 rounded-[var(--radius-md)] bg-[var(--fg-green-800)] px-3 py-2 text-center text-sm font-bold leading-snug text-[var(--text-on-brand)]">{t(h.fecha)}</span>
          ) : (
            <>
              <span aria-hidden className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-[var(--fg-lime-500)] bg-white" />
              {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[0.3rem] top-5 w-px bg-[var(--border)]" />}
            </>
          )}
          <div className="min-w-0">
            {!fechas && <span className="block text-sm font-bold uppercase tracking-wide text-[var(--fg-lime-400)]">{t(h.fecha)}</span>}
            {t(h.titulo) && <Titulo className="text-[1.05rem]"><Inline text={t(h.titulo)} /></Titulo>}
            {t(h.texto) && <Parrafos texto={t(h.texto)} className="mt-1 leading-relaxed text-[var(--text-muted)]" />}
          </div>
        </li>
      ))}
    </ol>
  );
}

const COLUMNAS_CARACT = { 2: "@md:grid-cols-2", 3: "@md:grid-cols-2 @3xl:grid-cols-3", 4: "@md:grid-cols-2 @3xl:grid-cols-4" } as const;

function Caracteristicas({ d }: { d: Datos }) {
  const items = lista(d.items).filter((c) => t(c.titulo));
  if (!items.length) return null;
  return (
    <div className="@container my-8">
      <ul className={`grid grid-cols-1 gap-x-6 gap-y-7 ${COLUMNAS_CARACT[columnas(d.columnas, 3)]}`}>
        {items.map((c, i) => {
          const Icono = ICONOS_CARACT[t(c.icono)] ?? ICONOS_CARACT.check;
          return (
            <li key={i} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--bg-muted)] text-[var(--fg-green-800)] ring-1 ring-[var(--border)]">
                <Icono size={22} aria-hidden />
              </span>
              <div className="min-w-0">
                <Titulo className="text-[1.05rem]"><Inline text={t(c.titulo)} /></Titulo>
                {t(c.texto) && <span className="mt-1 block leading-relaxed text-[var(--text-muted)]"><Inline text={t(c.texto)} /></span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Una ficha de tema suelta (en el editor y en páginas sin cuadrícula de temas); en las secciones se suma a la cuadrícula.
function FichaSuelta({ d }: { d: Datos }) {
  if (!t(d.titulo)) return null;
  return (
    <ol className="hub-grid my-6 max-w-md">
      <FichaExtra ficha={{ titulo: t(d.titulo), texto: t(d.texto), enlace: t(d.enlace) }} numero={1} />
    </ol>
  );
}

function Enlaces({ d }: { d: Datos }) {
  const items = lista(d.items).filter((e) => t(e.titulo) && enlaceSeguro(t(e.enlace)));
  if (!items.length) return null;
  return (
    <ul className="my-6 divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)]">
      {items.map((e, i) => (
        <li key={i}>
          <Vinculo href={t(e.enlace)} className="group flex items-center justify-between gap-4 bg-transparent px-5 py-4 text-[var(--text)] no-underline transition-colors hover:bg-[var(--bg-muted)]">
            <span className="min-w-0">
              <span className="block font-semibold leading-snug">{t(e.titulo)}</span>
              {t(e.texto) && <span className="mt-0.5 block text-sm text-[var(--text-muted)]">{t(e.texto)}</span>}
            </span>
            {esExterno(t(e.enlace)) ? <ArrowUpRight size={18} aria-hidden className="shrink-0 text-[var(--fg-lime-400)]" /> : <ArrowRight size={18} aria-hidden className="shrink-0 text-[var(--fg-lime-400)] transition-transform group-hover:translate-x-0.5" />}
          </Vinculo>
        </li>
      ))}
    </ul>
  );
}

function Tabla({ d }: { d: Datos }) {
  const filas = (Array.isArray(d.filas) ? d.filas : []).map((f) => (Array.isArray(f) ? f.map(t) : []));
  if (!filas.length) return null;
  const conEncabezado = d.encabezado !== false && filas.length > 1;
  const cuerpo = conEncabezado ? filas.slice(1) : filas;
  return (
    <div className="my-6">
      {t(d.titulo) && <Titulo className="mb-2 text-lg"><Inline text={t(d.titulo)} /></Titulo>}
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
        <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
          {conEncabezado && (
            <thead>
              <tr className="bg-[var(--fg-green-800)] text-[var(--text-on-brand)]">
                {filas[0].map((c, i) => (
                  <th key={i} scope="col" className="px-4 py-3 align-bottom font-bold"><Inline text={c} /></th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {cuerpo.map((f, i) => (
              <tr key={i} className="border-t border-[var(--border)] odd:bg-[var(--surface-solid)] even:bg-[var(--bg-muted)]">
                {f.map((c, j) => (
                  <td key={j} className="px-4 py-3 align-top leading-relaxed text-[var(--text-muted)]"><Inline text={c} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───────────────────────── Personas y contacto

const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
const soloTelefono = (v: string) => v.replace(/[^\d+]/g, "");
const COLUMNAS_PERSONAS = { 2: "@md:grid-cols-2", 3: "@md:grid-cols-2 @3xl:grid-cols-3", 4: "@md:grid-cols-2 @3xl:grid-cols-4" } as const;

function Personas({ d }: { d: Datos }) {
  const items = lista(d.items).filter((p) => t(p.nombre));
  if (!items.length) return null;
  return (
    <div className="@container my-8">
      {t(d.titulo) && <Titulo className="mb-4 text-lg"><Inline text={t(d.titulo)} /></Titulo>}
      <ul className={`grid grid-cols-1 gap-4 ${COLUMNAS_PERSONAS[columnas(d.columnas, 3)]}`}>
        {items.map((p, i) => {
          const foto = imagenSegura(t(p.foto));
          const tel = soloTelefono(t(p.telefono));
          return (
            <li key={i} className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-solid)] p-5 text-center">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" loading="lazy" decoding="async" className="mb-2 h-24 w-24 rounded-full border border-[var(--border)] object-cover" />
              ) : (
                <span aria-hidden className="mb-2 grid h-24 w-24 place-items-center rounded-full bg-[var(--bg-muted)] font-[var(--font-display)] text-2xl font-bold text-[var(--fg-green-800)]">{iniciales(t(p.nombre))}</span>
              )}
              <Titulo className="text-lg">{t(p.nombre)}</Titulo>
              {t(p.cargo) && <span className="block text-sm text-[var(--text-muted)]">{t(p.cargo)}</span>}
              {t(p.correo) && <a href={`mailto:${t(p.correo)}`} className="mt-1 break-all bg-transparent text-sm font-semibold text-[var(--fg-green-800)] no-underline hover:underline">{t(p.correo)}</a>}
              {tel.length >= 5 && <a href={`tel:${tel}`} className="bg-transparent text-sm font-semibold text-[var(--fg-green-800)] no-underline hover:underline">{t(p.telefono)}</a>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Contacto({ d }: { d: Datos }) {
  const tel = soloTelefono(t(d.telefono));
  const direccion = t(d.direccion);
  const filas: { Icono: typeof Phone; contenido: ReactNode }[] = [];
  if (t(d.telefono)) filas.push({ Icono: Phone, contenido: tel.length >= 5 ? <a href={`tel:${tel}`} className="bg-transparent font-semibold text-[var(--text)] no-underline hover:underline">{t(d.telefono)}</a> : t(d.telefono) });
  if (t(d.correo)) filas.push({ Icono: Mail, contenido: <a href={`mailto:${t(d.correo)}`} className="break-all bg-transparent font-semibold text-[var(--text)] no-underline hover:underline">{t(d.correo)}</a> });
  if (direccion) {
    filas.push({
      Icono: MapPin,
      contenido: (
        <>
          {direccion}{" "}
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap bg-transparent text-sm font-semibold text-[var(--fg-green-800)] no-underline hover:underline">
            Cómo llegar <ArrowUpRight size={13} aria-hidden className="inline -translate-y-px" />
          </a>
        </>
      ),
    });
  }
  if (t(d.horario)) filas.push({ Icono: Clock, contenido: t(d.horario) });
  return (
    <section className="my-6 max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] border-l-4 border-l-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-5">
      <Titulo className="text-lg">{t(d.titulo)}</Titulo>
      {t(d.cargo) && <span className="mt-0.5 block text-sm text-[var(--text-muted)]">{t(d.cargo)}</span>}
      {filas.length > 0 && (
        <ul className="mt-3 flex list-none flex-col gap-2 p-0">
          {filas.map(({ Icono, contenido }, i) => (
            <li key={i} className="flex items-start gap-3 leading-snug text-[var(--text-muted)]">
              <Icono size={17} aria-hidden className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />
              <span className="min-w-0">{contenido}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ───────────────────────── Diseño

const ESPACIOS = { pequeno: "h-4", medio: "h-10", grande: "h-20" } as const;

function Espacio({ d }: { d: Datos }) {
  return <div aria-hidden className={ESPACIOS[t(d.alto) as keyof typeof ESPACIOS] ?? ESPACIOS.medio} />;
}

export function ElementoExtra({ tipo, datos }: { tipo: TipoEsquema; datos: Datos }) {
  switch (tipo) {
    case "aviso": return <Aviso d={datos} />;
    case "cita": return <Cita d={datos} />;
    case "columnas": return <Columnas d={datos} />;
    case "botones": return <Botones d={datos} />;
    case "banner": return <Banner d={datos} />;
    case "redes": return <Redes d={datos} />;
    case "imagentexto": return <ImagenTexto d={datos} />;
    case "galeria": return <GaleriaFotos d={datos} />;
    case "audio": return <Audio d={datos} />;
    case "logos": return <Logos d={datos} />;
    case "pestanas": return <PestanasTexto d={datos} />;
    case "cifras": return <Cifras d={datos} />;
    case "pasos": return <Pasos d={datos} />;
    case "cronologia": return <Cronologia d={datos} />;
    case "caracteristicas": return <Caracteristicas d={datos} />;
    case "enlaces": return <Enlaces d={datos} />;
    case "tabla": return <Tabla d={datos} />;
    case "personas": return <Personas d={datos} />;
    case "contacto": return <Contacto d={datos} />;
    case "ficha": return <FichaSuelta d={datos} />;
    case "espaciador": return <Espacio d={datos} />;
  }
}
