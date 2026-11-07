"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, FileUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import {
  EMBED_OK, ENLACE_OK, IMAGEN_OK, normalizarUrl, normalizarVideo, tarjetaVacia,
  type ElTexto, type Elemento, type ItemLista, type Tarjeta,
} from "@/lib/cms/bloques";
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
function EditorLista({ el, cambiar }: { el: De<"lista">; cambiar: Acciones["cambiar"] }) {
  const items = el.items;
  const poner = (items: ItemLista[]) => cambiar({ ...el, items });
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    poner(n);
  };
  return (
    <div className="flex flex-col gap-2.5">
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 rounded-xl border border-[#e4e2d6] bg-white p-2.5">
            <span className="mt-2 w-5 shrink-0 text-center text-xs font-bold text-[#8a978f]">{i + 1}</span>
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
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => poner([...items, { texto: "" }])} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir texto</button>
        <button type="button" onClick={() => poner([...items, { texto: "", url: "" }])} className="ad-btn ad-btn-ghost !min-h-9"><Plus size={15} /> Añadir enlace</button>
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
          aceptar=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.csv,.zip,.mp3,.jpg,.jpeg,.png"
          texto="Subir documentos"
          icono={<FileUp size={15} />}
          onListo={(rs) => actualizar((p) => (p.tipo === "docs" ? { ...p, items: [...p.items, ...rs.map((r) => ({ nombre: r.nombre, url: r.url }))] } : p))}
        />
        <span className="text-xs text-[#5d6e65]">PDF, Excel, Word, PowerPoint, CSV, ZIP o MP3 de hasta 50 MB. También puede añadir un enlace a mano.</span>
      </div>
      <ListaItems
        items={el.items}
        onItems={(items) => cambiar({ ...el, items })}
        nombre="Documento"
        max={60}
        nuevo={() => ({ nombre: "", url: "" })}
        render={(d, i, cambio) => (
          <>
            <Campo etiqueta="Nombre">
              <input className={ctl} value={d.nombre} maxLength={200} onChange={(e) => cambio({ ...d, nombre: e.target.value })} />
            </Campo>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#11271d]">Enlace</span>
              <CampoUrl etiqueta={`Enlace del documento ${i + 1}`} valor={d.url} onCambio={(url) => cambio({ ...d, url })} placeholder="https://…" />
            </div>
          </>
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

export function EditorElemento({ el, cambiar, actualizar, carpeta }: { el: Elemento } & Acciones) {
  switch (el.tipo) {
    case "h2": case "h3": case "h4": case "p": return <EditorTexto el={el} cambiar={cambiar} />;
    case "lista": return <EditorLista el={el} cambiar={cambiar} />;
    case "button": return <EditorBoton el={el} cambiar={cambiar} />;
    case "image": return <EditorImagen el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "cards": case "carousel": return <EditorTarjetas el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "accordion": return <EditorPreguntas el={el} cambiar={cambiar} />;
    case "callout": return <EditorDestacado el={el} cambiar={cambiar} />;
    case "docs": return <EditorDocumentos el={el} cambiar={cambiar} actualizar={actualizar} carpeta={carpeta} />;
    case "embed": return <EditorVideo el={el} cambiar={cambiar} />;
    case "upload": return <EditorRecibir el={el} cambiar={cambiar} />;
    case "divider": return <p className="text-sm text-[#5d6e65]">Una línea que separa dos partes de la página. No tiene opciones.</p>;
    case "otro": return <p className="text-sm text-[#5d6e65]">Este elemento viene de la página original y no se edita aquí. Puede moverlo con las flechas o quitarlo.</p>;
  }
}
