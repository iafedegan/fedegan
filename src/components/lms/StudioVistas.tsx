"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Clipboard, Clock, Lightbulb, Maximize2, Minus, Pause, PenLine, Play, Plus, Route, RotateCcw, Search, Shuffle, Sparkles, Target, Timer, Trophy, Volume2, VolumeX, X } from "lucide-react";
import type { Contenido, Nodo } from "@/lib/lms/studio-tipos";

// Vistas de cada material del Studio. Reciben el contenido ya guardado (nada se genera aquí) y lo hacen interactivo:
// mapa mental que se explora (arrastrar, zoom, buscar, recorrido guiado), tarjetas que se voltean y se deslizan, cuestionario en modo práctica
// o examen, línea de tiempo que se reproduce, glosario con práctica, lectura en voz alta… El avance se guarda en este navegador.

const VERDE = "#72BF44";
const VINO = "#89114C";
const RAMAS = [VERDE, VINO, "#C9992B", "#1B7F73", "#D9772E", "#3C6DB0"];

// ---------- Avance guardado en el navegador ----------

const llave = (clave: string | undefined, kind: string) => (clave ? `fs:${clave}:${kind}` : null);
function leerLocal<T>(k: string | null, ini: T): T {
  if (!k) return ini;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : ini;
  } catch {
    return ini;
  }
}
function usePersist<T>(clave: string | undefined, kind: string, ini: T) {
  const k = llave(clave, kind);
  const [v, setV] = useState<T>(() => leerLocal(k, ini));
  const poner = (n: T | ((p: T) => T)) =>
    setV((p) => {
      const nx = typeof n === "function" ? (n as (p: T) => T)(p) : n;
      if (k) {
        try {
          localStorage.setItem(k, JSON.stringify(nx));
        } catch {
          /* sin almacenamiento: el avance no se guarda */
        }
      }
      return nx;
    });
  return [v, poner] as const;
}

/** Texto corto con el avance guardado de un material (para la lista del panel), o null si no hay. */
export function avanceDe(clave: string, kind: string, c: Contenido): string | null {
  if (kind === "tarjetas") {
    const n = leerLocal<number[]>(llave(clave, "tarjetas"), []).length;
    return n && c.tarjetas ? `${Math.min(n, c.tarjetas.length)} de ${c.tarjetas.length} dominadas` : null;
  }
  if (kind === "cuestionario") {
    const m = leerLocal<number | null>(llave(clave, "cuestionario"), null);
    return m !== null && c.cuestionario ? `Mejor resultado: ${m} de ${c.cuestionario.length}` : null;
  }
  if (kind === "resumen") {
    const n = leerLocal<number[]>(llave(clave, "resumen"), []).length;
    return n && c.resumen ? `${Math.min(n, c.resumen.puntos.length)} de ${c.resumen.puntos.length} leídas` : null;
  }
  if (kind === "linea") {
    const n = leerLocal<number[]>(llave(clave, "linea"), []).length;
    return n && c.linea ? `${Math.min(n, c.linea.length)} de ${c.linea.length} pasos hechos` : null;
  }
  if (kind === "guia") {
    const n = leerLocal<number[]>(llave(clave, "guia"), []).length;
    return n ? `${n} repasadas` : null;
  }
  return null;
}

// ---------- Piezas comunes ----------

/** Texto con **negrita** (sin HTML). */
export function Texto({ children, className }: { children: string; className?: string }) {
  return (
    <span className={className}>
      {children.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i} className="font-bold text-[var(--text)]">{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}
    </span>
  );
}

const parrafos = (t: string) => t.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
const limpiarMd = (t: string) => t.replace(/\*\*/g, "");
const barajar = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

function Barra({ valor, total, color = VERDE }: { valor: number; total: number; color?: string }) {
  return (
    <span className="block h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]" role="progressbar" aria-valuenow={valor} aria-valuemax={total}>
      <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${total ? (valor / total) * 100 : 0}%`, background: color }} />
    </span>
  );
}

function Anillo({ valor, total }: { valor: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`${valor} de ${total}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(114,191,68,0.18)" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={VERDE} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (total ? valor / total : 0))} transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset .8s ease" }} />
      <text x="70" y="78" textAnchor="middle" fontSize="30" fontWeight="800" fill="currentColor">{valor}/{total}</text>
    </svg>
  );
}

/** Lee el texto en voz alta con la voz del navegador. */
function Escuchar({ texto }: { texto: string }) {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  if (!ok) return null;
  const alternar = () => {
    const s = window.speechSynthesis;
    if (on) {
      s.cancel();
      setOn(false);
      return;
    }
    s.cancel();
    const u = new SpeechSynthesisUtterance(limpiarMd(texto));
    u.lang = "es-CO";
    u.rate = 0.96;
    u.onend = () => setOn(false);
    u.onerror = () => setOn(false);
    s.speak(u);
    setOn(true);
  };
  return (
    <button type="button" className="st-btn" onClick={alternar} aria-pressed={on}>
      {on ? <VolumeX size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />} {on ? "Detener" : "Escuchar"}
    </button>
  );
}

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="st-btn"
      onClick={() => {
        navigator.clipboard?.writeText(limpiarMd(texto)).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1800);
        }).catch(() => {});
      }}
    >
      {ok ? <Check size={15} aria-hidden /> : <Clipboard size={15} aria-hidden />} {ok ? "Copiado" : "Copiar"}
    </button>
  );
}

// ---------- Ventana ----------

export type Salto = { titulo: string; ir: () => void };

export function Visor({ titulo, subtitulo, icono, color, onClose, anterior, siguiente, posicion, children }: { titulo: string; subtitulo: string; icono: ReactNode; color: string; onClose: () => void; anterior?: Salto; siguiente?: Salto; posicion?: string; children: ReactNode }) {
  const cierre = useRef<HTMLButtonElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cierre.current?.focus();
    const tecla = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", tecla);
      previo?.focus?.();
    };
  }, [onClose]);
  // Al pasar a otro material, el cuerpo vuelve arriba.
  useEffect(() => {
    cuerpo.current?.scrollTo({ top: 0 });
  }, [titulo]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="st-fondo" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label={titulo} className="st-ventana">
        <header className="st-cab" style={{ ["--st-color" as string]: color }}>
          <span className="st-cab-icono">{icono}</span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-[var(--font-display)] text-xl font-bold leading-tight text-[var(--text)] sm:text-2xl">{titulo}</h2>
            <p className="truncate text-sm text-[var(--text-muted)]">{subtitulo}</p>
          </div>
          <button ref={cierre} type="button" onClick={onClose} aria-label="Cerrar" className="st-cerrar"><X size={20} /></button>
        </header>
        <div ref={cuerpo} className="st-cuerpo" data-st-cuerpo>{children}</div>
        {(anterior || siguiente) && (
          <footer className="st-pie">
            {anterior ? <button type="button" className="st-btn" onClick={anterior.ir}><ChevronLeft size={16} aria-hidden /> {anterior.titulo}</button> : <span />}
            {posicion && <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-faint)] sm:block">{posicion}</span>}
            {siguiente ? <button type="button" className="st-btn st-btn-fuerte" onClick={siguiente.ir}>{siguiente.titulo} <ChevronRight size={16} aria-hidden /></button> : <span />}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}

// ---------- Resumen ----------

export function VistaResumen({ d, clave }: { d: NonNullable<Contenido["resumen"]>; clave?: string }) {
  const [leidas, setLeidas] = usePersist<number[]>(clave, "resumen", []);
  const set = new Set(leidas);
  const todo = [d.idea, ...d.puntos.map((p) => `${p.titulo}. ${p.texto}`), d.cierre].filter(Boolean).join("\n");
  const alternar = (i: number) => setLeidas((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Escuchar texto={todo} />
        <Copiar texto={todo} />
        <span className="ml-auto flex min-w-40 flex-1 items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)] sm:max-w-xs">
          <Barra valor={set.size} total={d.puntos.length} /> {set.size}/{d.puntos.length} leídas
        </span>
      </div>
      {d.idea && (
        <div className="st-idea">
          <Lightbulb size={26} aria-hidden className="shrink-0" />
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-80">Idea central</p>
            <p className="mt-1.5 font-[var(--font-display)] text-xl font-bold leading-snug sm:text-2xl"><Texto>{d.idea}</Texto></p>
          </div>
        </div>
      )}
      <ol className="grid gap-4 sm:grid-cols-2">
        {d.puntos.map((p, i) => (
          <li key={i}>
            <button type="button" onClick={() => alternar(i)} aria-pressed={set.has(i)} className={`st-punto w-full text-left ${set.has(i) ? "st-punto-ok" : ""}`} style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }}>
              <span className="st-num">{set.has(i) ? <Check size={16} aria-hidden /> : i + 1}</span>
              <span className="block">
                {p.titulo && <span className="block font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{p.titulo}</span>}
                <span className="mt-1 block leading-relaxed text-[var(--text-muted)]"><Texto>{p.texto}</Texto></span>
                <span className="mt-2 block text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">{set.has(i) ? "Leída · toque para desmarcar" : "Toque para marcar como leída"}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {d.cierre && (
        <p className="st-cierre"><Sparkles size={20} aria-hidden className="mt-0.5 shrink-0" /><span><b>Para llevar a la finca: </b><Texto>{d.cierre}</Texto></span></p>
      )}
    </div>
  );
}

// ---------- Guía de estudio ----------

export function VistaGuia({ d, clave }: { d: NonNullable<Contenido["guia"]>; clave?: string }) {
  const [hechas, setHechas] = usePersist<number[]>(clave, "guia-antes", []);
  const [repasadas, setRepasadas] = usePersist<number[]>(clave, "guia", []);
  const [abierta, setAbierta] = useState<number | null>(null);
  const marca = (i: number) => setHechas((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  const sabe = (i: number, ok: boolean) => setRepasadas((l) => (ok ? (l.includes(i) ? l : [...l, i]) : l.filter((x) => x !== i)));
  return (
    <div className="flex flex-col gap-9">
      {d.objetivos.length > 0 && (
        <section>
          <h3 className="st-h3"><Target size={18} aria-hidden /> Lo que va a lograr</h3>
          <ul className="mt-3 grid gap-2.5">
            {d.objetivos.map((o, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-[rgba(114,191,68,0.1)] px-4 py-3 text-[var(--text)]"><Check size={18} className="mt-0.5 shrink-0 text-[#3d7a22]" aria-hidden /><Texto>{o}</Texto></li>
            ))}
          </ul>
        </section>
      )}
      {d.conceptos.length > 0 && (
        <section>
          <h3 className="st-h3"><Lightbulb size={18} aria-hidden /> Conceptos clave</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {d.conceptos.map((c, i) => (
              <div key={i} className="st-concepto" style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }}>
                <dt className="font-[var(--font-display)] font-bold text-[var(--text)]">{c.termino}</dt>
                <dd className="mt-1 text-[0.95rem] leading-relaxed text-[var(--text-muted)]"><Texto>{c.definicion}</Texto></dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {d.repaso.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="st-h3"><Search size={18} aria-hidden /> Preguntas de repaso</h3>
            <span className="ml-auto flex min-w-36 items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]"><Barra valor={repasadas.filter((i) => i < d.repaso.length).length} total={d.repaso.length} /> {repasadas.filter((i) => i < d.repaso.length).length}/{d.repaso.length}</span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-faint)]">Piense su respuesta, ábrala para comprobarla y diga si ya la domina.</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {d.repaso.map((r, i) => (
              <div key={i} className={`st-acordeon ${abierta === i ? "st-acordeon-on" : ""}`}>
                <button type="button" className="st-acordeon-cab" aria-expanded={abierta === i} onClick={() => setAbierta(abierta === i ? null : i)}>
                  <span className={`st-num st-num-sm ${repasadas.includes(i) ? "" : "st-num-vacio"}`}>{repasadas.includes(i) ? <Check size={14} aria-hidden /> : i + 1}</span>
                  <span className="flex-1 text-left font-semibold text-[var(--text)]">{r.pregunta}</span>
                  <ChevronDown size={18} className={`st-flecha ${abierta === i ? "st-flecha-on" : ""}`} aria-hidden />
                </button>
                {abierta === i && (
                  <div className="px-5 pb-4 pl-[3.6rem]">
                    <p className="leading-relaxed text-[var(--text-muted)]"><Texto>{r.respuesta}</Texto></p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="st-btn st-btn-fuerte" onClick={() => sabe(i, true)}><Check size={15} aria-hidden /> La domino</button>
                      <button type="button" className="st-btn st-btn-no" onClick={() => sabe(i, false)}>Repasar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {d.antes.length > 0 && (
        <section>
          <h3 className="st-h3"><Check size={18} aria-hidden /> Antes de la evaluación</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {d.antes.map((a, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--fg-lime-500)]">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#72BF44]" checked={hechas.includes(i)} onChange={() => marca(i)} />
                  <span className={hechas.includes(i) ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]"}><Texto>{a}</Texto></span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------- Informe ----------

export function VistaInforme({ d }: { d: NonNullable<Contenido["informe"]> }) {
  const [pct, setPct] = useState(0);
  const todo = [d.titulo, d.introduccion, ...d.secciones.map((s) => `${s.titulo}. ${s.texto}`), ...d.conclusiones].filter(Boolean).join("\n\n");
  useEffect(() => {
    const cuerpo = document.querySelector<HTMLElement>("[data-st-cuerpo]");
    if (!cuerpo) return;
    const f = () => setPct(Math.min(100, Math.round((cuerpo.scrollTop / Math.max(1, cuerpo.scrollHeight - cuerpo.clientHeight)) * 100)));
    f();
    cuerpo.addEventListener("scroll", f, { passive: true });
    return () => cuerpo.removeEventListener("scroll", f);
  }, []);
  const ir = (i: number) => document.getElementById(`st-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="st-lectura" aria-hidden><span style={{ width: `${pct}%` }} /></div>
      <div className="flex flex-wrap items-center gap-2">
        <Escuchar texto={todo} />
        <Copiar texto={todo} />
        <span className="ml-auto text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">{pct} % leído</span>
      </div>
      {d.titulo && <h3 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">{d.titulo}</h3>}
      {d.secciones.length > 1 && (
        <nav aria-label="Contenido" className="flex flex-wrap gap-2">
          {d.secciones.map((s, i) => <button key={i} type="button" className="st-chip-nav" onClick={() => ir(i)}><span className="font-mono" style={{ color: VINO }}>{String(i + 1).padStart(2, "0")}</span> {s.titulo}</button>)}
        </nav>
      )}
      {d.introduccion && <p className="border-l-4 pl-5 text-lg leading-relaxed text-[var(--text-muted)]" style={{ borderColor: VERDE }}><Texto>{d.introduccion}</Texto></p>}
      {d.secciones.map((s, i) => (
        <section key={i} id={`st-sec-${i}`} className="flex scroll-mt-4 flex-col gap-3">
          <h4 className="flex items-baseline gap-3 font-[var(--font-display)] text-xl font-bold text-[var(--text)]"><span className="font-mono text-sm" style={{ color: VINO }}>{String(i + 1).padStart(2, "0")}</span>{s.titulo}</h4>
          {parrafos(s.texto).map((p, k) => <p key={k} className="leading-[1.75] text-[var(--text-muted)]"><Texto>{p}</Texto></p>)}
        </section>
      ))}
      {d.conclusiones.length > 0 && (
        <aside className="st-cierre flex-col !items-stretch">
          <b className="font-[var(--font-display)] text-lg">Conclusiones</b>
          <ul className="mt-2 flex flex-col gap-2">{d.conclusiones.map((c, i) => <li key={i} className="flex gap-2.5"><Check size={18} className="mt-1 shrink-0" aria-hidden /><Texto>{c}</Texto></li>)}</ul>
        </aside>
      )}
    </article>
  );
}

// ---------- Mapa mental ----------

type P = { id: string; t: string; d: number; x: number; y: number; w: number; h: number; c: number; n: number; abierto: boolean };
const ANCHO = [240, 212, 204, 196];
const ALTO = [72, 52, 48, 46];
const HUECO_X = 56;
const HUECO_Y = 14;
const MARGEN = 28;

function distribuir(raiz: Nodo, abiertos: Set<string>) {
  const nodos: P[] = [];
  const lineas: { a: P; b: P }[] = [];
  const xs: number[] = [];
  let acc = MARGEN;
  for (let d = 0; d < ANCHO.length; d++) {
    xs[d] = acc;
    acc += ANCHO[d] + HUECO_X;
  }
  let cursor = MARGEN;
  const visitar = (n: Nodo, id: string, d: number, c: number): P => {
    const hijos = n.hijos ?? [];
    const abierto = hijos.length > 0 && abiertos.has(id);
    const kids = abierto ? hijos.map((h, i) => visitar(h, `${id}.${i}`, d + 1, d === 0 ? i : c)) : [];
    let y: number;
    if (kids.length) y = (kids[0].y + kids[kids.length - 1].y) / 2;
    else {
      y = cursor + ALTO[d] / 2;
      cursor += ALTO[d] + HUECO_Y;
    }
    const p: P = { id, t: n.t, d, x: xs[d], y, w: ANCHO[d], h: ALTO[d], c, n: hijos.length, abierto };
    nodos.push(p);
    for (const k of kids) lineas.push({ a: p, b: k });
    return p;
  };
  visitar(raiz, "0", 0, 0);
  const ancho = Math.max(...nodos.map((p) => p.x + p.w)) + MARGEN;
  return { nodos, lineas, ancho, alto: cursor + MARGEN - HUECO_Y };
}

const conHijos = (n: Nodo, id: string, out: string[] = []): string[] => {
  if (n.hijos?.length) {
    out.push(id);
    n.hijos.forEach((h, i) => conHijos(h, `${id}.${i}`, out));
  }
  return out;
};
const todos = (n: Nodo, id: string, out: { id: string; t: string }[] = []) => {
  out.push({ id, t: n.t });
  n.hijos?.forEach((h, i) => todos(h, `${id}.${i}`, out));
  return out;
};
const ancestros = (id: string) => id.split(".").map((_, i, a) => a.slice(0, i + 1).join("."));
const inicialAbiertos = (d: Nodo) => new Set(["0", ...(d.hijos ?? []).map((_, i) => `0.${i}`)]);

export function VistaMapa({ d }: { d: Nodo }) {
  const [abiertos, setAbiertos] = useState<Set<string>>(() => inicialAbiertos(d));
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tour, setTour] = useState<number | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const g = useMemo(() => distribuir(d, abiertos), [d, abiertos]);
  const ramas = d.hijos?.length ?? 0;
  const lista = useMemo(() => todos(d, "0"), [d]);
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const coinciden = useMemo(() => (q.trim().length > 1 ? new Set(lista.filter((x) => norm(x.t).includes(norm(q.trim()))).map((x) => x.id)) : new Set<string>()), [lista, q]);

  const ajuste = (ancho: number, alto: number) => {
    const w = caja.current?.clientWidth ?? 800;
    const h = caja.current?.clientHeight ?? 560;
    return Math.max(0.4, Math.min(1.15, (w - 6) / ancho, (h - 6) / alto));
  };
  useEffect(() => {
    const ini = distribuir(d, inicialAbiertos(d));
    setZoom(ajuste(ini.ancho, ini.alto));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  // Zoom con Ctrl/⌘ + rueda (y el gesto de pellizco del trackpad).
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const rueda = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setZoom((z) => Math.max(0.4, Math.min(1.8, +(z * (e.deltaY < 0 ? 1.08 : 0.92)).toFixed(3))));
    };
    el.addEventListener("wheel", rueda, { passive: false });
    return () => el.removeEventListener("wheel", rueda);
  }, []);

  // La búsqueda abre las ramas donde hay coincidencias.
  useEffect(() => {
    if (!coinciden.size) return;
    setAbiertos((s) => {
      const n = new Set(s);
      coinciden.forEach((id) => ancestros(id).slice(0, -1).forEach((a) => n.add(a)));
      return n;
    });
  }, [coinciden]);

  // El recorrido guiado se centra en la rama actual.
  useEffect(() => {
    if (tour === null) return;
    const p = g.nodos.find((x) => x.id === `0.${tour}`);
    const el = caja.current;
    if (p && el) el.scrollTo({ left: Math.max(0, p.x * zoom - el.clientWidth * 0.25), top: Math.max(0, p.y * zoom - el.clientHeight / 2), behavior: "smooth" });
  }, [tour, g, zoom]);

  const alternar = (id: string) => setAbiertos((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const irRama = (i: number) => {
    const k = ((i % ramas) + ramas) % ramas;
    setTour(k);
    setSel(`0.${k}`);
    setAbiertos(new Set(["0", `0.${k}`]));
  };
  const salirTour = () => { setTour(null); setSel(null); setAbiertos(inicialAbiertos(d)); };
  const activo = (id: string) => sel === null || id === sel || sel.startsWith(`${id}.`) || id.startsWith(`${sel}.`);

  const empezar = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".st-nodo") || !caja.current) return;
    arrastre.current = { x: e.clientX, y: e.clientY, sl: caja.current.scrollLeft, st: caja.current.scrollTop };
    caja.current.setPointerCapture(e.pointerId);
  };
  const mover = (e: RPointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a || !caja.current) return;
    caja.current.scrollLeft = a.sl - (e.clientX - a.x);
    caja.current.scrollTop = a.st - (e.clientY - a.y);
  };
  const soltar = (e: RPointerEvent<HTMLDivElement>) => {
    if (arrastre.current && Math.abs(e.clientX - arrastre.current.x) < 4 && Math.abs(e.clientY - arrastre.current.y) < 4) setSel(null);
    arrastre.current = null;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="st-buscar !py-1.5 sm:w-56">
          <Search size={15} aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar una idea…" aria-label="Buscar en el mapa" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Borrar"><X size={14} /></button>}
        </label>
        {q.trim().length > 1 && <span className="text-xs font-bold text-[var(--text-faint)]">{coinciden.size} {coinciden.size === 1 ? "coincidencia" : "coincidencias"}</span>}
        <button type="button" className={`st-btn ${tour !== null ? "st-btn-fuerte" : ""}`} onClick={() => (tour === null ? irRama(0) : salirTour())} disabled={ramas < 2}><Route size={15} aria-hidden /> Recorrido guiado</button>
        <button type="button" className="st-btn" onClick={() => { setTour(null); setSel(null); setAbiertos(new Set(conHijos(d, "0"))); }}><Maximize2 size={15} aria-hidden /> Abrir todo</button>
        <button type="button" className="st-btn" onClick={() => { setTour(null); setSel(null); setAbiertos(new Set(["0"])); }}><Minus size={15} aria-hidden /> Solo ramas</button>
        <span className="mx-1 hidden h-5 w-px bg-[var(--border-strong)] sm:block" />
        <button type="button" className="st-btn st-btn-ico" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} aria-label="Alejar"><Minus size={15} /></button>
        <span className="w-11 text-center text-xs font-bold tabular-nums text-[var(--text-muted)]">{Math.round(zoom * 100)} %</span>
        <button type="button" className="st-btn st-btn-ico" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))} aria-label="Acercar"><Plus size={15} /></button>
        <button type="button" className="st-btn" onClick={() => setZoom(ajuste(g.ancho, g.alto))}>Ajustar</button>
      </div>
      {tour !== null && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white" style={{ background: RAMAS[tour % RAMAS.length] }}>
          <button type="button" onClick={() => irRama(tour - 1)} className="st-tour-btn" aria-label="Rama anterior"><ChevronLeft size={18} /></button>
          <span className="flex-1 text-center font-bold">Rama {tour + 1} de {ramas}: {d.hijos?.[tour]?.t}</span>
          <button type="button" onClick={() => irRama(tour + 1)} className="st-tour-btn" aria-label="Rama siguiente"><ChevronRight size={18} /></button>
        </div>
      )}
      <div ref={caja} className="st-lienzo" onPointerDown={empezar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={() => { arrastre.current = null; }}>
        <div style={{ width: g.ancho * zoom, height: g.alto * zoom }}>
          <div style={{ width: g.ancho, height: g.alto, transform: `scale(${zoom})`, transformOrigin: "0 0", position: "relative" }}>
            <svg width={g.ancho} height={g.alto} className="absolute left-0 top-0" aria-hidden>
              {g.lineas.map(({ a, b }, i) => {
                const x1 = a.x + a.w;
                const x2 = b.x;
                const k = (x2 - x1) * 0.55;
                const vivo = activo(a.id) && activo(b.id);
                return <path key={i} d={`M${x1} ${a.y} C${x1 + k} ${a.y}, ${x2 - k} ${b.y}, ${x2} ${b.y}`} fill="none" stroke={RAMAS[b.c % RAMAS.length]} strokeWidth={b.d === 1 ? 3 : 2} strokeLinecap="round" opacity={vivo ? (b.d === 1 ? 0.9 : 0.65) : 0.12} style={{ transition: "opacity .25s" }} />;
              })}
            </svg>
            {g.nodos.map((p) => {
              const color = RAMAS[p.c % RAMAS.length];
              const clase = p.d === 0 ? "st-nodo-raiz" : p.d === 1 ? "st-nodo-rama" : "st-nodo-hoja";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSel(p.id); if (p.n > 0) alternar(p.id); }}
                  aria-expanded={p.n > 0 ? p.abierto : undefined}
                  title={p.t}
                  className={`st-nodo ${clase} ${coinciden.has(p.id) ? "st-nodo-hit" : ""} ${sel === p.id ? "st-nodo-sel" : ""}`}
                  style={{ left: p.x, top: p.y - p.h / 2, width: p.w, height: p.h, opacity: activo(p.id) ? 1 : 0.22, ["--st-color" as string]: color }}
                >
                  <span className="line-clamp-3">{p.t}</span>
                  {p.n > 0 && <span className="st-nodo-mas" aria-hidden>{p.abierto ? <Minus size={13} /> : <>+{p.n}</>}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--text-faint)]">Arrastre para moverse · Ctrl + rueda (o pellizco) para acercar · toque una idea para resaltarla con sus ramas y abrirla o cerrarla.</p>
    </div>
  );
}

// ---------- Tarjetas ----------

export function VistaTarjetas({ d, clave }: { d: NonNullable<Contenido["tarjetas"]>; clave?: string }) {
  const [sabidas, setSabidas] = usePersist<number[]>(clave, "tarjetas", []);
  const [orden, setOrden] = useState<number[]>(() => d.map((_, i) => i));
  const [i, setI] = useState(0);
  const [voltea, setVoltea] = useState(false);
  const [vistas, setVistas] = useState<Set<number>>(new Set());
  const [escribe, setEscribe] = useState(false);
  const [mia, setMia] = useState("");
  const [dx, setDx] = useState(0);
  const arr = useRef<{ x: number; mov: boolean } | null>(null);
  const total = orden.length;
  const terminado = total > 0 && vistas.size >= total;
  const c = d[orden[i]];
  const conocidas = new Set(sabidas);

  const ir = (n: number) => { setI(Math.max(0, Math.min(total - 1, n))); setVoltea(false); setMia(""); };
  const marcar = (sabe: boolean) => {
    const k = orden[i];
    setSabidas((s) => (sabe ? (s.includes(k) ? s : [...s, k]) : s.filter((x) => x !== k)));
    setVistas((s) => new Set(s).add(k));
    if (i < total - 1) ir(i + 1);
    else { setVoltea(false); setMia(""); }
  };
  const reiniciar = (soloFaltan: boolean) => {
    const base = d.map((_, k) => k).filter((k) => !soloFaltan || !conocidas.has(k));
    setOrden(barajar(base.length ? base : d.map((_, k) => k)));
    setI(0); setVoltea(false); setMia(""); setVistas(new Set());
    if (!soloFaltan) setSabidas([]);
  };
  const tecla = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight") marcar(true);
    else if (e.key === "ArrowLeft") marcar(false);
    else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setVoltea((v) => !v); }
  };
  // Deslizar: a la derecha «la sé», a la izquierda «repasar».
  const bajar = (e: RPointerEvent<HTMLDivElement>) => { arr.current = { x: e.clientX, mov: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const mover = (e: RPointerEvent<HTMLDivElement>) => {
    if (!arr.current) return;
    const v = e.clientX - arr.current.x;
    if (Math.abs(v) > 6) arr.current.mov = true;
    if (arr.current.mov) setDx(v);
  };
  const subir = () => {
    const a = arr.current;
    arr.current = null;
    if (a?.mov) {
      if (dx > 110) marcar(true);
      else if (dx < -110) marcar(false);
    } else setVoltea((v) => !v);
    setDx(0);
  };

  if (terminado) {
    const sabe = orden.filter((k) => conocidas.has(k)).length;
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <Anillo valor={sabe} total={total} />
        <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{sabe === total ? "¡Las dominó todas!" : `Dominó ${sabe} de ${total} tarjetas`}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {sabe < total && <button type="button" className="st-btn st-btn-fuerte" onClick={() => reiniciar(true)}><RotateCcw size={16} /> Repasar las que faltan</button>}
          <button type="button" className="st-btn" onClick={() => reiniciar(false)}>Empezar de nuevo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 outline-none" tabIndex={0} onKeyDown={tecla} aria-label="Tarjetas didácticas: flecha derecha «la sé», flecha izquierda «repasar», barra espaciadora para voltear">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">
        <span>Tarjeta {i + 1} de {total}</span>
        <Barra valor={vistas.size} total={total} />
        <span style={{ color: "#3d7a22" }}>{conocidas.size} dominadas</span>
        <button type="button" onClick={() => { setOrden(barajar(orden)); setI(0); setVoltea(false); }} className="st-btn st-btn-ico" aria-label="Mezclar"><Shuffle size={14} /></button>
        <button type="button" onClick={() => { setEscribe((v) => !v); setVoltea(false); setMia(""); }} className={`st-btn st-btn-ico ${escribe ? "st-btn-fuerte" : ""}`} aria-pressed={escribe} aria-label="Escribir mi respuesta" title="Escribir mi respuesta antes de ver la correcta"><PenLine size={14} /></button>
      </div>
      <div className="relative" onPointerDown={bajar} onPointerMove={mover} onPointerUp={subir} onPointerCancel={() => { arr.current = null; setDx(0); }} style={{ touchAction: "pan-y" }}>
        <span className="st-deslizar st-deslizar-no" style={{ opacity: Math.min(1, Math.max(0, -dx / 110)) }}>Repasar</span>
        <span className="st-deslizar st-deslizar-si" style={{ opacity: Math.min(1, Math.max(0, dx / 110)) }}>La sé</span>
        <div className={`st-tarjeta ${voltea ? "st-tarjeta-on" : ""}`} style={{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)`, transition: dx ? "none" : "transform .25s" }} role="button" aria-label={voltea ? "Ver la pregunta" : "Ver la respuesta"}>
          <span className="st-tarjeta-in">
            <span className="st-cara st-frente"><small>Pregunta</small><b><Texto>{c.q}</Texto></b><em>Toque para ver la respuesta · deslice para marcar</em></span>
            <span className="st-cara st-dorso"><small>Respuesta</small><b className="!font-medium"><Texto>{c.a}</Texto></b>{escribe && mia && <em className="!opacity-90">Usted escribió: {mia}</em>}</span>
          </span>
        </div>
      </div>
      {escribe && !voltea && (
        <div className="flex gap-2">
          <textarea value={mia} onChange={(e) => setMia(e.target.value)} rows={2} placeholder="Escriba aquí lo que recuerda…" className="st-escribir" aria-label="Mi respuesta" />
          <button type="button" className="st-btn st-btn-fuerte self-end" onClick={() => setVoltea(true)}>Comprobar</button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="st-btn" onClick={() => ir(i - 1)} disabled={i === 0}>Anterior</button>
        <button type="button" className="st-btn st-btn-no" onClick={() => marcar(false)}>Repasar</button>
        <button type="button" className="st-btn st-btn-fuerte" onClick={() => marcar(true)}><Check size={16} /> La sé</button>
        <button type="button" className="st-btn" onClick={() => ir(i + 1)} disabled={i === total - 1}>Saltar</button>
      </div>
    </div>
  );
}

// ---------- Cuestionario ----------

type Preg = { q: string; options: string[]; correct: number; why: string };
const armarPreguntas = (d: NonNullable<Contenido["cuestionario"]>): Preg[] =>
  barajar(d).map((p) => {
    const orden = barajar(p.options.map((_, i) => i));
    return { q: p.q, options: orden.map((i) => p.options[i]), correct: orden.indexOf(p.correct), why: p.why };
  });
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function VistaCuestionario({ d, clave }: { d: NonNullable<Contenido["cuestionario"]>; clave?: string }) {
  const [mejor, setMejor] = usePersist<number | null>(clave, "cuestionario", null);
  const [modo, setModo] = useState<"practica" | "examen" | null>(null);
  const [preg, setPreg] = useState<Preg[]>([]);
  const [paso, setPaso] = useState(0);
  const [resp, setResp] = useState<(number | null)[]>([]);
  const [fin, setFin] = useState(false);
  const [seg, setSeg] = useState(0);
  const [t0, setT0] = useState(0);

  useEffect(() => {
    if (!modo || fin) return;
    const id = setInterval(() => setSeg(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [modo, fin, t0]);

  const empezar = (m: "practica" | "examen") => {
    const p = armarPreguntas(d);
    setPreg(p); setResp(p.map(() => null)); setPaso(0); setFin(false); setSeg(0); setT0(Date.now()); setModo(m);
  };
  const terminar = (r: (number | null)[]) => {
    const a = r.filter((x, i) => x === preg[i].correct).length;
    setMejor((m) => (m === null || a > m ? a : m));
    setSeg(Math.floor((Date.now() - t0) / 1000));
    setFin(true);
  };

  if (!modo) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl text-white" style={{ background: "#3C6DB0" }}><Trophy size={30} aria-hidden /></span>
        <div>
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{d.length} preguntas para poner a prueba lo aprendido</h3>
          {mejor !== null && <p className="mt-1 text-sm font-semibold" style={{ color: "#3d7a22" }}>Su mejor resultado: {mejor} de {d.length}</p>}
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <button type="button" className="st-modo" onClick={() => empezar("practica")}><b>Práctica</b><span>Ve si acertó y por qué, pregunta por pregunta.</span></button>
          <button type="button" className="st-modo" onClick={() => empezar("examen")}><b>Examen</b><span>Responde todo y ve el resultado al final, con cronómetro.</span></button>
        </div>
        <p className="text-xs text-[var(--text-faint)]">Las preguntas y las opciones cambian de orden cada vez.</p>
      </div>
    );
  }

  const q = preg[paso];
  const elegida = resp[paso];
  const aciertos = resp.filter((r, i) => r === preg[i]?.correct).length;

  if (fin) {
    const pct = Math.round((aciertos / preg.length) * 100);
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-4 text-center">
        <Anillo valor={aciertos} total={preg.length} />
        <div>
          <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{pct >= 80 ? "¡Excelente trabajo!" : pct >= 50 ? "Va por buen camino" : "Vale la pena repasar la lección"}</p>
          <p className="mt-1 flex items-center justify-center gap-3 text-[var(--text-muted)]">Acertó {aciertos} de {preg.length} <span className="inline-flex items-center gap-1 text-sm"><Clock size={14} aria-hidden /> {mmss(seg)}</span></p>
        </div>
        <ul className="flex w-full flex-col gap-2 text-left">
          {preg.map((p, i) => {
            const bien = resp[i] === p.correct;
            if (modo === "practica" && bien) return null;
            return (
              <li key={i} className={`rounded-xl border p-4 ${bien ? "border-[rgba(114,191,68,0.5)] bg-[rgba(114,191,68,0.07)]" : "border-[var(--border)]"}`}>
                <p className="flex items-start gap-2 font-semibold text-[var(--text)]">{bien ? <Check size={17} className="mt-0.5 shrink-0 text-[#3d7a22]" aria-hidden /> : <X size={17} className="mt-0.5 shrink-0" style={{ color: VINO }} aria-hidden />}{p.q}</p>
                {!bien && resp[i] !== null && <p className="mt-1 text-sm" style={{ color: VINO }}><b>Su respuesta: </b>{p.options[resp[i] as number]}</p>}
                <p className="mt-1 text-sm text-[#3d7a22]"><b>Respuesta: </b>{p.options[p.correct]}</p>
                {p.why && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{p.why}</p>}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="st-btn st-btn-fuerte" onClick={() => empezar(modo)}><RotateCcw size={16} /> Intentar de nuevo</button>
          <button type="button" className="st-btn" onClick={() => setModo(null)}>Cambiar de modo</button>
        </div>
        {mejor !== null && <p className="text-sm text-[var(--text-faint)]">Mejor resultado: {mejor} de {preg.length}</p>}
      </div>
    );
  }

  const ultima = paso === preg.length - 1;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-1.5" aria-label={`Pregunta ${paso + 1} de ${preg.length}`}>
        {preg.map((_, i) => {
          const hecha = resp[i] !== null;
          const color = modo === "examen" ? (hecha ? "#3C6DB0" : i === paso ? "rgba(60,109,176,.4)" : "var(--bg-sunken)") : hecha ? (resp[i] === preg[i].correct ? VERDE : VINO) : i === paso ? "rgba(114,191,68,0.45)" : "var(--bg-sunken)";
          return <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: color }} />;
        })}
      </div>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
        <span>Pregunta {paso + 1} de {preg.length} · {modo === "examen" ? "Examen" : "Práctica"}</span>
        <span className="inline-flex items-center gap-1 tabular-nums"><Timer size={13} aria-hidden /> {mmss(seg)}</span>
      </div>
      <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] sm:text-2xl">{q.q}</h3>
      <div className="flex flex-col gap-2.5">
        {q.options.map((o, k) => {
          const mostrar = modo === "practica" && elegida !== null;
          const elegido = elegida === k;
          const correcta = mostrar && k === q.correct;
          const mala = mostrar && elegido && k !== q.correct;
          return (
            <button key={k} type="button" disabled={mostrar} onClick={() => setResp((r) => r.map((x, i) => (i === paso ? k : x)))} className={`st-opcion ${correcta ? "st-opcion-ok" : mala ? "st-opcion-mal" : modo === "examen" && elegido ? "st-opcion-sel" : ""}`}>
              <span className="st-letra">{correcta ? <Check size={15} /> : mala ? <X size={15} /> : String.fromCharCode(65 + k)}</span>
              <span className="flex-1 text-left">{o}</span>
            </button>
          );
        })}
      </div>
      {modo === "practica" && elegida !== null && (
        <div className={`rounded-xl p-4 text-[0.95rem] leading-relaxed ${elegida === q.correct ? "bg-[rgba(114,191,68,0.14)] text-[var(--text)]" : "bg-[rgba(137,17,76,0.08)] text-[var(--text)]"}`}>
          <b>{elegida === q.correct ? "¡Correcto! " : "No es esa. "}</b>{q.why || (elegida === q.correct ? "" : `La respuesta es: ${q.options[q.correct]}`)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button type="button" className="st-btn" onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0 || modo === "practica"}>Anterior</button>
        <button type="button" disabled={elegida === null} className="st-btn st-btn-fuerte" onClick={() => (ultima ? terminar(resp) : setPaso(paso + 1))}>{ultima ? "Ver resultado" : "Siguiente"}</button>
      </div>
    </div>
  );
}

// ---------- Preguntas frecuentes ----------

export function VistaFaq({ d }: { d: NonNullable<Contenido["faq"]> }) {
  const [q, setQ] = useState("");
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set([0]));
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const lista = d.map((p, i) => ({ p, i })).filter(({ p }) => !q || norm(`${p.q} ${p.a}`).includes(norm(q)));
  const alternar = (i: number) => setAbiertas((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="st-buscar flex-1"><Search size={17} aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar entre ${d.length} preguntas…`} aria-label="Buscar en las preguntas" />{q && <button type="button" onClick={() => setQ("")} aria-label="Borrar"><X size={15} /></button>}</label>
        <button type="button" className="st-btn" onClick={() => setAbiertas(abiertas.size === d.length ? new Set() : new Set(d.map((_, i) => i)))}>{abiertas.size === d.length ? "Cerrar todas" : "Abrir todas"}</button>
      </div>
      {lista.length === 0 && <p className="py-8 text-center text-[var(--text-faint)]">No hay preguntas con «{q}».</p>}
      {lista.map(({ p, i }) => (
        <div key={i} className={`st-acordeon ${abiertas.has(i) ? "st-acordeon-on" : ""}`}>
          <button type="button" className="st-acordeon-cab" aria-expanded={abiertas.has(i)} onClick={() => alternar(i)}>
            <span className="st-num st-num-sm" style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }}>?</span>
            <span className="flex-1 text-left font-semibold text-[var(--text)]">{p.q}</span>
            <ChevronDown size={18} className={`st-flecha ${abiertas.has(i) ? "st-flecha-on" : ""}`} aria-hidden />
          </button>
          {abiertas.has(i) && <p className="px-5 pb-4 pl-[3.6rem] leading-relaxed text-[var(--text-muted)]"><Texto>{p.a}</Texto></p>}
        </div>
      ))}
    </div>
  );
}

// ---------- Línea de tiempo ----------

export function VistaLinea({ d, clave }: { d: NonNullable<Contenido["linea"]>; clave?: string }) {
  const [hechos, setHechos] = usePersist<number[]>(clave, "linea", []);
  const [activo, setActivo] = useState(0);
  const [juega, setJuega] = useState(false);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const ok = new Set(hechos);

  useEffect(() => {
    if (!juega) return;
    const id = setInterval(() => setActivo((a) => { if (a >= d.length - 1) { setJuega(false); return a; } return a + 1; }), 2600);
    return () => clearInterval(id);
  }, [juega, d.length]);
  useEffect(() => {
    refs.current[activo]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activo]);

  const marca = (i: number) => setHechos((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  const tecla = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setActivo((a) => Math.min(d.length - 1, a + 1)); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setActivo((a) => Math.max(0, a - 1)); }
  };
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 outline-none" tabIndex={0} onKeyDown={tecla}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`st-btn ${juega ? "" : "st-btn-fuerte"}`} onClick={() => { if (!juega && activo >= d.length - 1) setActivo(0); setJuega((j) => !j); }}>{juega ? <><Pause size={15} aria-hidden /> Pausar</> : <><Play size={15} aria-hidden /> Reproducir recorrido</>}</button>
        <span className="ml-auto flex min-w-40 flex-1 items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)] sm:max-w-xs"><Barra valor={ok.size} total={d.length} /> {ok.size}/{d.length} hechos</span>
      </div>
      <ol className="st-linea">
        {d.map((p, i) => (
          <li key={i} ref={(el) => { refs.current[i] = el; }} style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }} className={i === activo ? "st-linea-activo" : i < activo ? "st-linea-pasado" : ""}>
            <button type="button" className="st-linea-punto" onClick={() => setActivo(i)} aria-label={`Ir al paso ${i + 1}`}>{ok.has(i) ? <Check size={16} aria-hidden /> : i + 1}</button>
            <div className="st-linea-tarjeta" onClick={() => setActivo(i)}>
              <h3 className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{p.etiqueta}</h3>
              <p className="mt-1 leading-relaxed text-[var(--text-muted)]"><Texto>{p.texto}</Texto></p>
              {i === activo && (
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--text)]" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="h-4 w-4 accent-[#72BF44]" checked={ok.has(i)} onChange={() => marca(i)} /> Ya lo tengo claro
                </label>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- Glosario ----------

const inicial = (t: string) => (t.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase() || "#");

type Ronda = { definicion: string; opciones: string[]; correcta: string };

export function VistaGlosario({ d }: { d: NonNullable<Contenido["glosario"]> }) {
  const [pestana, setPestana] = useState<"explorar" | "practicar">("explorar");
  const [q, setQ] = useState("");
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const lista = useMemo(() => [...d].sort((a, b) => norm(a.termino).localeCompare(norm(b.termino))).filter((x) => !q || norm(`${x.termino} ${x.definicion}`).includes(norm(q))), [d, q]);
  const letras = [...new Set(lista.map((x) => inicial(x.termino)))];

  const [rondas, setRondas] = useState<Ronda[]>([]);
  const [r, setR] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(0);
  const armar = () => {
    const base = barajar(d).slice(0, 8);
    setRondas(base.map((x) => ({ definicion: x.definicion, correcta: x.termino, opciones: barajar([x.termino, ...barajar(d.filter((y) => y.termino !== x.termino)).slice(0, 3).map((y) => y.termino)]) })));
    setR(0); setPick(null); setPuntos(0);
  };
  const practicar = () => { armar(); setPestana("practicar"); };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="st-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={pestana === "explorar"} className={pestana === "explorar" ? "on" : ""} onClick={() => setPestana("explorar")}>Explorar</button>
        <button type="button" role="tab" aria-selected={pestana === "practicar"} className={pestana === "practicar" ? "on" : ""} onClick={practicar} disabled={d.length < 4}>Practicar</button>
      </div>
      {pestana === "explorar" ? (
        <>
          <label className="st-buscar">
            <Search size={18} aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar entre ${d.length} términos…`} aria-label="Buscar en el glosario" />
            {q && <button type="button" onClick={() => setQ("")} aria-label="Borrar"><X size={16} /></button>}
          </label>
          {lista.length === 0 ? (
            <p className="py-8 text-center text-[var(--text-faint)]">No hay términos con «{q}».</p>
          ) : (
            letras.map((l) => (
              <section key={l} className="flex gap-4">
                <span className="st-letra-grande">{l}</span>
                <dl className="flex flex-1 flex-col gap-3">
                  {lista.filter((x) => inicial(x.termino) === l).map((x, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] p-4">
                      <dt className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{x.termino}</dt>
                      <dd className="mt-1 leading-relaxed text-[var(--text-muted)]"><Texto>{x.definicion}</Texto></dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))
          )}
        </>
      ) : rondas.length > 0 && r >= rondas.length ? (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <Anillo valor={puntos} total={rondas.length} />
          <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{puntos === rondas.length ? "¡Perfecto!" : `Acertó ${puntos} de ${rondas.length}`}</p>
          <div className="flex gap-3"><button type="button" className="st-btn st-btn-fuerte" onClick={armar}><RotateCcw size={16} /> Otra ronda</button><button type="button" className="st-btn" onClick={() => setPestana("explorar")}>Ver el glosario</button></div>
        </div>
      ) : rondas[r] ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]"><span>Ronda {r + 1} de {rondas.length}</span><Barra valor={r} total={rondas.length} /><span>{puntos} aciertos</span></div>
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">¿Qué término se define así?</p>
          <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] sm:text-2xl">{rondas[r].definicion}</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {rondas[r].opciones.map((o) => {
              const ok = pick !== null && o === rondas[r].correcta;
              const mal = pick === o && o !== rondas[r].correcta;
              return (
                <button key={o} type="button" disabled={pick !== null} onClick={() => { setPick(o); if (o === rondas[r].correcta) setPuntos((p) => p + 1); }} className={`st-opcion ${ok ? "st-opcion-ok" : mal ? "st-opcion-mal" : ""}`}>
                  <span className="st-letra">{ok ? <Check size={15} /> : mal ? <X size={15} /> : "·"}</span><span className="flex-1 text-left">{o}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end"><button type="button" className="st-btn st-btn-fuerte" disabled={pick === null} onClick={() => { setR(r + 1); setPick(null); }}>{r === rondas.length - 1 ? "Ver resultado" : "Siguiente"}</button></div>
        </div>
      ) : null}
    </div>
  );
}
