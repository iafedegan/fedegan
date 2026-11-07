"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import {
  AlertTriangle, AppWindow, ArrowDown, ArrowUp, BadgeCheck, Building2, ChartColumn, ChevronRight, Columns3, ContactRound, Copy, Eye, GalleryHorizontal, GripVertical, Headphones,
  Heading2, Heading3, Image as ImageIcon, Images, Info, LayoutGrid, Link2, List, ListCollapse, ListOrdered, Megaphone, Milestone, Minus, MousePointerClick, MoveVertical, Paperclip,
  PanelLeft, PanelTop, Pencil, Puzzle, Quote, Redo2, Search, Share2, SquareMousePointer, Table2, Trash2, Type, Undo2, Upload, UsersRound, Video, X, type LucideIcon,
} from "lucide-react";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { CATALOGO, ESQUEMAS, GRUPOS, NOMBRE_TIPO, PLANTILLAS, aBloques, elementoNuevo, nuevoId, problema, type Elemento, type TipoNuevo } from "@/lib/cms/bloques";
import { TIPOS_ESQUEMA } from "@/lib/cms/elementos";
import { EditorElemento } from "./Editores";

// Constructor de páginas: a la izquierda los elementos disponibles; a la derecha la página, donde se sueltan,
// se ordenan y se configuran. Todo queda en el navegador hasta que el editor pulse «Publicar cambios».

const ICONO_BASE: Record<string, LucideIcon> = {
  h2: Heading2, h3: Heading3, h4: Heading3, p: Type, lista: List, button: MousePointerClick, callout: Megaphone, cards: LayoutGrid,
  carousel: GalleryHorizontal, accordion: ListCollapse, image: ImageIcon, embed: Video, divider: Minus, docs: Paperclip, upload: Upload, otro: Puzzle,
};
// Los iconos que piden los esquemas de src/lib/cms/elementos.ts (por su nombre en lucide-react).
const ICONO_ESQUEMA: Record<string, LucideIcon> = {
  Info, Quote, Columns3, SquareMousePointer, PanelTop, Share2, PanelLeft, Images, Headphones, Building2, AppWindow, ChartColumn, ListOrdered, Milestone, BadgeCheck, Link2, Table2,
  UsersRound, ContactRound, MoveVertical,
};
const ICONOS: Record<string, LucideIcon> = {
  ...ICONO_BASE,
  ...Object.fromEntries(TIPOS_ESQUEMA.map((t) => [t, ICONO_ESQUEMA[ESQUEMAS[t].icono] ?? Puzzle])),
};

type Arrastre = { tipo: "nuevo"; elemento: TipoNuevo } | { tipo: "mover"; id: string };

// ───────────────────────── paleta

const sinAcentos = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Paleta({ onAnadir, onInicio, onFin }: { onAnadir: (t: TipoNuevo) => void; onInicio: (t: TipoNuevo, e: DragEvent) => void; onFin: () => void }) {
  // En pantallas angostas la paleta se puede plegar para dejar sitio a la página.
  const [abierta, setAbierta] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [cerrados, setCerrados] = useState<Set<string>>(() => new Set());
  const q = sinAcentos(busqueda.trim());
  const visibles = useMemo(() => (q ? CATALOGO.filter((c) => sinAcentos(`${c.nombre} ${c.ayuda}`).includes(q)) : CATALOGO), [q]);
  const alternar = (g: string) =>
    setCerrados((prev) => {
      const n = new Set(prev);
      if (!n.delete(g)) n.add(g);
      return n;
    });
  return (
    <aside aria-label="Elementos disponibles" className="flex flex-col gap-3 rounded-2xl border border-[#e4e2d6] bg-[#faf9f4] p-3 xl:sticky xl:top-4 xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#11271d]">Elementos <span className="font-normal text-[#8a978f]">· {CATALOGO.length}</span></p>
          <p className="mt-0.5 text-xs leading-snug text-[#5d6e65]">Arrástrelos a la página o púlselos para añadirlos.</p>
        </div>
        <button type="button" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta} className="ad-btn ad-btn-ghost !min-h-8 shrink-0 !px-3 !text-xs xl:!hidden">
          {abierta ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      <div className={`flex flex-col gap-3 ${abierta ? "" : "max-xl:hidden"}`}>
        <div className="relative">
          <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a978f]" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar…"
            aria-label="Buscar un elemento"
            className="ad-input !rounded-xl !py-2 !pl-9 !pr-8 text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {busqueda && (
            <button type="button" onClick={() => setBusqueda("")} aria-label="Limpiar la búsqueda" className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[#5d6e65] hover:bg-[#eceae0]"><X size={13} aria-hidden /></button>
          )}
        </div>
        {visibles.length === 0 && <p className="rounded-xl border border-dashed border-[#d9d6cb] px-3 py-4 text-center text-xs text-[#5d6e65]">Ningún elemento coincide con «{busqueda.trim()}».</p>}
        {GRUPOS.map((g) => {
          const delGrupo = visibles.filter((c) => c.grupo === g);
          if (!delGrupo.length) return null;
          const abierto = q !== "" || !cerrados.has(g);
          return (
            <div key={g}>
              <button type="button" onClick={() => alternar(g)} aria-expanded={abierto} disabled={q !== ""} className="ad-eyebrow mb-1.5 flex w-full items-center gap-1 text-left disabled:cursor-default">
                <ChevronRight size={12} aria-hidden className={`transition-transform ${abierto ? "rotate-90" : ""}`} /> {g}
                <span className="ml-auto font-medium normal-case tracking-normal">{delGrupo.length}</span>
              </button>
              {abierto && (
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 xl:grid-cols-2">
                  {delGrupo.map((c) => {
                    const Icono = ICONOS[c.tipo] ?? Puzzle;
                    return (
                      <button
                        key={c.tipo}
                        type="button"
                        draggable
                        title={c.ayuda}
                        onClick={() => onAnadir(c.tipo)}
                        onDragStart={(e) => onInicio(c.tipo, e)}
                        onDragEnd={onFin}
                        className="flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-[#e4e2d6] bg-white px-1.5 py-2.5 text-center text-[0.72rem] font-semibold leading-tight text-[#11271d] transition-colors hover:border-[#b08f4f] hover:bg-[#fbf6e8] active:cursor-grabbing"
                      >
                        <Icono size={20} aria-hidden className="text-[#3d7a22]" />
                        {c.nombre}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ───────────────────────── un elemento en la página

function Hueco({ activo }: { activo: boolean }) {
  return (
    <div aria-hidden className="relative h-3">
      <div className={`absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-colors ${activo ? "bg-[#b08f4f]" : "bg-transparent"}`} />
    </div>
  );
}

type MarcoProps = {
  el: Elemento;
  indice: number;
  total: number;
  seleccionado: boolean;
  carpeta: string;
  onSeleccionar: (id: string) => void;
  onActualizar: (id: string, fn: (el: Elemento) => Elemento) => void;
  onMover: (id: string, dir: -1 | 1) => void;
  onDuplicar: (id: string) => void;
  onQuitar: (id: string) => void;
  onArrastre: (id: string, e: DragEvent) => void;
  onFin: () => void;
};

const Marco = memo(function Marco({ el, indice, total, seleccionado, carpeta, onSeleccionar, onActualizar, onMover, onDuplicar, onQuitar, onArrastre, onFin }: MarcoProps) {
  // Lo que viene copiado de la página original (una tabla, por ejemplo) se muestra con su nombre y no se edita.
  const Icono = el.tipo === "otro" && el.bloque.t === "table" ? Table2 : (ICONOS[el.tipo] ?? Puzzle);
  const nombre = el.tipo === "otro" ? (NOMBRE_TIPO[el.bloque.t] ?? NOMBRE_TIPO.otro) : NOMBRE_TIPO[el.tipo];
  const [quitando, setQuitando] = useState(false);
  const aviso = useMemo(() => problema(el), [el]);
  const bloques = useMemo(() => aBloques([el]), [el]);

  // El aviso de «¿Quitar?» se retira solo si la persona no responde.
  useEffect(() => {
    if (!quitando) return;
    const t = window.setTimeout(() => setQuitando(false), 4000);
    return () => window.clearTimeout(t);
  }, [quitando]);

  return (
    <div
      data-bloque={el.id}
      className={`rounded-2xl border bg-white transition-shadow ${seleccionado ? "border-[#b08f4f] shadow-[0_0_0_4px_rgba(176,143,79,0.18)]" : "border-[#e4e2d6] hover:border-[#c9d8bf]"}`}
    >
      <div data-cabecera className="flex items-center gap-1.5 rounded-t-2xl border-b border-[#eeece2] bg-[#faf9f4] px-2.5 py-1.5">
        <button
          type="button"
          draggable
          onDragStart={(e) => onArrastre(el.id, e)}
          onDragEnd={onFin}
          className="ad-icon-btn !h-8 !w-8 cursor-grab active:cursor-grabbing"
          aria-label={`Arrastrar para mover: ${nombre} ${indice + 1}`}
          title="Arrastre para mover"
        >
          <GripVertical size={16} />
        </button>
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#5d6e65]">
          <Icono size={14} aria-hidden /> {nombre}
        </span>
        {aviso && (
          <span className="ad-pill ad-pill-gold !py-0.5" title={aviso}>
            <AlertTriangle size={11} aria-hidden /> Incompleto: no se publica
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          {quitando ? (
            <>
              <span className="text-xs font-semibold text-[#a33a3a]">¿Quitar?</span>
              <button type="button" onClick={() => onQuitar(el.id)} className="ad-btn !min-h-8 !rounded-lg !bg-[#a33a3a] !px-3 !text-xs !text-white">Sí, quitar</button>
              <button type="button" onClick={() => setQuitando(false)} className="ad-btn ad-btn-ghost !min-h-8 !rounded-lg !px-3 !text-xs">No</button>
            </>
          ) : (
            <>
              <button type="button" disabled={indice === 0} onClick={() => onMover(el.id, -1)} className="ad-icon-btn !h-8 !w-8" aria-label="Subir" title="Subir"><ArrowUp size={14} /></button>
              <button type="button" disabled={indice === total - 1} onClick={() => onMover(el.id, 1)} className="ad-icon-btn !h-8 !w-8" aria-label="Bajar" title="Bajar"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => onDuplicar(el.id)} className="ad-icon-btn !h-8 !w-8" aria-label="Duplicar" title="Duplicar"><Copy size={14} /></button>
              <button type="button" onClick={() => setQuitando(true)} className="ad-icon-btn !h-8 !w-8 hover:!border-[#e0a0a0] hover:!text-[#a33a3a]" aria-label="Quitar" title="Quitar"><Trash2 size={14} /></button>
            </>
          )}
        </span>
      </div>

      {/* Vista previa tal como se verá en el sitio; un botón transparente encima la abre para editarla. */}
      <div className="relative p-4">
        <div inert className="ed-body" style={{ counterReset: "none" }}>
          {bloques.length ? (
            <LegacyContent blocks={bloques} preview libre lead={false} />
          ) : (
            <p className="py-3 text-sm italic text-[#8a978f]">{aviso ?? "Elemento vacío."} {seleccionado ? "Complételo en el formulario de abajo." : "Púlselo para completarlo."}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSeleccionar(el.id)}
          aria-expanded={seleccionado}
          aria-label={`${seleccionado ? "Cerrar" : "Editar"}: ${nombre} ${indice + 1}`}
          className="absolute inset-0 cursor-pointer rounded-b-2xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b08f4f]"
        />
      </div>

      {seleccionado && (
        <div data-editor className="flex flex-col gap-4 rounded-b-2xl border-t border-[#eeece2] bg-[#faf9f4] p-4">
          <EditorElemento el={el} cambiar={(n) => onActualizar(el.id, () => n)} actualizar={(fn) => onActualizar(el.id, fn)} carpeta={carpeta} />
        </div>
      )}
    </div>
  );
});

// ───────────────────────── página en blanco

function Vacio({ onPlantilla }: { onPlantilla: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-[#c9d8bf] bg-[#f9fbf6] px-6 py-12 text-center">
      <div>
        <p className="text-base font-bold text-[#11271d]">La página está en blanco</p>
        <p className="mt-1 text-sm text-[#5d6e65]">Arrastre aquí un elemento de la izquierda, púlselo para añadirlo, o empiece con una plantilla.</p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {PLANTILLAS.map((p) => (
          <button key={p.id} type="button" onClick={() => onPlantilla(p.id)} className="flex flex-col items-start gap-0.5 rounded-xl border border-[#e4e2d6] bg-white px-4 py-3 text-left transition-colors hover:border-[#b08f4f] hover:bg-[#fbf6e8]">
            <span className="text-sm font-bold text-[#11271d]">{p.nombre}</span>
            <span className="text-xs text-[#5d6e65]">{p.ayuda}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── constructor

/**
 * `fiel`: la vista previa de la página completa usa las mismas reglas que el sitio para el texto copiado del portal actual
 * (primer párrafo destacado, fichas por subtítulo, listas de publicaciones). Las páginas nuevas no las usan.
 */
export type Historial = { deshacer: () => void; rehacer: () => void; puedeDeshacer: boolean; puedeRehacer: boolean };

export function Constructor({ elementos, setElementos, carpeta, fiel = false, historial }: { elementos: Elemento[]; setElementos: Dispatch<SetStateAction<Elemento[]>>; carpeta: string; fiel?: boolean; historial?: Historial }) {
  const [sel, setSel] = useState<string | null>(null);
  const [destino, setDestino] = useState<number | null>(null);
  const [modo, setModo] = useState<"editar" | "vista">("editar");
  const arrastre = useRef<Arrastre | null>(null);
  const lienzo = useRef<HTMLDivElement>(null);
  const enfocar = useRef<string | null>(null);
  // El elemento que se está editando, para saber dónde añadir el que se pulsa en la paleta.
  const selRef = useRef<string | null>(null);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  const insertar = useCallback(
    (tipo: TipoNuevo, en?: number) => {
      const nuevo = elementoNuevo(tipo);
      enfocar.current = nuevo.id;
      setSel(nuevo.id);
      setElementos((prev) => {
        // Pulsar un elemento de la paleta lo añade debajo del que se está editando; si no hay, al final.
        const tras = prev.findIndex((e) => e.id === selRef.current) + 1;
        const i = en ?? (tras > 0 ? tras : prev.length);
        return [...prev.slice(0, i), nuevo, ...prev.slice(i)];
      });
    },
    [setElementos],
  );
  // Un elemento recién añadido se muestra y deja listo su primer campo.
  useEffect(() => {
    const id = enfocar.current;
    if (!id) return;
    enfocar.current = null;
    const marco = lienzo.current?.querySelector<HTMLElement>(`[data-bloque="${id}"]`);
    if (!marco) return;
    marco.scrollIntoView({ block: "nearest", behavior: "smooth" });
    marco.querySelector<HTMLElement>("[data-editor] input, [data-editor] textarea")?.focus({ preventScroll: true });
  }, [elementos]);

  const actualizar = useCallback((id: string, fn: (el: Elemento) => Elemento) => setElementos((prev) => prev.map((e) => (e.id === id ? fn(e) : e))), [setElementos]);
  const seleccionar = useCallback((id: string) => setSel((s) => (s === id ? null : id)), []);
  const mover = useCallback(
    (id: string, dir: -1 | 1) =>
      setElementos((prev) => {
        const i = prev.findIndex((e) => e.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= prev.length) return prev;
        const n = [...prev];
        [n[i], n[j]] = [n[j], n[i]];
        return n;
      }),
    [setElementos],
  );
  const duplicar = useCallback(
    (id: string) => {
      const idCopia = nuevoId();
      enfocar.current = idCopia;
      setSel(idCopia);
      setElementos((prev) => {
        const i = prev.findIndex((e) => e.id === id);
        if (i < 0) return prev;
        const copia = { ...structuredClone(prev[i]), id: idCopia } as Elemento;
        return [...prev.slice(0, i + 1), copia, ...prev.slice(i + 1)];
      });
    },
    [setElementos],
  );
  const quitar = useCallback(
    (id: string) => {
      setSel((s) => (s === id ? null : s));
      setElementos((prev) => prev.filter((e) => e.id !== id));
    },
    [setElementos],
  );

  // ── arrastrar y soltar (HTML5): lo que se arrastra se guarda en una referencia porque el navegador no deja leerlo mientras se mueve.
  const finArrastre = useCallback(() => {
    arrastre.current = null;
    setDestino(null);
  }, []);
  const iniciarNuevo = useCallback((tipo: TipoNuevo, e: DragEvent) => {
    arrastre.current = { tipo: "nuevo", elemento: tipo };
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", tipo);
  }, []);
  const iniciarMover = useCallback((id: string, e: DragEvent) => {
    arrastre.current = { tipo: "mover", id };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    const cabecera = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-cabecera]");
    if (cabecera) e.dataTransfer.setDragImage(cabecera, 24, 16);
  }, []);

  const sobre = (e: DragEvent) => {
    const a = arrastre.current;
    if (!a) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = a.tipo === "nuevo" ? "copy" : "move";
    const marcos = lienzo.current ? Array.from(lienzo.current.querySelectorAll<HTMLElement>(":scope > [data-bloque]")) : [];
    let idx = marcos.length;
    for (let i = 0; i < marcos.length; i++) {
      const r = marcos[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    setDestino((d) => (d === idx ? d : idx));
  };
  const salir = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDestino(null);
  };
  const soltar = (e: DragEvent) => {
    const a = arrastre.current;
    if (!a) return;
    e.preventDefault();
    const idx = destino ?? elementos.length;
    finArrastre();
    if (a.tipo === "nuevo") {
      insertar(a.elemento, idx);
      return;
    }
    setElementos((prev) => {
      const desde = prev.findIndex((x) => x.id === a.id);
      if (desde < 0) return prev;
      const hasta = idx > desde ? idx - 1 : idx;
      if (hasta === desde) return prev;
      const n = [...prev];
      const [x] = n.splice(desde, 1);
      n.splice(hasta, 0, x);
      return n;
    });
  };

  const usarPlantilla = (id: string) => {
    const p = PLANTILLAS.find((x) => x.id === id);
    if (p) {
      setElementos(p.crear());
      setSel(null);
    }
  };

  const publicables = useMemo(() => aBloques(elementos), [elementos]);

  // Ctrl/Cmd+Z deshace y Ctrl/Cmd+Mayús+Z (o Ctrl+Y) rehace los cambios de la página; dentro de un campo de texto se deja el atajo del navegador.
  const atajos = (e: React.KeyboardEvent) => {
    if (!historial || !(e.ctrlKey || e.metaKey)) return;
    const destino = e.target as HTMLElement;
    if (destino.closest("input, textarea, select, [contenteditable='true']")) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) historial.deshacer();
    else if ((k === "z" && e.shiftKey) || k === "y") historial.rehacer();
    else return;
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-3" onKeyDown={atajos}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[#11271d]">
            Página <span className="font-normal text-[#5d6e65]">· {elementos.length} {elementos.length === 1 ? "elemento" : "elementos"}</span>
          </p>
          {historial && (
            <div role="group" aria-label="Historial" className="flex gap-1">
              <button type="button" disabled={!historial.puedeDeshacer} onClick={historial.deshacer} className="ad-btn ad-btn-ghost !min-h-8 !px-2.5 !text-xs" title="Deshacer el último cambio (Ctrl+Z)"><Undo2 size={14} aria-hidden /> Deshacer</button>
              <button type="button" disabled={!historial.puedeRehacer} onClick={historial.rehacer} className="ad-btn ad-btn-ghost !min-h-8 !px-2.5 !text-xs" title="Rehacer (Ctrl+Mayús+Z)"><Redo2 size={14} aria-hidden /> Rehacer</button>
            </div>
          )}
        </div>
        <div role="group" aria-label="Modo" className="flex overflow-hidden rounded-lg border border-[#d9d6cb] bg-white text-sm">
          {([["editar", "Armar", Pencil], ["vista", "Vista previa", Eye]] as const).map(([m, t, Icono]) => (
            <button key={m} type="button" aria-pressed={modo === m} onClick={() => setModo(m)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-colors ${modo === m ? "bg-[#f7edcf] text-[#11271d]" : "text-[#5d6e65] hover:bg-[#faf9f4]"}`}>
              <Icono size={14} aria-hidden /> {t}
            </button>
          ))}
        </div>
      </div>

      {modo === "vista" ? (
        <div className="rounded-2xl border border-[#e4e2d6] bg-white p-5 sm:p-8">
          <div inert className="ed-body">
            {publicables.length ? <LegacyContent blocks={publicables} preview libre={!fiel} lead={fiel} /> : <p className="text-sm text-[#5d6e65]">Aún no hay nada que publicar.</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[12.5rem_minmax(0,1fr)] xl:items-start">
          <Paleta onAnadir={(t) => insertar(t)} onInicio={iniciarNuevo} onFin={finArrastre} />
          <div
            ref={lienzo}
            onDragOver={sobre}
            onDragLeave={salir}
            onDrop={soltar}
            aria-label="Página"
            className="min-h-[18rem] rounded-2xl"
            // Los títulos de la página se numeran en orden aunque cada elemento se pinte por separado.
            style={{ counterReset: "sec" }}
          >
            {elementos.length === 0 ? (
              <>
                <Vacio onPlantilla={usarPlantilla} />
                {destino !== null && <div aria-hidden className="mt-2 h-1 rounded-full bg-[#b08f4f]" />}
              </>
            ) : (
              <>
                {elementos.map((el, i) => (
                  <Fragment key={el.id}>
                    <Hueco activo={destino === i} />
                    <Marco
                      el={el}
                      indice={i}
                      total={elementos.length}
                      seleccionado={sel === el.id}
                      carpeta={carpeta}
                      onSeleccionar={seleccionar}
                      onActualizar={actualizar}
                      onMover={mover}
                      onDuplicar={duplicar}
                      onQuitar={quitar}
                      onArrastre={iniciarMover}
                      onFin={finArrastre}
                    />
                  </Fragment>
                ))}
                <Hueco activo={destino === elementos.length} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
