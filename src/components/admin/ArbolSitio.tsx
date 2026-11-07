"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, CheckCircle2, ChevronRight, ChevronsDownUp, ChevronsUpDown, ExternalLink, Eye, EyeOff, FileText, FolderTree, Globe, LayoutPanelTop, Layers, Link2,
  Loader2, MoreHorizontal, PanelTop, Pencil, Plus, Search, SearchX, X, XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ArbolKind, ArbolNodo } from "@/lib/cms/arbol-tipos";
import { crearNodo, crearSeccion, eliminarNodo, moverNodo, publicarNodo, type NodoState } from "@/lib/cms/nodos-actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

const ICONO: Record<ArbolKind, LucideIcon> = {
  "grupo-raiz": FolderTree,
  nav: PanelTop,
  seccion: LayoutPanelTop,
  pagina: FileText,
  grupo: FolderTree,
  enlace: Link2,
  ruta: Globe,
};
const ICONO_GRUPO: Record<string, LucideIcon> = { "g:nav": PanelTop, "g:sec": LayoutPanelTop, "g:fijas": Globe };
const DESCRIPCION_GRUPO: Record<string, string> = {
  "g:nav": "Lo que se ve en el menú principal del sitio",
  "g:sec": "Secciones que no están en la barra",
  "g:fijas": "Rutas propias del portal; no se editan aquí",
};
// Solo se rotulan los tipos que no se reconocen por su icono.
const ETIQUETA: Partial<Record<ArbolKind, string>> = { grupo: "Grupo", enlace: "Enlace", ruta: "Ruta fija" };

// Las acciones de cada fila aparecen al pasar el cursor o al enfocar con el teclado; en pantallas táctiles siempre se ven.
const SOLO_AL_PASAR =
  "transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-[details[open]]:opacity-100";

const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Deja solo lo que coincide con la búsqueda y los caminos que llevan hasta ello.
function filtrar(lista: ArbolNodo[], q: string): ArbolNodo[] {
  const out: ArbolNodo[] = [];
  for (const n of lista) {
    const propio = norm(n.label).includes(q) || norm(n.href ?? "").includes(q);
    if (propio) out.push(n);
    else {
      const kids = filtrar(n.children, q);
      if (kids.length) out.push({ ...n, children: kids });
    }
  }
  return out;
}

function coincidencias(lista: ArbolNodo[], q: string): number {
  let n = 0;
  for (const x of lista) {
    if (norm(x.label).includes(q) || norm(x.href ?? "").includes(q)) n++;
    n += coincidencias(x.children, q);
  }
  return n;
}

function conHijos(lista: ArbolNodo[], out: string[] = []) {
  for (const n of lista) {
    if (n.children.length) {
      out.push(n.id);
      conHijos(n.children, out);
    }
  }
  return out;
}

// Marca la primera coincidencia de la búsqueda (solo si la versión sin acentos mide lo mismo que el texto).
function Resaltar({ texto, q }: { texto: string; q: string }) {
  if (!q) return <>{texto}</>;
  const plano = norm(texto);
  const i = plano.length === texto.length ? plano.indexOf(q) : -1;
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark className="rounded bg-[#f7e7a8] px-0.5 text-inherit">{texto.slice(i, i + q.length)}</mark>
      {texto.slice(i + q.length)}
    </>
  );
}

function claseChip(n: ArbolNodo) {
  if (n.kind === "nav" || n.kind === "seccion") return "bg-[#e1f1e7] text-[#165a43]";
  if (n.origen) return "bg-[#f7edcf] text-[#8a6d1f]";
  if (n.kind === "enlace") return "bg-[#e7eef7] text-[#2c5b8f]";
  if (n.kind === "grupo") return "bg-[#f3eddc] text-[#8a6d1f]";
  return "bg-[#eceae0] text-[#6d7c73]";
}

const PILDORA = {
  dorada: "bg-[#f7edcf] text-[#7c5f1f]",
  gris: "bg-[#eceae0] text-[#6a766f]",
  azul: "bg-[#e7eef7] text-[#2c5b8f]",
};

function Pildora({ tono, icono: Icono, children }: { tono: keyof typeof PILDORA; icono?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold leading-none ${PILDORA[tono]}`}>
      {Icono && <Icono size={11} aria-hidden />}
      {children}
    </span>
  );
}

function Aviso({ state }: { state: NodoState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}
    >
      {state.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden /> : <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden />} {state.message}
    </p>
  );
}

const claseFormulario =
  "my-2 flex flex-col gap-3.5 rounded-2xl border border-[#e4e2d6] border-l-[3px] border-l-[#b08f4f] bg-white p-4 shadow-[0_16px_36px_-26px_rgba(17,39,29,0.6)] sm:p-5";

// Formulario en línea para crear una página o un enlace colgando de un nodo, a cualquier nivel.
function AgregarForm({ add, nombre, onClose }: { add: { section: string; parent: string | null }; nombre: string; onClose: () => void }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"pagina" | "enlace">("pagina");
  const [state, action, pending] = useActionState(async (prev: NodoState, fd: FormData) => {
    const r = await crearNodo(prev, fd);
    if (r.ok) {
      if (r.next) router.push(r.next);
      else {
        router.refresh();
        onClose();
      }
    }
    return r;
  }, {} as NodoState);
  return (
    <form action={action} className={`${claseFormulario} ml-2 sm:ml-[2.75rem]`}>
      <input type="hidden" name="section" value={add.section} />
      <input type="hidden" name="parent" value={add.parent ?? ""} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.95rem] font-bold text-[#11271d]">Nuevo dentro de «{nombre}»</p>
          <p className="mt-0.5 text-xs text-[#5d6e65]">Elija qué quiere crear.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="at-btn at-btn-icon shrink-0"><X size={16} aria-hidden /></button>
      </div>
      <div role="radiogroup" aria-label="Tipo" className="inline-flex w-fit rounded-xl bg-[#f1efe6] p-1">
        {([["pagina", "Página", FileText], ["enlace", "Enlace", Link2]] as const).map(([v, t, Icono]) => (
          <label
            key={v}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#b08f4f] ${tipo === v ? "bg-white text-[#11271d] shadow-sm" : "text-[#5d6e65] hover:text-[#11271d]"}`}
          >
            <input type="radio" name="tipo" value={v} checked={tipo === v} onChange={() => setTipo(v)} className="sr-only" />
            <Icono size={15} aria-hidden /> {t}
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#11271d]">
          Nombre
          <input name="label" required maxLength={120} autoFocus placeholder="Cómo aparece en el menú" className="ad-input font-normal" />
        </label>
        {tipo === "enlace" && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#11271d]">
            Enlace
            <input name="href" required placeholder="/pagos o https://…" className="ad-input font-normal" />
          </label>
        )}
      </div>
      {tipo === "pagina" && <p className="text-xs leading-relaxed text-[#5d6e65]">Al crearla se abre el constructor: la arma arrastrando botones, tarjetas, carruseles y más.</p>}
      <Aviso state={state} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="ad-btn ad-btn-primary">
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Plus size={15} aria-hidden />} {tipo === "pagina" ? "Crear y armar la página" : "Crear enlace"}
        </button>
        <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}

function SeccionForm({ enBarra, onClose }: { enBarra: boolean; onClose: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (prev: NodoState, fd: FormData) => {
    const r = await crearSeccion(prev, fd);
    if (r.ok) {
      if (r.next) router.push(r.next);
      else {
        router.refresh();
        onClose();
      }
    }
    return r;
  }, {} as NodoState);
  return (
    <form action={action} className={`${claseFormulario} mx-1`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.95rem] font-bold text-[#11271d]">Nueva sección</p>
          <p className="mt-0.5 text-xs text-[#5d6e65]">Nace con su portada; dentro de ella puede crear subsecciones y páginas a cualquier nivel.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="at-btn at-btn-icon shrink-0"><X size={16} aria-hidden /></button>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#11271d]">
        Nombre de la sección
        <input name="label" required maxLength={80} autoFocus placeholder="Por ejemplo, Gira técnica 2027" className="ad-input font-normal" />
      </label>
      <label className="flex items-center gap-2 text-sm text-[#11271d]">
        <input type="checkbox" name="navbar" defaultChecked={enBarra} /> Mostrarla en la barra de navegación
      </label>
      <Aviso state={state} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="ad-btn ad-btn-primary">
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Plus size={15} aria-hidden />} Crear sección
        </button>
        <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}

// Menú «⋯» de una fila. Es un <details>, así que funciona sin JavaScript; el script solo lo cierra al hacer clic fuera,
// con Escape, tras enviar una acción o al pulsar un ítem marcado con data-cierra.
// `extras`: ítems sueltos (en pantallas angostas reúnen añadir, editar y ver). `nodeId`: además, las acciones de una página
// creada en el panel (subir, bajar, ocultar y eliminar).
function MenuFila({ label, nodeId, oculta, puedeMover = false, extras }: { label: string; nodeId?: string; oculta?: boolean; puedeMover?: boolean; extras?: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const cerrar = () => {
    if (ref.current) ref.current.open = false;
  };
  useEffect(() => {
    const fuera = (e: PointerEvent) => {
      const d = ref.current;
      if (d?.open && !d.contains(e.target as Node)) d.open = false;
    };
    const esc = (e: KeyboardEvent) => {
      const d = ref.current;
      if (e.key === "Escape" && d?.open) {
        d.open = false;
        d.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  return (
    <details ref={ref} className="relative">
      <summary className="at-btn at-btn-icon" aria-label={`Más acciones de ${label}`} title="Más acciones">
        <MoreHorizontal size={16} aria-hidden />
      </summary>
      {/* Al enviar una acción no se cierra de inmediato: el formulario aún debe enviarse, así que se cierra un instante después. */}
      <div
        className="at-menu"
        onSubmit={() => window.setTimeout(cerrar, 0)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-cierra]")) cerrar();
        }}
      >
        {extras}
        {extras && nodeId && <div className="at-sep" role="separator" />}
        {nodeId && (
          <>
            {puedeMover && (
              <>
                <form action={moverNodo}>
                  <input type="hidden" name="id" value={nodeId} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" className="at-item"><ArrowUp size={15} aria-hidden /> Subir</button>
                </form>
                <form action={moverNodo}>
                  <input type="hidden" name="id" value={nodeId} />
                  <input type="hidden" name="dir" value="down" />
                  <button type="submit" className="at-item"><ArrowDown size={15} aria-hidden /> Bajar</button>
                </form>
              </>
            )}
            <form action={publicarNodo}>
              <input type="hidden" name="id" value={nodeId} />
              <button type="submit" className="at-item">
                {oculta ? <Eye size={15} aria-hidden /> : <EyeOff size={15} aria-hidden />} {oculta ? "Publicar en el sitio" : "Ocultar del sitio"}
              </button>
            </form>
            <div className="at-sep" role="separator" />
            <form action={eliminarNodo}>
              <input type="hidden" name="id" value={nodeId} />
              <DeleteButton label={label} menu />
            </form>
          </>
        )}
      </div>
    </details>
  );
}

type Ctx = {
  q: string;
  abiertos: Set<string>;
  alternar: (id: string) => void;
  writable: boolean;
  agregando: string | null;
  setAgregando: (id: string | null) => void;
};

// Cabecera de cada grupo grande (barra de navegación, otras secciones, páginas fijas).
function Grupo({ n, c }: { n: ArbolNodo; c: Ctx }) {
  const Icono = ICONO_GRUPO[n.id] ?? FolderTree;
  const abierto = c.q ? true : c.abiertos.has(n.id);
  const formSeccion = `seccion:${n.id}`;
  const puedeCrear = c.writable && n.id !== "g:fijas";
  return (
    <li>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-[#f4f2e9] px-2.5 py-2.5">
        <button
          type="button"
          onClick={() => c.alternar(n.id)}
          aria-expanded={abierto}
          className="flex min-w-0 flex-1 basis-60 items-center gap-2.5 rounded-lg text-left"
        >
          <ChevronRight size={18} aria-hidden className={`shrink-0 text-[#5d6e65] transition-transform ${abierto ? "rotate-90" : ""}`} />
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e1f1e7] text-[#165a43]">
            <Icono size={17} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[0.98rem] font-bold text-[#11271d]">{n.label}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[0.7rem] font-semibold text-[#5d6e65] ring-1 ring-[#e4e2d6]">
                {n.total} {n.id === "g:fijas" ? "rutas" : "páginas"}
              </span>
            </span>
            <span className="block text-xs text-[#8a978f]">{DESCRIPCION_GRUPO[n.id]}</span>
          </span>
        </button>
        {puedeCrear && (
          <button type="button" onClick={() => c.setAgregando(c.agregando === formSeccion ? null : formSeccion)} className="ad-btn ad-btn-primary !min-h-9 !px-3.5 !text-xs">
            <Plus size={14} aria-hidden /> {n.id === "g:nav" ? "Nueva sección en la barra" : "Nueva sección"}
          </button>
        )}
      </div>

      {c.agregando === formSeccion && <SeccionForm enBarra={n.id === "g:nav"} onClose={() => c.setAgregando(null)} />}

      {abierto && (
        n.children.length ? (
          <ul className="mt-1.5 flex flex-col gap-0.5 pl-1">
            {n.children.map((k) => (
              <Fila key={k.id} n={k} c={c} />
            ))}
          </ul>
        ) : (
          <p className="px-3 py-3 text-sm text-[#8a978f]">Todavía no hay nada aquí.</p>
        )
      )}
    </li>
  );
}

function Fila({ n, c }: { n: ArbolNodo; c: Ctx }) {
  const Icono = ICONO[n.kind];
  const abierto = c.q ? true : c.abiertos.has(n.id);
  const puedeAbrir = n.children.length > 0;
  const propio = Boolean(n.nodeId) && c.writable && n.kind !== "nav";
  const esHoja = n.kind === "pagina" || n.kind === "enlace";
  const destacada = n.kind === "nav" || n.kind === "seccion";
  const puedeAnadir = Boolean(n.add) && c.writable;

  const claseNombre = `min-w-0 max-w-full truncate text-left ${destacada ? "text-[0.95rem] font-semibold text-[#11271d]" : "text-[0.9rem] font-medium text-[#26382f]"}`;
  const nombre = <Resaltar texto={n.label} q={c.q} />;

  return (
    <li>
      <div className="group relative flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f6f5ee] focus-within:bg-[#f6f5ee] has-[details[open]]:bg-[#f6f5ee] max-sm:gap-x-1.5 max-sm:px-1">
        {puedeAbrir ? (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => c.alternar(n.id)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#5d6e65] hover:bg-white max-sm:h-6 max-sm:w-6"
          >
            <ChevronRight size={16} className={`transition-transform ${abierto ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="h-7 w-7 shrink-0 max-sm:h-6 max-sm:w-6" aria-hidden />
        )}
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg max-sm:h-7 max-sm:w-7 ${claseChip(n)}`} aria-hidden>
          <Icono size={16} />
        </span>

        <div className="min-w-0 flex-1 basis-36 sm:basis-44">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {puedeAbrir ? (
              <button type="button" onClick={() => c.alternar(n.id)} aria-expanded={abierto} className={`${claseNombre} hover:text-[#165a43]`}>
                {nombre}
              </button>
            ) : n.editHref ? (
              <Link href={n.editHref} title="Editar" className={`${claseNombre} underline-offset-2 hover:text-[#89114c] hover:underline`}>
                {nombre}
              </Link>
            ) : (
              <span className={claseNombre}>{nombre}</span>
            )}
            {n.origen && <Pildora tono="dorada">Nueva</Pildora>}
            {n.editada && <Pildora tono="dorada" icono={Pencil}>Editada</Pildora>}
            {n.oculta && <Pildora tono="gris" icono={EyeOff}>Oculta</Pildora>}
            {n.nota && <Pildora tono="gris">{n.nota}</Pildora>}
            {ETIQUETA[n.kind] && <Pildora tono={n.kind === "enlace" ? "azul" : "gris"}>{ETIQUETA[n.kind]}</Pildora>}
          </div>
          {n.href && (
            <span className="block truncate font-mono text-[0.7rem] leading-4 text-[#98a39c]">
              <Resaltar texto={n.href} q={c.q} />
            </span>
          )}
        </div>

        {n.total > 0 && (
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#f1efe6] px-2 py-0.5 text-[0.7rem] font-semibold text-[#6d7c73] sm:inline-flex" title={`${n.total} ${n.total === 1 ? "página" : "páginas"} dentro`}>
            <Layers size={11} aria-hidden /> {n.total}
          </span>
        )}

        {/* Desde sm: botones sueltos que aparecen al pasar el cursor. En pantallas angostas: un solo menú «⋯». */}
        <div className="ml-auto hidden shrink-0 items-center gap-0.5 sm:flex">
          {puedeAnadir && (
            <button
              type="button"
              onClick={() => c.setAgregando(c.agregando === n.id ? null : n.id)}
              title={esHoja ? "Crear una subpágina aquí" : "Crear una subsección aquí"}
              aria-label={`Añadir dentro de ${n.label}`}
              className={`at-btn at-btn-add ${destacada ? "" : SOLO_AL_PASAR}`}
            >
              <Plus size={15} aria-hidden /> <span className="hidden lg:inline">Añadir dentro</span>
            </button>
          )}
          <div className={`flex items-center gap-0.5 ${SOLO_AL_PASAR}`}>
            {n.editHref && (
              <Link href={n.editHref} aria-label={`Editar ${n.label}`} title="Editar" className="at-btn at-btn-icon"><Pencil size={15} aria-hidden /></Link>
            )}
            {n.href && (
              <Link href={n.href} target="_blank" aria-label={`Ver ${n.label} en el sitio`} title="Ver en el sitio" className="at-btn at-btn-icon"><ExternalLink size={15} aria-hidden /></Link>
            )}
            {propio && n.nodeId && <MenuFila label={n.label} nodeId={n.nodeId} oculta={n.oculta} puedeMover={n.kind !== "seccion"} />}
          </div>
        </div>
        {(puedeAnadir || n.editHref || n.href || propio) && (
          <div className="ml-auto shrink-0 sm:hidden">
            <MenuFila
              label={n.label}
              nodeId={propio ? n.nodeId : undefined}
              oculta={n.oculta}
              puedeMover={n.kind !== "seccion"}
              extras={
                <>
                  {puedeAnadir && (
                    <button type="button" data-cierra className="at-item" onClick={() => c.setAgregando(c.agregando === n.id ? null : n.id)}>
                      <Plus size={15} aria-hidden /> Añadir dentro
                    </button>
                  )}
                  {n.editHref && (
                    <Link href={n.editHref} className="at-item"><Pencil size={15} aria-hidden /> Editar</Link>
                  )}
                  {n.href && (
                    <Link href={n.href} target="_blank" data-cierra className="at-item"><ExternalLink size={15} aria-hidden /> Ver en el sitio</Link>
                  )}
                </>
              }
            />
          </div>
        )}
      </div>

      {c.agregando === n.id && n.add && <AgregarForm add={n.add} nombre={n.label} onClose={() => c.setAgregando(null)} />}

      {puedeAbrir && abierto && (
        <ul className="ml-[1.35rem] mt-0.5 flex flex-col gap-0.5 border-l border-[#e8e5d8] pl-1.5 max-sm:ml-4 max-sm:pl-1">
          {n.children.map((k) => (
            <Fila key={k.id} n={k} c={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ArbolSitio({ raiz, writable }: { raiz: ArbolNodo[]; writable: boolean }) {
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set(["g:nav", "g:sec"]));
  const [busqueda, setBusqueda] = useState("");
  const [agregando, setAgregando] = useState<string | null>(null);
  const q = norm(busqueda.trim());
  const visibles = useMemo(() => (q ? filtrar(raiz, q) : raiz), [raiz, q]);
  const todos = useMemo(() => conHijos(raiz), [raiz]);
  const aciertos = useMemo(() => (q ? coincidencias(visibles.flatMap((g) => g.children), q) : 0), [visibles, q]);

  const alternar = (id: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const c: Ctx = { q, abiertos, alternar, writable, agregando, setAgregando };

  return (
    <div className="ad-card p-4 sm:p-5">
      {/* La barra de búsqueda se queda arriba mientras se recorre el árbol (en pantallas angostas, bajo la barra del panel). */}
      <div className="sticky top-[4.5rem] z-20 -mx-4 -mt-4 mb-3 flex flex-wrap items-center gap-2 rounded-t-[1.25rem] border-b border-[#eeece2] bg-white/90 px-4 py-3 backdrop-blur sm:-mx-5 sm:-mt-5 sm:px-5 lg:top-0">
        <div className="relative min-w-[13rem] flex-1">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a978f]" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o ruta…"
            aria-label="Buscar en el árbol"
            className="ad-input !rounded-xl !py-2 !pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {busqueda && (
            <button type="button" onClick={() => setBusqueda("")} aria-label="Limpiar la búsqueda" className="at-btn at-btn-icon absolute right-1 top-1/2 !h-7 !w-7 -translate-y-1/2">
              <X size={14} aria-hidden />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setAbiertos(new Set(todos))} title="Expandir todo" className="at-btn">
            <ChevronsUpDown size={15} aria-hidden /> <span className="hidden sm:inline">Expandir todo</span>
          </button>
          <button type="button" onClick={() => setAbiertos(new Set(["g:nav", "g:sec"]))} title="Contraer" className="at-btn">
            <ChevronsDownUp size={15} aria-hidden /> <span className="hidden sm:inline">Contraer</span>
          </button>
        </div>
      </div>

      {q && visibles.length > 0 && (
        <p role="status" className="mb-2 px-1 text-xs font-medium text-[#5d6e65]">
          {aciertos} {aciertos === 1 ? "coincidencia" : "coincidencias"} para «{busqueda.trim()}»
        </p>
      )}

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#d9d6cb] px-6 py-10 text-center">
          <SearchX size={26} aria-hidden className="text-[#8a978f]" />
          <p className="text-sm font-semibold text-[#11271d]">Nada coincide con «{busqueda.trim()}»</p>
          <p className="text-sm text-[#5d6e65]">Pruebe con otra palabra o con una parte de la ruta.</p>
          <button type="button" onClick={() => setBusqueda("")} className="at-btn mt-1 !border-[#e4e2d6] !bg-white">Limpiar la búsqueda</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibles.map((g) => (
            <Grupo key={g.id} n={g} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
