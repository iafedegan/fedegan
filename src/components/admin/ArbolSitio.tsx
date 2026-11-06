"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Eye, EyeOff, FileText, FolderTree, Globe, LayoutPanelTop, Link2, Loader2, Menu, Pencil, Plus, Search, X, XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ArbolKind, ArbolNodo } from "@/lib/cms/arbol-tipos";
import { crearNodo, crearSeccion, eliminarNodo, moverNodo, publicarNodo, type NodoState } from "@/lib/cms/nodos-actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

const ICONO: Record<ArbolKind, LucideIcon> = {
  "grupo-raiz": FolderTree,
  nav: Menu,
  seccion: LayoutPanelTop,
  pagina: FileText,
  grupo: FolderTree,
  enlace: Link2,
  ruta: Globe,
};
const ETIQUETA: Record<ArbolKind, string> = {
  "grupo-raiz": "",
  nav: "Barra",
  seccion: "Sección",
  pagina: "Página",
  grupo: "Grupo",
  enlace: "Enlace",
  ruta: "Ruta fija",
};

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

function conHijos(lista: ArbolNodo[], out: string[] = []) {
  for (const n of lista) {
    if (n.children.length) {
      out.push(n.id);
      conHijos(n.children, out);
    }
  }
  return out;
}

function Aviso({ state }: { state: NodoState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${state.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}
    >
      {state.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />} {state.message}
    </p>
  );
}

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
    <form action={action} className="my-2 flex flex-col gap-3 rounded-xl border border-[#d9d6cb] bg-[#faf8f1] p-4">
      <input type="hidden" name="section" value={add.section} />
      <input type="hidden" name="parent" value={add.parent ?? ""} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#11271d]">Nuevo dentro de «{nombre}»</p>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="ad-icon-btn"><X size={15} /></button>
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo">
        {([["pagina", "Página con texto"], ["enlace", "Enlace"]] as const).map(([v, t]) => (
          <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${tipo === v ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white"}`}>
            <input type="radio" name="tipo" value={v} checked={tipo === v} onChange={() => setTipo(v)} /> {t}
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
      <Aviso state={state} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="ad-btn ad-btn-primary">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {tipo === "pagina" ? "Crear y escribir el contenido" : "Crear enlace"}
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
    <form action={action} className="my-2 flex flex-col gap-3 rounded-xl border border-[#d9d6cb] bg-[#faf8f1] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#11271d]">Nueva sección</p>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="ad-icon-btn"><X size={15} /></button>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#11271d]">
        Nombre de la sección
        <input name="label" required maxLength={80} autoFocus placeholder="Por ejemplo, Gira técnica 2027" className="ad-input font-normal" />
      </label>
      <label className="flex items-center gap-2 text-sm text-[#11271d]">
        <input type="checkbox" name="navbar" defaultChecked={enBarra} /> Mostrarla en la barra de navegación
      </label>
      <p className="text-xs text-[#5d6e65]">La sección nace con su portada; después puede crear dentro de ella todas las subsecciones y páginas que necesite, a cualquier nivel.</p>
      <Aviso state={state} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="ad-btn ad-btn-primary">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Crear sección
        </button>
        <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}

function Accion({ children }: { children: ReactNode }) {
  return <span className="inline-flex">{children}</span>;
}

type Ctx = {
  q: string;
  abiertos: Set<string>;
  alternar: (id: string) => void;
  writable: boolean;
  agregando: string | null;
  setAgregando: (id: string | null) => void;
};

function Fila({ n, nivel, c }: { n: ArbolNodo; nivel: number; c: Ctx }) {
  const Icono = ICONO[n.kind];
  const raizGrupo = n.kind === "grupo-raiz";
  const abierto = c.q ? true : c.abiertos.has(n.id);
  const puedeAbrir = n.children.length > 0;
  const propio = Boolean(n.nodeId) && c.writable && n.kind !== "nav";
  const esHoja = n.kind === "pagina" || n.kind === "enlace";
  const formSeccion = raizGrupo ? `seccion:${n.id}` : null;
  return (
    <li>
      <div className={`group flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 hover:bg-[#f3f1e8] ${raizGrupo ? "bg-[#eceae0] py-2.5" : ""}`}>
        <button
          type="button"
          onClick={() => c.alternar(n.id)}
          disabled={!puedeAbrir}
          aria-expanded={puedeAbrir ? abierto : undefined}
          aria-label={puedeAbrir ? `${abierto ? "Contraer" : "Expandir"} ${n.label}` : undefined}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5d6e65] ${puedeAbrir ? "hover:bg-white" : "opacity-0"}`}
        >
          {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <Icono size={16} className={`shrink-0 ${n.kind === "seccion" || n.kind === "nav" || raizGrupo ? "text-[#165a43]" : n.origen ? "text-[#b08f4f]" : "text-[#8a978f]"}`} aria-hidden />
        <span className={`min-w-0 ${raizGrupo ? "text-sm font-bold uppercase tracking-[0.12em] text-[#11271d]" : n.kind === "seccion" || n.kind === "nav" ? "font-semibold text-[#11271d]" : "text-[#26382f]"}`}>
          {n.href && !raizGrupo ? (
            <Link href={n.href} target="_blank" className="hover:text-[#165a43] hover:underline" title="Ver en el sitio">{n.label}</Link>
          ) : (
            n.label
          )}
        </span>
        {n.href && !raizGrupo && <span className="hidden min-w-0 max-w-[22rem] truncate font-mono text-xs text-[#8a978f] md:inline">{n.href}</span>}
        {n.origen && <span className="ad-pill ad-pill-gold">Nueva</span>}
        {n.editada && <span className="ad-pill ad-pill-gold">Editada</span>}
        {n.oculta && <span className="ad-pill ad-pill-off">Oculta</span>}
        {n.nota && <span className="ad-pill ad-pill-off">{n.nota}</span>}
        {!raizGrupo && ETIQUETA[n.kind] && <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[#a2ada6]">{ETIQUETA[n.kind]}</span>}
        {n.total > 0 && <span className="text-xs text-[#8a978f]">{n.total} dentro</span>}

        <span className="ml-auto flex flex-wrap items-center gap-1.5">
          {formSeccion && c.writable && n.id !== "g:fijas" && (
            <button type="button" onClick={() => c.setAgregando(c.agregando === formSeccion ? null : formSeccion)} className="ad-btn ad-btn-ghost !min-h-0 !px-3 !py-1.5 !text-xs">
              <Plus size={14} /> {n.id === "g:nav" ? "Nueva sección en la barra" : "Nueva sección"}
            </button>
          )}
          {n.add && c.writable && (
            <button
              type="button"
              onClick={() => c.setAgregando(c.agregando === n.id ? null : n.id)}
              title={esHoja ? "Crear una subpágina aquí" : "Crear una subsección aquí"}
              className="ad-btn ad-btn-ghost !min-h-0 !px-2.5 !py-1 !text-xs"
            >
              <Plus size={14} /> <span className="hidden sm:inline">Añadir dentro</span>
            </button>
          )}
          {propio && n.kind !== "seccion" && (
            <>
              <Accion>
                <form action={moverNodo}>
                  <input type="hidden" name="id" value={n.nodeId} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" aria-label={`Subir ${n.label}`} title="Subir" className="ad-icon-btn !h-8 !w-8"><ArrowUp size={14} /></button>
                </form>
              </Accion>
              <Accion>
                <form action={moverNodo}>
                  <input type="hidden" name="id" value={n.nodeId} />
                  <input type="hidden" name="dir" value="down" />
                  <button type="submit" aria-label={`Bajar ${n.label}`} title="Bajar" className="ad-icon-btn !h-8 !w-8"><ArrowDown size={14} /></button>
                </form>
              </Accion>
            </>
          )}
          {propio && (
            <Accion>
              <form action={publicarNodo}>
                <input type="hidden" name="id" value={n.nodeId} />
                <button type="submit" aria-label={n.oculta ? `Publicar ${n.label}` : `Ocultar ${n.label}`} title={n.oculta ? "Publicar" : "Ocultar del sitio"} className="ad-icon-btn !h-8 !w-8">
                  {n.oculta ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </form>
            </Accion>
          )}
          {n.editHref && (
            <Link href={n.editHref} aria-label={`Editar ${n.label}`} title="Editar" className="ad-icon-btn !h-8 !w-8"><Pencil size={14} /></Link>
          )}
          {n.href && !raizGrupo && (
            <Link href={n.href} target="_blank" aria-label={`Ver ${n.label} en el sitio`} title="Ver en el sitio" className="ad-icon-btn !h-8 !w-8"><ExternalLink size={14} /></Link>
          )}
          {propio && (
            <Accion>
              <form action={eliminarNodo}>
                <input type="hidden" name="id" value={n.nodeId} />
                <DeleteButton label={n.label} />
              </form>
            </Accion>
          )}
        </span>
      </div>

      {formSeccion && c.agregando === formSeccion && <SeccionForm enBarra={n.id === "g:nav"} onClose={() => c.setAgregando(null)} />}
      {c.agregando === n.id && n.add && <AgregarForm add={n.add} nombre={n.label} onClose={() => c.setAgregando(null)} />}

      {puedeAbrir && abierto && (
        <ul className={`${nivel === 0 ? "ml-3" : "ml-4"} border-l border-[#d9d6cb] pl-2`}>
          {n.children.map((k) => (
            <Fila key={k.id} n={k} nivel={nivel + 1} c={c} />
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

  const alternar = (id: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const c: Ctx = { q, abiertos, alternar, writable, agregando, setAgregando };

  return (
    <div className="ad-card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a978f]" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar una sección o página por nombre o ruta…" className="ad-input" style={{ paddingLeft: "2.6rem" }} aria-label="Buscar en el árbol" />
        </div>
        <button type="button" onClick={() => setAbiertos(new Set(todos))} className="ad-btn ad-btn-ghost">Expandir todo</button>
        <button type="button" onClick={() => setAbiertos(new Set(["g:nav", "g:sec"]))} className="ad-btn ad-btn-ghost">Contraer</button>
      </div>
      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d9d6cb] p-6 text-center text-sm text-[#5d6e65]">Nada coincide con «{busqueda}».</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visibles.map((g) => (
            <Fila key={g.id} n={g} nivel={0} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
