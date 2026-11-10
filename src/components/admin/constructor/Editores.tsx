"use client";

import { useRef, useState, type ClipboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, FileUp, ImagePlus, Link2, Loader2, Plus, Table2, Trash2, Upload } from "lucide-react";
import {
  ALINEACIONES_FILA, CATALOGO, DIVISIONES, EMBED_OK, ENLACE_OK, ESPACIADOS_FILA, ESQUEMAS, FONDOS_FILA, IMAGEN_OK, NOMBRE_TIPO, columnasDe, elementoNuevo, normalizarUrl, normalizarVideo, nuevoId, problema, tarjetaVacia,
  type Division, type ElTexto, type Elemento, type ItemLista, type Tarjeta, type TipoNuevo,
} from "@/lib/cms/bloques";
import { datosDe, datosIniciales, type CampoLista, type CampoSimple, type CampoTabla, type Datos, type Esquema } from "@/lib/cms/elementos";
import { nombreConTipo, tipoDeUrl } from "@/lib/cms/documentos-tarjetas";
import { ICONOS_CARACT } from "@/components/legacy/iconos-caracteristicas";
import { CampoRico } from "./CampoRico";
import { subirArchivo } from "./subir";

// Formularios de cada elemento del constructor: se abren al seleccionar el elemento en la página.

type De<T extends Elemento["tipo"]> = Extract<Elemento, { tipo: T }>;

export type Acciones = {
  /** Reemplaza el elemento por otro (cambios al escribir). */
  cambiar: (el: Elemento) => void;
  /** Cambia el elemento partiendo de su estado más reciente (para lo que termina tarde, como una subida). */
  actualizar: (fn: (el: Elemento) => Elemento) => void;
  /** Carpeta del depósito donde se guardan los archivos de esta página. */
  carpeta: string;
};

const ctl = "ad-input font-normal";

// ───────────────────────── piezas comunes

function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#11271d]">
      {etiqueta}
      {children}
      {ayuda && <span className="text-xs font-normal text-[#5d6e65]">{ayuda}</span>}
    </label>
  );
}

function Segmentos<T extends string | number>({ etiqueta, valor, opciones, onCambio }: { etiqueta: string; valor: T; opciones: { valor: T; nombre: string }[]; onCambio: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#11271d]">{etiqueta}</span>
      <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button
            key={String(o.valor)}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            onClick={() => onCambio(o.valor)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${valor === o.valor ? "border-[#b08f4f] bg-[#f7edcf] font-semibold text-[#11271d]" : "border-[#d9d6cb] bg-white text-[#5d6e65] hover:border-[#b08f4f]"}`}
          >
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

function CampoUrl({ etiqueta, valor, onCambio, placeholder, validar = ENLACE_OK, mensaje = "No parece un enlace válido: use https://…, una ruta como /pagos o un correo.", normalizar = normalizarUrl }: {
  etiqueta: string; valor: string; onCambio: (v: string) => void; placeholder?: string; validar?: RegExp; mensaje?: string; normalizar?: (u: string) => string;
}) {
  const mal = valor.trim() !== "" && !validar.test(normalizar(valor));
  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        aria-label={etiqueta}
        aria-invalid={mal || undefined}
        className={`${ctl} ${mal ? "!border-[#e0a0a0]" : ""}`}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value)}
        onBlur={() => {
          const n = normalizar(valor);
          if (n !== valor) onCambio(n);
        }}
      />
      {mal && <span className="text-xs font-normal text-[#a33a3a]">{mensaje}</span>}
    </div>
  );
}

// Texto de varias líneas sin formato (los textos cortos de tarjetas y destacados).
function CampoSimple({ etiqueta, valor, onCambio, filas = 3, max = 700, placeholder }: { etiqueta: string; valor: string; onCambio: (v: string) => void; filas?: number; max?: number; placeholder?: string }) {
  return (
    <Campo etiqueta={etiqueta}>
      <textarea rows={filas} maxLength={max} value={valor} placeholder={placeholder} onChange={(e) => onCambio(e.target.value)} spellCheck className={`${ctl} resize-y leading-relaxed`} />
    </Campo>
  );
}

function BotonSubir({ carpeta, aceptar, multiple = false, texto, icono, onListo }: {
  carpeta: string; aceptar: string; multiple?: boolean; texto: string; icono: ReactNode; onListo: (r: { url: string; nombre: string }[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subir = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const hechos: { url: string; nombre: string }[] = [];
    const errores: string[] = [];
    for (const f of Array.from(files)) {
      setSubiendo(f.name);
      const r = await subirArchivo(f, carpeta);
      if (r.ok) hechos.push({ url: r.url, nombre: r.nombre });
      else errores.push(r.message);
    }
    setSubiendo(null);
    if (input.current) input.current.value = "";
    if (hechos.length) onListo(hechos);
    if (errores.length) setError(errores.join(" "));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`ad-btn ad-btn-ghost w-fit cursor-pointer !min-h-9 ${subiendo ? "pointer-events-none opacity-60" : ""}`}>
        {subiendo ? <Loader2 size={15} className="animate-spin" /> : icono}
        {subiendo ? `Subiendo ${subiendo.length > 26 ? `${subiendo.slice(0, 24)}…` : subiendo}` : texto}
        <input ref={input} type="file" accept={aceptar} multiple={multiple} className="sr-only" onChange={(e) => subir(e.target.files)} />
      </label>
      {error && <span role="alert" className="text-xs text-[#a33a3a]">{error}</span>}
    </div>
  );
}

function CampoImagen({ etiqueta, valor, onCambio, onSubida, carpeta }: { etiqueta: string; valor: string; onCambio: (v: string) => void; onSubida: (url: string) => void; carpeta: string }) {
  const valida = valor !== "" && IMAGEN_OK.test(valor);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#11271d]">{etiqueta}</span>
      <div className="flex flex-wrap items-start gap-2">
        {valida && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={valor} alt="" className="h-10 w-14 shrink-0 rounded-md border border-[#e4e2d6] object-cover" />
        )}
        <div className="min-w-[11rem] flex-1">
          <CampoUrl etiqueta={etiqueta} valor={valor} onCambio={onCambio} placeholder="https://… o suba un archivo" validar={IMAGEN_OK} mensaje="La dirección debe empezar con https://." />
        </div>
        <BotonSubir carpeta={carpeta} aceptar=".jpg,.jpeg,.png" texto="Subir imagen" icono={<ImagePlus size={15} />} onListo={(r) => onSubida(r[0].url)} />
      </div>
    </div>
  );
}

// Lista de partes repetidas (tarjetas, preguntas, documentos) con añadir, subir, bajar y quitar.
function ListaItems<T>({ items, onItems, nombre, nuevo, max = 24, render }: {
  items: T[]; onItems: (n: T[]) => void; nombre: string; nuevo: () => T; max?: number; render: (it: T, i: number, cambio: (n: T) => void) => ReactNode;
}) {
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onItems(n);
  };
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it, i) => (
        <div key={i} role="group" aria-label={`${nombre} ${i + 1}`} className="rounded-xl border border-[#e4e2d6] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#eeece2] px-3 py-1.5">
            <span className="text-xs font-bold text-[#5d6e65]">{nombre} {i + 1}</span>
            <span className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} className="ad-icon-btn !h-7 !w-7" aria-label={`Subir ${nombre.toLowerCase()} ${i + 1}`}><ArrowUp size={13} /></button>
              <button type="button" disabled={i === items.length - 1} onClick={() => mover(i, 1)} className="ad-icon-btn !h-7 !w-7" aria-label={`Bajar ${nombre.toLowerCase()} ${i + 1}`}><ArrowDown size={13} /></button>
              <button type="button" onClick={() => onItems(items.filter((_, j) => j !== i))} className="ad-icon-btn !h-7 !w-7 hover:!border-[#e0a0a0] hover:!text-[#a33a3a]" aria-label={`Quitar ${nombre.toLowerCase()} ${i + 1}`}><Trash2 size={13} /></button>
            </span>
          </div>
          <div className="flex flex-col gap-3 p-3">{render(it, i, (n) => onItems(items.map((x, j) => (j === i ? n : x))))}</div>
        </div>
      ))}
      <button type="button" disabled={items.length >= max} onClick={() => onItems([...items, nuevo()])} className="ad-btn ad-btn-ghost !min-h-9 w-fit">
        <Plus size={15} /> Añadir {nombre.toLowerCase()}
      </button>
    </div>
  );
}

// El icono de tipo de archivo (XLS, PDF, DOC…) con los mismos colores de las tarjetas de documentos del sitio.
function InsigniaTipo({ url }: { url: string }) {
  const tipo = tipoDeUrl(normalizarUrl(url));
  if (!tipo) {
    return (
      <span aria-hidden className="grid h-[2.6rem] w-[2.2rem] shrink-0 place-items-center rounded-md border border-dashed border-[#d9d6cb] text-[#8a978f]">
        <Link2 size={15} />
      </span>
    );
  }
  return <span className="doc-ico doc-ico-sm" data-tipo={tipo.clave} title={tipo.nombre} aria-label={tipo.nombre}>{tipo.sigla}</span>;
}

function Nota({ tono = "verde", children }: { tono?: "verde" | "ambar"; children: ReactNode }) {
  return (
    <p className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${tono === "verde" ? "border-[#cfe5d8] bg-[#f3faf6] text-[#14573a]" : "border-[#e7dcc0] bg-[#fbf6e8] text-[#6b5a26]"}`}>{children}</p>
  );
}

const DOCUMENTOS = ".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.csv,.zip,.mp3";

// ───────────────────────── un editor por tipo de elemento

function EditorTexto({ el, cambiar }: { el: ElTexto; cambiar: Acciones["cambiar"] }) {
  if (el.tipo === "p") {
    return <CampoRico etiqueta="Texto" valor={el.texto} onCambio={(t) => cambiar({ ...el, texto: t })} multilinea placeholder="Escriba el párrafo…" />;
  }
  return (
    <>
      <CampoRico etiqueta="Texto" valor={el.texto} onCambio={(t) => cambiar({ ...el, texto: t })} placeholder="Escriba el título…" />
      <Segmentos etiqueta="Tamaño" valor={el.tipo} opciones={[{ valor: "h2", nombre: "Título" }, { valor: "h3", nombre: "Subtítulo" }, { valor: "h4", nombre: "Detalle" }]} onCambio={(tipo) => cambiar({ ...el, tipo })} />
    </>
  );
}

// Lista de viñetas: cada una es un texto o un enlace (nombre y dirección en campos aparte, sin símbolos).
// Si todas son enlaces a documentos (PDF, Excel, Word…) el sitio las muestra como tarjetas de documentos; aquí se pueden subir más.
function EditorLista({ el, cambiar, actualizar, carpeta }: { el: De<"lista"> } & Acciones) {
  const items = el.items;
  const poner = (items: ItemLista[]) => cambiar({ ...el, items });
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    poner(n);
  };
  const esDoc = (it: ItemLista) => it.url !== undefined && tipoDeUrl(normalizarUrl(it.url)) !== null;
  const comoTarjetas = items.length >= 2 && items.every(esDoc);
  return (
    <div className="flex flex-col gap-2.5">
      {comoTarjetas ? (
        <Nota>Esta lista se ve como <strong>tarjetas de documentos</strong>, con vista previa y descarga. Si el Excel y el PDF tienen el mismo nombre y van seguidos, comparten tarjeta. Use «Subir documentos» para seguir añadiendo.</Nota>
      ) : items.some(esDoc) ? (
        <Nota tono="ambar">Para que se vea como tarjetas de documentos, todas las viñetas deben ser enlaces a documentos (PDF, Excel, Word…) y debe haber al menos dos.</Nota>
      ) : null}
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 rounded-xl border border-[#e4e2d6] bg-white p-2.5">
            {it.url !== undefined ? <InsigniaTipo url={it.url} /> : <span className="mt-2 w-5 shrink-0 text-center text-xs font-bold text-[#8a978f]">{i + 1}</span>}
            <div className="min-w-0 flex-1">
              {it.url !== undefined ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input aria-label={`Nombre de la viñeta ${i + 1}`} className={ctl} value={it.texto} maxLength={300} placeholder="Nombre que se ve" onChange={(e) => poner(items.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))} />
                  <CampoUrl etiqueta={`Enlace de la viñeta ${i + 1}`} valor={it.url} onCambio={(url) => poner(items.map((x, j) => (j === i ? { ...x, url } : x)))} placeholder="https://… o /ruta" />
                </div>
              ) : (
                <CampoRico etiqueta={`Viñeta ${i + 1}`} valor={it.texto} onCambio={(texto) => poner(items.map((x, j) => (j === i ? { ...x, texto } : x)))} barra="flotante" placeholder="Escriba el texto…" />
              )}
            </div>
            <span className="flex shrink-0 gap-1">
              <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} className="ad-icon-btn !h-8 !w-8" aria-label={`Subir la viñeta ${i + 1}`}><ArrowUp size={14} /></button>
              <button type="button" disabled={i === items.length - 1} onClick={() => mover(i, 1)} className="ad-icon-btn !h-8 !w-8" aria-label={`Bajar la viñeta ${i + 1}`}><ArrowDown size={14} /></button>
              <button type="button" onClick={() => poner(items.filter((_, j) => j !== i))} className="ad-icon-btn !h-8 !w-8 hover:!border-[#e0a0a0] hover:!text-[#a33a3a]" aria-label={`Quitar la viñeta ${i + 1}`}><Trash2 size={14} /></button>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-start gap-2">
        <BotonSubir
          carpeta={carpeta}
          multiple
          aceptar={DOCUMENTOS}
          texto="Subir documentos"
          icono={<FileUp size={15} />}
          onListo={(rs) =>
            actualizar((p) =>
              p.tipo === "lista"
                ? { ...p, items: [...p.items.filter((x) => x.url !== undefined || x.texto.trim() !== ""), ...rs.map((r) => ({ texto: nombreConTipo(r.nombre, r.url), url: r.url }))] }
                : p,
            )
          }
        />
        <button type="button" onClick={() => poner([...items, { texto: "", url: "" }])} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir enlace</button>
        <button type="button" onClick={() => poner([...items, { texto: "" }])} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir texto</button>
      </div>
    </div>
  );
}

function EditorBoton({ el, cambiar }: { el: De<"button">; cambiar: Acciones["cambiar"] }) {
  return (
    <>
      <Campo etiqueta="Texto del botón">
        <input className={ctl} value={el.texto} maxLength={80} placeholder="Por ejemplo: Descargar el formulario" onChange={(e) => cambiar({ ...el, texto: e.target.value })} />
      </Campo>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-[#11271d]">Enlace</span>
        <CampoUrl etiqueta="Enlace del botón" valor={el.href} onCambio={(href) => cambiar({ ...el, href })} placeholder="https://… o una página del portal, como /pagos" />
      </div>
      <Segmentos etiqueta="Estilo" valor={el.estilo} opciones={[{ valor: "solido", nombre: "Relleno" }, { valor: "borde", nombre: "Solo borde" }]} onCambio={(estilo) => cambiar({ ...el, estilo })} />
    </>
  );
}

function EditorImagen({ el, cambiar, actualizar, carpeta }: { el: De<"image"> } & Acciones) {
  return (
    <>
      <CampoImagen etiqueta="Imagen" valor={el.src} onCambio={(src) => cambiar({ ...el, src })} onSubida={(url) => actualizar((p) => (p.tipo === "image" ? { ...p, src: url } : p))} carpeta={carpeta} />
      <Campo etiqueta="Descripción de la imagen" ayuda="La leen los lectores de pantalla y aparece si la imagen no carga.">
        <input className={ctl} value={el.alt} maxLength={250} placeholder="Qué se ve en la foto" onChange={(e) => cambiar({ ...el, alt: e.target.value })} />
      </Campo>
      <Campo etiqueta="Pie de foto (opcional)">
        <input className={ctl} value={el.pie} maxLength={300} onChange={(e) => cambiar({ ...el, pie: e.target.value })} />
      </Campo>
    </>
  );
}

const conTarjeta = (i: number, parche: Partial<Tarjeta>) => (prev: Elemento): Elemento =>
  prev.tipo === "cards" || prev.tipo === "carousel" ? { ...prev, items: prev.items.map((x, j) => (j === i ? { ...x, ...parche } : x)) } : prev;

function EditorTarjetas({ el, cambiar, actualizar, carpeta }: { el: De<"cards"> | De<"carousel"> } & Acciones) {
  return (
    <>
      {el.tipo === "cards" ? (
        <Segmentos etiqueta="Tarjetas por fila" valor={el.columnas} opciones={[{ valor: 2, nombre: "2" }, { valor: 3, nombre: "3" }, { valor: 4, nombre: "4" }]} onCambio={(columnas) => cambiar({ ...el, columnas })} />
      ) : (
        <label className="flex items-center gap-2 text-sm font-semibold text-[#11271d]">
          <input type="checkbox" checked={el.auto} onChange={(e) => cambiar({ ...el, auto: e.target.checked })} /> Que avance solo cada pocos segundos
        </label>
      )}
      <ListaItems
        items={el.items}
        onItems={(items) => cambiar({ ...el, items })}
        nombre={el.tipo === "cards" ? "Tarjeta" : "Diapositiva"}
        nuevo={tarjetaVacia}
        render={(t, i, cambio) => (
          <>
            <Campo etiqueta="Título">
              <input className={ctl} value={t.titulo} maxLength={140} onChange={(e) => cambio({ ...t, titulo: e.target.value })} />
            </Campo>
            <CampoSimple etiqueta="Texto" valor={t.texto} onCambio={(texto) => cambio({ ...t, texto })} />
            <CampoImagen etiqueta="Imagen (opcional)" valor={t.imagen} onCambio={(imagen) => cambio({ ...t, imagen })} onSubida={(url) => actualizar(conTarjeta(i, { imagen: url }))} carpeta={carpeta} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#11271d]">Enlace (opcional)</span>
                <CampoUrl etiqueta={`Enlace de la ${el.tipo === "cards" ? "tarjeta" : "diapositiva"} ${i + 1}`} valor={t.enlace} onCambio={(enlace) => cambio({ ...t, enlace })} placeholder="https://… o /ruta" />
              </div>
              <Campo etiqueta="Texto del enlace">
                <input className={ctl} value={t.boton} maxLength={40} placeholder="Ver más" onChange={(e) => cambio({ ...t, boton: e.target.value })} />
              </Campo>
            </div>
          </>
        )}
      />
    </>
  );
}

function EditorPreguntas({ el, cambiar }: { el: De<"accordion"> } & Pick<Acciones, "cambiar">) {
  return (
    <ListaItems
      items={el.items}
      onItems={(items) => cambiar({ ...el, items })}
      nombre="Pregunta"
      max={40}
      nuevo={() => ({ titulo: "", texto: "" })}
      render={(it, _i, cambio) => (
        <>
          <Campo etiqueta="Pregunta">
            <input className={ctl} value={it.titulo} maxLength={200} onChange={(e) => cambio({ ...it, titulo: e.target.value })} />
          </Campo>
          <CampoRico etiqueta="Respuesta" valor={it.texto} onCambio={(texto) => cambio({ ...it, texto })} multilinea placeholder="Escriba la respuesta…" />
        </>
      )}
    />
  );
}

function EditorDestacado({ el, cambiar }: { el: De<"callout"> } & Pick<Acciones, "cambiar">) {
  return (
    <>
      <Campo etiqueta="Título">
        <input className={ctl} value={el.titulo} maxLength={160} placeholder="El mensaje principal" onChange={(e) => cambiar({ ...el, titulo: e.target.value })} />
      </Campo>
      <CampoSimple etiqueta="Texto (opcional)" valor={el.texto} onCambio={(texto) => cambiar({ ...el, texto })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Texto del botón">
          <input className={ctl} value={el.boton} maxLength={40} placeholder="Por ejemplo: Inscribirme" onChange={(e) => cambiar({ ...el, boton: e.target.value })} />
        </Campo>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#11271d]">Enlace del botón</span>
          <CampoUrl etiqueta="Enlace del botón" valor={el.enlace} onCambio={(enlace) => cambiar({ ...el, enlace })} placeholder="https://… o /ruta" />
        </div>
      </div>
      <Segmentos etiqueta="Color" valor={el.tono} opciones={[{ valor: "verde", nombre: "Verde oscuro" }, { valor: "claro", nombre: "Claro" }, { valor: "dorado", nombre: "Amarillo" }]} onCambio={(tono) => cambiar({ ...el, tono })} />
    </>
  );
}

function EditorDocumentos({ el, cambiar, actualizar, carpeta }: { el: De<"docs"> } & Acciones) {
  return (
    <>
      <Campo etiqueta="Título de la lista (opcional)">
        <input className={ctl} value={el.titulo} maxLength={160} onChange={(e) => cambiar({ ...el, titulo: e.target.value })} />
      </Campo>
      <div className="flex flex-col gap-1.5">
        <BotonSubir
          carpeta={carpeta}
          multiple
          aceptar={DOCUMENTOS}
          texto="Subir documentos"
          icono={<FileUp size={15} />}
          onListo={(rs) => actualizar((p) => (p.tipo === "docs" ? { ...p, items: [...p.items, ...rs.map((r) => ({ nombre: nombreConTipo(r.nombre, r.url), url: r.url }))] } : p))}
        />
        <span className="text-xs text-[#5d6e65]">PDF, Excel, Word, PowerPoint, CSV, ZIP o MP3 de hasta 50 MB. También puede añadir un enlace a mano.</span>
      </div>
      <Nota>Los documentos se ven como <strong>tarjetas</strong>, con el tipo de archivo, vista previa y descarga. Si dos archivos seguidos tienen el mismo nombre (por ejemplo, el Excel y el PDF), comparten tarjeta.</Nota>
      <ListaItems
        items={el.items}
        onItems={(items) => cambiar({ ...el, items })}
        nombre="Documento"
        max={60}
        nuevo={() => ({ nombre: "", url: "" })}
        render={(d, i, cambio) => (
          <div className="flex items-start gap-3">
            <InsigniaTipo url={d.url} />
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <Campo etiqueta="Nombre">
                <input className={ctl} value={d.nombre} maxLength={200} onChange={(e) => cambio({ ...d, nombre: e.target.value })} />
              </Campo>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#11271d]">Enlace</span>
                <CampoUrl etiqueta={`Enlace del documento ${i + 1}`} valor={d.url} onCambio={(url) => cambio({ ...d, url })} placeholder="https://…" />
              </div>
            </div>
          </div>
        )}
      />
    </>
  );
}

function EditorVideo({ el, cambiar }: { el: De<"embed"> } & Pick<Acciones, "cambiar">) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#11271d]">Dirección</span>
      <CampoUrl
        etiqueta="Dirección del video o tablero"
        valor={el.url}
        onCambio={(url) => cambiar({ ...el, url })}
        placeholder="https://www.youtube.com/watch?v=…"
        validar={EMBED_OK}
        mensaje="La dirección debe empezar con https:// o http://."
        normalizar={normalizarVideo}
      />
      <span className="text-xs text-[#5d6e65]">Un enlace de YouTube se muestra como video. Cualquier otro (documento, presentación, tablero) se muestra como una ficha con enlace.</span>
    </div>
  );
}

function EditorRecibir({ el, cambiar }: { el: De<"upload"> } & Pick<Acciones, "cambiar">) {
  return (
    <>
      <Campo etiqueta="Texto del botón">
        <input className={ctl} value={el.texto} maxLength={80} placeholder="Cargar documentos" onChange={(e) => cambiar({ ...el, texto: e.target.value })} />
      </Campo>
      <p className="text-xs leading-relaxed text-[#5d6e65]">Los visitantes podrán cargar PDF, Word, Excel, JPG o PNG de hasta 10 MB (hasta 5 archivos a la vez). Los archivos llegan a la carpeta «recibidos» del almacenamiento del portal.</p>
    </>
  );
}

// ───────────────────────── elementos descritos por esquema (src/lib/cms/elementos.ts)

function CampoArchivo({ etiqueta, valor, onCambio, onSubida, carpeta, aceptar, placeholder }: {
  etiqueta: string; valor: string; onCambio: (v: string) => void; onSubida: (url: string) => void; carpeta: string; aceptar: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#11271d]">{etiqueta}</span>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-[11rem] flex-1">
          <CampoUrl etiqueta={etiqueta} valor={valor} onCambio={onCambio} placeholder={placeholder} />
        </div>
        <BotonSubir carpeta={carpeta} aceptar={aceptar} texto="Subir archivo" icono={<Upload size={15} />} onListo={(r) => onSubida(r[0].url)} />
      </div>
    </div>
  );
}

function SelectorIcono({ etiqueta, valor, opciones, onCambio }: { etiqueta: string; valor: string; opciones: { valor: string; nombre: string }[]; onCambio: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#11271d]">{etiqueta}</span>
      <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-1.5">
        {opciones.map((o) => {
          const Icono = ICONOS_CARACT[o.valor];
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={valor === o.valor}
              aria-label={o.nombre}
              title={o.nombre}
              onClick={() => onCambio(o.valor)}
              className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${valor === o.valor ? "border-[#b08f4f] bg-[#f7edcf] text-[#11271d]" : "border-[#d9d6cb] bg-white text-[#5d6e65] hover:border-[#b08f4f]"}`}
            >
              {Icono ? <Icono size={18} aria-hidden /> : o.nombre.slice(0, 1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Un campo simple del esquema: el formulario sale del tipo de campo.
function CampoEsquema({ c, valor, onCambio, onSubida, carpeta }: { c: CampoSimple; valor: unknown; onCambio: (v: unknown) => void; onSubida: (v: unknown) => void; carpeta: string }) {
  const v = typeof valor === "string" ? valor : "";
  switch (c.tipo) {
    case "texto": {
      const mal = v.trim() !== "" && c.patron !== undefined && !c.patron.re.test(v.trim());
      return (
        <Campo etiqueta={c.etiqueta} ayuda={mal ? undefined : c.ayuda}>
          <input className={`${ctl} ${mal ? "!border-[#e0a0a0]" : ""}`} value={v} maxLength={c.max} placeholder={c.placeholder} aria-invalid={mal || undefined} onChange={(e) => onCambio(e.target.value)} />
          {mal && c.patron && <span className="text-xs font-normal text-[#a33a3a]">{c.patron.mensaje}</span>}
        </Campo>
      );
    }
    case "parrafo":
      return c.formato ? (
        <CampoRico etiqueta={c.etiqueta} valor={v} onCambio={onCambio} multilinea placeholder={c.placeholder} />
      ) : (
        <CampoSimple etiqueta={c.etiqueta} valor={v} onCambio={onCambio} filas={c.filas} max={c.max} placeholder={c.placeholder} />
      );
    case "enlace":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#11271d]">{c.etiqueta}</span>
          <CampoUrl etiqueta={c.etiqueta} valor={v} onCambio={onCambio} placeholder={c.placeholder ?? "https://… o /ruta"} />
        </div>
      );
    case "imagen":
      return <CampoImagen etiqueta={c.etiqueta} valor={v} onCambio={onCambio} onSubida={onSubida} carpeta={carpeta} />;
    case "archivo":
      return <CampoArchivo etiqueta={c.etiqueta} valor={v} onCambio={onCambio} onSubida={onSubida} carpeta={carpeta} aceptar={c.aceptar} placeholder={c.placeholder} />;
    case "opcion":
      if (c.k === "icono") return <SelectorIcono etiqueta={c.etiqueta} valor={v} opciones={c.opciones} onCambio={onCambio} />;
      return c.opciones.length <= 4 ? (
        <Segmentos etiqueta={c.etiqueta} valor={v} opciones={c.opciones} onCambio={onCambio} />
      ) : (
        <Campo etiqueta={c.etiqueta}>
          <select className={ctl} value={v} onChange={(e) => onCambio(e.target.value)}>
            {c.opciones.map((o) => <option key={o.valor} value={o.valor}>{o.nombre}</option>)}
          </select>
        </Campo>
      );
    case "sino":
      return (
        <label className="flex items-center gap-2 text-sm font-semibold text-[#11271d]">
          <input type="checkbox" checked={valor === true} onChange={(e) => onCambio(e.target.checked)} /> {c.etiqueta}
        </label>
      );
  }
}

const sinContenido = (c: CampoLista, it: Datos) => c.campos.every((x) => x.tipo === "opcion" || x.tipo === "sino" || String(it[x.k] ?? "").trim() === "");

function ListaEsquema({ c, valor, onCambio, ponerEnItem, anadirSubidas, carpeta }: {
  c: CampoLista; valor: unknown; onCambio: (v: Datos[]) => void; ponerEnItem: (i: number, sub: string, v: unknown) => void; anadirSubidas: (rs: { url: string; nombre: string }[]) => void; carpeta: string;
}) {
  const items = (Array.isArray(valor) ? valor : []) as Datos[];
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-[#11271d]">{c.etiqueta}</span>
      {c.subirVarias && (
        <div className="flex flex-col gap-1.5">
          <BotonSubir carpeta={carpeta} multiple aceptar=".jpg,.jpeg,.png" texto="Subir varias imágenes" icono={<ImagePlus size={15} />} onListo={anadirSubidas} />
          <span className="text-xs text-[#5d6e65]">Cada imagen que suba se añade como una parte nueva (JPG o PNG).</span>
        </div>
      )}
      <ListaItems
        items={items}
        onItems={onCambio}
        nombre={c.nombreItem}
        max={c.max}
        nuevo={() => datosDe(c.campos)}
        render={(it, i, cambio) => (
          <>
            {c.campos.map((sub) => (
              <CampoEsquema key={sub.k} c={sub} valor={it[sub.k]} onCambio={(v) => cambio({ ...it, [sub.k]: v })} onSubida={(v) => ponerEnItem(i, sub.k, v)} carpeta={carpeta} />
            ))}
          </>
        )}
      />
    </div>
  );
}

// Tabla que se edita como una hoja de cálculo: una celda por casilla, filas y columnas que se añaden y se quitan, y se pueden pegar celdas copiadas de Excel.
function EditorTablaGrid({ c, valor, encabezado, onCambio }: { c: CampoTabla; valor: unknown; encabezado: boolean; onCambio: (v: string[][]) => void }) {
  const base = (Array.isArray(valor) ? valor : []).map((f) => (Array.isArray(f) ? f.map((x) => (typeof x === "string" ? x : "")) : []));
  const columnas = Math.max(1, ...base.map((f) => f.length));
  const filas = (base.length ? base : [[]]).map((f) => Array.from({ length: columnas }, (_, i) => f[i] ?? ""));

  const poner = (r: number, k: number, v: string) => onCambio(filas.map((f, i) => (i === r ? f.map((x, j) => (j === k ? v : x)) : f)));
  const anadirFila = () => filas.length < c.maxFilas && onCambio([...filas, Array.from({ length: columnas }, () => "")]);
  const anadirColumna = () => columnas < c.maxColumnas && onCambio(filas.map((f) => [...f, ""]));
  const quitarFila = (r: number) => filas.length > 1 && onCambio(filas.filter((_, i) => i !== r));
  const quitarColumna = (k: number) => columnas > 1 && onCambio(filas.map((f) => f.filter((_, j) => j !== k)));
  const mover = (r: number, d: -1 | 1) => {
    const j = r + d;
    if (j < 0 || j >= filas.length) return;
    const n = [...filas];
    [n[r], n[j]] = [n[j], n[r]];
    onCambio(n);
  };
  const pegar = (e: ClipboardEvent<HTMLTextAreaElement>, r: number, k: number) => {
    const texto = e.clipboardData.getData("text/plain");
    if (!/[\t\n]/.test(texto)) return; // un valor suelto se pega como siempre
    e.preventDefault();
    const pegadas = texto.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((f) => f.split("\t"));
    const nCols = Math.min(c.maxColumnas, Math.max(columnas, k + Math.max(...pegadas.map((f) => f.length))));
    const nFilas = Math.min(c.maxFilas, Math.max(filas.length, r + pegadas.length));
    const nueva = Array.from({ length: nFilas }, (_, i) => Array.from({ length: nCols }, (_, j) => filas[i]?.[j] ?? ""));
    pegadas.forEach((f, i) =>
      f.forEach((x, j) => {
        if (r + i < nFilas && k + j < nCols) nueva[r + i][k + j] = x.slice(0, c.maxCelda);
      }),
    );
    onCambio(nueva);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl border border-[#e4e2d6] bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-8" />
              {filas[0].map((_, k) => (
                <th key={k} className="p-1 text-center">
                  <button type="button" disabled={columnas <= 1} onClick={() => quitarColumna(k)} className="ad-icon-btn !h-7 !w-7 hover:!border-[#e0a0a0] hover:!text-[#a33a3a]" aria-label={`Quitar la columna ${k + 1}`} title={`Quitar la columna ${k + 1}`}><Trash2 size={13} /></button>
                </th>
              ))}
              <th className="w-[6.5rem]" />
            </tr>
          </thead>
          <tbody>
            {filas.map((f, r) => (
              <tr key={r} className="border-t border-[#eeece2]">
                <td className="text-center text-[0.7rem] font-bold text-[#8a978f]">{r + 1}</td>
                {f.map((x, k) => (
                  <td key={k} className="min-w-[8.5rem] p-1">
                    <textarea
                      rows={1}
                      maxLength={c.maxCelda}
                      value={x}
                      aria-label={`Fila ${r + 1}, columna ${k + 1}`}
                      onChange={(e) => poner(r, k, e.target.value)}
                      onPaste={(e) => pegar(e, r, k)}
                      className={`${ctl} min-h-[2.4rem] resize-y !py-1.5 text-sm ${encabezado && r === 0 ? "!bg-[#eef6f1] font-bold" : ""}`}
                    />
                  </td>
                ))}
                <td className="whitespace-nowrap p-1 text-right">
                  <button type="button" disabled={r === 0} onClick={() => mover(r, -1)} className="ad-icon-btn !h-7 !w-7" aria-label={`Subir la fila ${r + 1}`}><ArrowUp size={13} /></button>{" "}
                  <button type="button" disabled={r === filas.length - 1} onClick={() => mover(r, 1)} className="ad-icon-btn !h-7 !w-7" aria-label={`Bajar la fila ${r + 1}`}><ArrowDown size={13} /></button>{" "}
                  <button type="button" disabled={filas.length <= 1} onClick={() => quitarFila(r)} className="ad-icon-btn !h-7 !w-7 hover:!border-[#e0a0a0] hover:!text-[#a33a3a]" aria-label={`Quitar la fila ${r + 1}`}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={filas.length >= c.maxFilas} onClick={anadirFila} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir fila</button>
        <button type="button" disabled={columnas >= c.maxColumnas} onClick={anadirColumna} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir columna</button>
        <span className="text-xs text-[#5d6e65]">Hasta {c.maxFilas} filas y {c.maxColumnas} columnas. Puede pegar celdas copiadas desde Excel.</span>
      </div>
    </div>
  );
}

function EditorEsquema({ el, cambiar, actualizar, carpeta }: { el: Extract<Elemento, { datos: Datos }> } & Acciones) {
  const esq = ESQUEMAS[el.tipo] as Esquema;
  const poner = (k: string, v: unknown) => cambiar({ ...el, datos: { ...el.datos, [k]: v } });
  // Lo que termina tarde (una subida) se aplica sobre el estado más reciente del elemento.
  const ponerTarde = (k: string, v: unknown) => actualizar((p) => ("datos" in p ? { ...p, datos: { ...p.datos, [k]: v } } : p));
  const ponerEnItem = (k: string, i: number, sub: string, v: unknown) =>
    actualizar((p) =>
      "datos" in p ? { ...p, datos: { ...p.datos, [k]: ((Array.isArray(p.datos[k]) ? p.datos[k] : []) as Datos[]).map((it, j) => (j === i ? { ...it, [sub]: v } : it)) } } : p,
    );
  const anadirSubidas = (c: CampoLista) => (rs: { url: string; nombre: string }[]) =>
    actualizar((p) => {
      if (!("datos" in p) || !c.subirVarias) return p;
      const { campo, nombre } = c.subirVarias;
      const actuales = ((Array.isArray(p.datos[c.k]) ? p.datos[c.k] : []) as Datos[]).filter((it) => !sinContenido(c, it));
      const nuevas = rs.map((r) => ({ ...datosDe(c.campos), [campo]: r.url, ...(nombre ? { [nombre]: r.nombre } : {}) }));
      return { ...p, datos: { ...p.datos, [c.k]: [...actuales, ...nuevas].slice(0, c.max) } };
    });

  // Las opciones seguidas (columnas, alineación, color…) van juntas en una fila.
  const grupos: (typeof esq.campos[number] | (typeof esq.campos[number])[])[] = [];
  for (const c of esq.campos) {
    const ultimo = grupos[grupos.length - 1];
    if (c.tipo === "opcion" && c.k !== "icono") {
      if (Array.isArray(ultimo)) ultimo.push(c);
      else grupos.push([c]);
    } else grupos.push(c);
  }
  const campo = (c: typeof esq.campos[number]) => {
    if (c.tipo === "lista") {
      return <ListaEsquema key={c.k} c={c} valor={el.datos[c.k]} onCambio={(v) => poner(c.k, v)} ponerEnItem={(i, sub, v) => ponerEnItem(c.k, i, sub, v)} anadirSubidas={anadirSubidas(c)} carpeta={carpeta} />;
    }
    if (c.tipo === "tabla") {
      return (
        <div key={c.k} className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#11271d]">{c.etiqueta}</span>
          <EditorTablaGrid c={c} valor={el.datos[c.k]} encabezado={el.datos.encabezado !== false} onCambio={(v) => poner(c.k, v)} />
        </div>
      );
    }
    return <CampoEsquema key={c.k} c={c} valor={el.datos[c.k]} onCambio={(v) => poner(c.k, v)} onSubida={(v) => ponerTarde(c.k, v)} carpeta={carpeta} />;
  };
  return (
    <>
      {grupos.map((g, i) =>
        Array.isArray(g) ? (
          <div key={`o${i}`} className="flex flex-wrap gap-x-8 gap-y-3">{g.map(campo)}</div>
        ) : (
          campo(g)
        ),
      )}
      {esq.siempre && <p className="text-xs text-[#5d6e65]">Este elemento no lleva contenido: solo deja un espacio en blanco entre dos partes de la página.</p>}
    </>
  );
}

// Un elemento que viene de la página original y no se edita aquí. Una tabla se puede convertir en una tabla editable.
function EditorOtro({ el, cambiar }: { el: Extract<Elemento, { tipo: "otro" }>; cambiar: Acciones["cambiar"] }) {
  const filas = el.bloque.t === "table" && Array.isArray(el.bloque.rows) ? el.bloque.rows : null;
  const cabe = filas !== null && filas.length <= 40 && filas.every((f) => f.length <= 8);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#5d6e65]">Este elemento viene de la página original y no se edita aquí. Puede moverlo con las flechas o quitarlo.</p>
      {filas && (
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            disabled={!cabe}
            onClick={() => cambiar({ id: el.id, tipo: "tabla", datos: { ...datosIniciales(ESQUEMAS.tabla), filas: filas.map((f) => [...f]) } })}
            className="ad-btn ad-btn-ghost !min-h-9"
          >
            <Table2 size={15} /> Convertir en tabla editable
          </button>
          <span className="text-xs text-[#5d6e65]">{cabe ? "Se podrá editar celda por celda y se verá siempre como tabla (no como tarjetas)." : "Es demasiado grande para convertirla (hasta 40 filas y 8 columnas)."}</span>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── fila de columnas

const FONDOS_NOMBRE: Record<string, string> = { ninguno: "Sin fondo", suave: "Verde suave", color: "Verde", oscuro: "Oscuro", degradado: "Degradado", imagen: "Imagen" };
const ESPACIOS_NOMBRE: Record<string, string> = { ninguno: "Ninguno", pequeno: "Pequeño", medio: "Mediano", grande: "Grande" };
type ElFila = De<"fila">;
const AGREGABLES = CATALOGO.filter((c) => c.tipo !== "fila" && c.tipo !== ("parte" as TipoNuevo));

function EditorFila({ el, cambiar, actualizar, carpeta }: { el: ElFila } & Acciones) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const poner = (cols: Elemento[][]) => cambiar({ ...el, cols });
  const dividir = (d: Division) => {
    const n = columnasDe(d);
    const cols = Array.from({ length: n }, (_, k) => el.cols[k] ?? []);
    // Si hay menos columnas que antes, lo de las que sobran pasa a la última: no se pierde nada.
    for (let k = n; k < el.cols.length; k++) cols[n - 1] = [...cols[n - 1], ...el.cols[k]];
    cambiar({ ...el, division: d, cols });
  };
  const enColumna = (k: number, fn: (c: Elemento[]) => Elemento[]) => poner(el.cols.map((c, i) => (i === k ? fn(c) : c)));
  const mover = (k: number, i: number, d: -1 | 1) =>
    enColumna(k, (c) => {
      const j = i + d;
      if (j < 0 || j >= c.length) return c;
      const n = [...c];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  // Lo que termina tarde (una subida) se aplica sobre el estado más reciente de la fila, buscando el elemento por su id.
  const actualizarHijo = (id: string) => (fn: (x: Elemento) => Elemento) =>
    actualizar((f) => (f.tipo === "fila" ? { ...f, cols: f.cols.map((c) => c.map((x) => (x.id === id ? fn(x) : x))) } : f));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-[#11271d]">Cómo se divide (sobre 12)</span>
        <div role="radiogroup" aria-label="División de la fila" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {DIVISIONES.map((d) => (
            <button key={d} type="button" role="radio" aria-checked={el.division === d} onClick={() => dividir(d)} title={d.replaceAll("-", " · ")}
              className={`flex flex-col gap-1.5 rounded-lg border p-2 transition-colors ${el.division === d ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white hover:border-[#b08f4f]"}`}>
              <span className="flex h-5 gap-0.5">
                {d.split("-").map((n, i) => <span key={i} style={{ flex: Number(n) }} className="rounded-sm bg-[#4f9a2a]/70" />)}
              </span>
              <span className="text-center text-xs font-semibold text-[#5d6e65]">{d.replaceAll("-", " · ")}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Fondo">
          <select className={ctl} value={el.fondo} onChange={(e) => cambiar({ ...el, fondo: e.target.value as ElFila["fondo"] })}>
            {FONDOS_FILA.map((f) => <option key={f} value={f}>{FONDOS_NOMBRE[f]}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Espacio alrededor">
          <select className={ctl} value={el.espaciado} onChange={(e) => cambiar({ ...el, espaciado: e.target.value as ElFila["espaciado"] })}>
            {ESPACIADOS_FILA.map((f) => <option key={f} value={f}>{ESPACIOS_NOMBRE[f]}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Alinear las columnas">
          <select className={ctl} value={el.alinear} onChange={(e) => cambiar({ ...el, alinear: e.target.value as ElFila["alinear"] })}>
            {ALINEACIONES_FILA.map((f) => <option key={f} value={f}>{f === "arriba" ? "Arriba" : "Al centro"}</option>)}
          </select>
        </Campo>
      </div>
      {el.fondo === "imagen" && (
        <CampoImagen etiqueta="Imagen de fondo" valor={el.imagen} onCambio={(v) => cambiar({ ...el, imagen: v })} onSubida={(url) => actualizar((f) => (f.tipo === "fila" ? { ...f, imagen: url } : f))} carpeta={carpeta} />
      )}

      <div className="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
        {el.cols.map((col, k) => (
          <section key={k} className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#e4e2d6] bg-white p-3" aria-label={`Columna ${k + 1}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-[#5d6e65]">Columna {k + 1} · {el.division.split("-")[k]}/12</p>
            {col.map((x, i) => {
              const aviso = problema(x);
              const abre = abierto === x.id;
              return (
                <div key={x.id} className="rounded-lg border border-[#e4e2d6] bg-[#faf9f4]">
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <button type="button" onClick={() => setAbierto(abre ? null : x.id)} aria-expanded={abre} className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
                      {x.tipo === "otro" ? NOMBRE_TIPO.otro : NOMBRE_TIPO[x.tipo]}
                      {aviso && <span className="ml-2 text-xs font-normal text-[#a36a00]">incompleto</span>}
                    </button>
                    <button type="button" onClick={() => mover(k, i, -1)} disabled={i === 0} aria-label="Subir" className="ad-icon-btn !h-7 !w-7"><ArrowUp size={13} /></button>
                    <button type="button" onClick={() => mover(k, i, 1)} disabled={i === col.length - 1} aria-label="Bajar" className="ad-icon-btn !h-7 !w-7"><ArrowDown size={13} /></button>
                    <button type="button" onClick={() => enColumna(k, (c) => [...c.slice(0, i + 1), { ...x, id: nuevoId() }, ...c.slice(i + 1)])} aria-label="Duplicar" className="ad-icon-btn !h-7 !w-7"><Plus size={13} /></button>
                    <button type="button" onClick={() => enColumna(k, (c) => c.filter((y) => y.id !== x.id))} aria-label="Quitar" className="ad-icon-btn !h-7 !w-7 hover:!text-[#a33a3a]"><Trash2 size={13} /></button>
                  </div>
                  {abre && (
                    <div className="border-t border-[#eeece2] p-3">
                      <EditorElemento el={x} cambiar={(n) => enColumna(k, (c) => c.map((y) => (y.id === x.id ? n : y)))} actualizar={actualizarHijo(x.id)} carpeta={carpeta} />
                    </div>
                  )}
                </div>
              );
            })}
            <select
              aria-label={`Añadir un elemento a la columna ${k + 1}`}
              className={`${ctl} !text-sm`}
              value=""
              onChange={(e) => {
                const tipo = e.target.value as TipoNuevo;
                if (!tipo) return;
                const nuevo = elementoNuevo(tipo);
                enColumna(k, (c) => [...c, nuevo]);
                setAbierto(nuevo.id);
              }}
            >
              <option value="">+ Añadir un elemento…</option>
              {AGREGABLES.map((c) => <option key={c.tipo} value={c.tipo}>{c.nombre}</option>)}
            </select>
          </section>
        ))}
      </div>
    </div>
  );
}

export function EditorElemento({ el, cambiar, actualizar, carpeta }: { el: Elemento } & Acciones) {
  switch (el.tipo) {
    case "h2": case "h3": case "h4": case "p": return <EditorTexto el={el} cambiar={cambiar} />;
    case "lista": return <EditorLista el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "button": return <EditorBoton el={el} cambiar={cambiar} />;
    case "image": return <EditorImagen el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "cards": case "carousel": return <EditorTarjetas el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "accordion": return <EditorPreguntas el={el} cambiar={cambiar} />;
    case "callout": return <EditorDestacado el={el} cambiar={cambiar} />;
    case "docs": return <EditorDocumentos el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "embed": return <EditorVideo el={el} cambiar={cambiar} />;
    case "upload": return <EditorRecibir el={el} cambiar={cambiar} />;
    case "fila": return <EditorFila el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "divider": return <p className="text-sm text-[#5d6e65]">Una línea que separa dos partes de la página. No tiene opciones.</p>;
    case "otro": return <EditorOtro el={el} cambiar={cambiar} />;
    default: return "datos" in el ? <EditorEsquema el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} /> : null;
  }
}
