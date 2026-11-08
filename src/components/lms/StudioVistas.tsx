"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Lightbulb, Maximize2, Minus, Plus, RotateCcw, Search, Shuffle, Sparkles, Target, X } from "lucide-react";
import type { Contenido, Nodo } from "@/lib/lms/studio-tipos";

// Vistas de cada material del Studio. Reciben el contenido ya guardado (nada se genera aquí) y lo muestran con interacción:
// mapa mental que se abre y cierra, tarjetas que se voltean, cuestionario con avance, línea de tiempo, glosario con búsqueda…

const VERDE = "#72BF44";
const VINO = "#89114C";
const RAMAS = [VERDE, VINO, "#C9992B", "#1B7F73", "#D9772E", "#3C6DB0"];

/** Texto con **negrita** (sin HTML). */
export function Texto({ children, className }: { children: string; className?: string }) {
  return (
    <span className={className}>
      {children.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i} className="font-bold text-[var(--text)]">{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}
    </span>
  );
}

const parrafos = (t: string) => t.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);

// ---------- Ventana ----------

export function Visor({ titulo, subtitulo, icono, color, onClose, children }: { titulo: string; subtitulo: string; icono: ReactNode; color: string; onClose: () => void; children: ReactNode }) {
  const cierre = useRef<HTMLButtonElement>(null);
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
        <div className="st-cuerpo">{children}</div>
      </section>
    </div>,
    document.body,
  );
}

// ---------- Resumen ----------

export function VistaResumen({ d }: { d: NonNullable<Contenido["resumen"]> }) {
  return (
    <div className="flex flex-col gap-7">
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
          <li key={i} className="st-punto" style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }}>
            <span className="st-num">{i + 1}</span>
            <div>
              {p.titulo && <h3 className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{p.titulo}</h3>}
              <p className="mt-1 leading-relaxed text-[var(--text-muted)]"><Texto>{p.texto}</Texto></p>
            </div>
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

export function VistaGuia({ d }: { d: NonNullable<Contenido["guia"]> }) {
  const [hechas, setHechas] = useState<Set<number>>(new Set());
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
          <h3 className="st-h3"><Search size={18} aria-hidden /> Preguntas de repaso</h3>
          <p className="mt-1 text-sm text-[var(--text-faint)]">Piense su respuesta y luego ábrala para comprobarla.</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {d.repaso.map((r, i) => (
              <details key={i} className="st-acordeon">
                <summary><span className="st-num st-num-sm">{i + 1}</span><span className="flex-1 font-semibold text-[var(--text)]">{r.pregunta}</span><ChevronDown size={18} className="st-flecha" aria-hidden /></summary>
                <p className="px-5 pb-4 pl-[3.6rem] leading-relaxed text-[var(--text-muted)]"><Texto>{r.respuesta}</Texto></p>
              </details>
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
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#72BF44]" checked={hechas.has(i)} onChange={() => setHechas((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })} />
                  <span className={hechas.has(i) ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]"}><Texto>{a}</Texto></span>
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
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      {d.titulo && <h3 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">{d.titulo}</h3>}
      {d.introduccion && <p className="border-l-4 pl-5 text-lg leading-relaxed text-[var(--text-muted)]" style={{ borderColor: VERDE }}><Texto>{d.introduccion}</Texto></p>}
      {d.secciones.map((s, i) => (
        <section key={i} className="flex flex-col gap-3">
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

export function VistaMapa({ d }: { d: Nodo }) {
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set(["0", ...(d.hijos ?? []).map((_, i) => `0.${i}`)]));
  const [zoom, setZoom] = useState(1);
  const caja = useRef<HTMLDivElement>(null);
  const g = useMemo(() => distribuir(d, abiertos), [d, abiertos]);

  // Ajusta el mapa para que quepa completo en la ventana (ancho y alto).
  const ajuste = (ancho: number, alto: number) => {
    const w = caja.current?.clientWidth ?? 800;
    const h = caja.current?.clientHeight ?? 560;
    return Math.max(0.4, Math.min(1.15, (w - 6) / ancho, (h - 6) / alto));
  };
  const ajustar = () => setZoom(ajuste(g.ancho, g.alto));
  // Al abrir, el mapa se ajusta a lo que hay disponible.
  useEffect(() => {
    const ini = distribuir(d, new Set(["0", ...(d.hijos ?? []).map((_, i) => `0.${i}`)]));
    setZoom(ajuste(ini.ancho, ini.alto));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  const alternar = (id: string) => setAbiertos((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" className="st-btn" onClick={() => setAbiertos(new Set(conHijos(d, "0")))}><Maximize2 size={15} aria-hidden /> Abrir todo</button>
        <button type="button" className="st-btn" onClick={() => setAbiertos(new Set(["0"]))}><Minus size={15} aria-hidden /> Solo ramas</button>
        <span className="mx-1 hidden h-5 w-px bg-[var(--border-strong)] sm:block" />
        <button type="button" className="st-btn st-btn-ico" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} aria-label="Alejar"><Minus size={15} /></button>
        <span className="w-11 text-center text-xs font-bold tabular-nums text-[var(--text-muted)]">{Math.round(zoom * 100)} %</span>
        <button type="button" className="st-btn st-btn-ico" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} aria-label="Acercar"><Plus size={15} /></button>
        <button type="button" className="st-btn" onClick={ajustar}>Ajustar</button>
        <span className="ml-auto text-xs text-[var(--text-faint)]">Toque una idea para abrirla o cerrarla</span>
      </div>
      <div ref={caja} className="st-lienzo">
        <div style={{ width: g.ancho * zoom, height: g.alto * zoom }}>
          <div style={{ width: g.ancho, height: g.alto, transform: `scale(${zoom})`, transformOrigin: "0 0", position: "relative" }}>
            <svg width={g.ancho} height={g.alto} className="absolute left-0 top-0" aria-hidden>
              {g.lineas.map(({ a, b }, i) => {
                const x1 = a.x + a.w;
                const x2 = b.x;
                const k = (x2 - x1) * 0.55;
                return <path key={i} d={`M${x1} ${a.y} C${x1 + k} ${a.y}, ${x2 - k} ${b.y}, ${x2} ${b.y}`} fill="none" stroke={RAMAS[b.c % RAMAS.length]} strokeWidth={b.d === 1 ? 3 : 2} strokeLinecap="round" opacity={b.d === 1 ? 0.9 : 0.65} />;
              })}
            </svg>
            {g.nodos.map((p) => {
              const color = RAMAS[p.c % RAMAS.length];
              const raiz = p.d === 0;
              const rama = p.d === 1;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => p.n > 0 && alternar(p.id)}
                  aria-expanded={p.n > 0 ? p.abierto : undefined}
                  title={p.t}
                  className={`st-nodo ${raiz ? "st-nodo-raiz" : rama ? "st-nodo-rama" : "st-nodo-hoja"} ${p.n > 0 ? "cursor-pointer" : "cursor-default"}`}
                  style={{ left: p.x, top: p.y - p.h / 2, width: p.w, height: p.h, ["--st-color" as string]: color }}
                >
                  <span className="line-clamp-3">{p.t}</span>
                  {p.n > 0 && <span className="st-nodo-mas" aria-hidden>{p.abierto ? <Minus size={13} /> : <>+{p.n}</>}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tarjetas ----------

export function VistaTarjetas({ d }: { d: NonNullable<Contenido["tarjetas"]> }) {
  const [orden, setOrden] = useState<number[]>(() => d.map((_, i) => i));
  const [i, setI] = useState(0);
  const [voltea, setVoltea] = useState(false);
  const [sabidas, setSabidas] = useState<Set<number>>(new Set());
  const [vistas, setVistas] = useState<Set<number>>(new Set());
  const total = orden.length;
  const terminado = total > 0 && vistas.size >= total;
  const c = d[orden[i]];

  const ir = (n: number) => { setI(Math.max(0, Math.min(total - 1, n))); setVoltea(false); };
  const marcar = (sabe: boolean) => {
    setSabidas((s) => { const n = new Set(s); if (sabe) n.add(orden[i]); else n.delete(orden[i]); return n; });
    setVistas((s) => new Set(s).add(orden[i]));
    if (i < total - 1) ir(i + 1);
    else setVoltea(false);
  };
  const reiniciar = (soloFaltan: boolean) => {
    const base = d.map((_, k) => k).filter((k) => !soloFaltan || !sabidas.has(k));
    setOrden(base.length ? base : d.map((_, k) => k));
    setI(0); setVoltea(false); setVistas(new Set());
    if (!soloFaltan) setSabidas(new Set());
  };
  const mezclar = () => { setOrden((o) => [...o].sort(() => Math.random() - 0.5)); setI(0); setVoltea(false); };
  const tecla = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") ir(i + 1);
    else if (e.key === "ArrowLeft") ir(i - 1);
    else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setVoltea((v) => !v); }
  };

  if (terminado) {
    const sabe = orden.filter((k) => sabidas.has(k)).length;
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
    <div className="mx-auto flex max-w-2xl flex-col gap-5 outline-none" tabIndex={0} onKeyDown={tecla} aria-label="Tarjetas didácticas: use las flechas para cambiar y la barra espaciadora para voltear">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">
        <span>Tarjeta {i + 1} de {total}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full" style={{ width: `${((vistas.size) / total) * 100}%`, background: VERDE }} /></span>
        <span style={{ color: "#3d7a22" }}>{sabidas.size} sabidas</span>
        <button type="button" onClick={mezclar} className="st-btn st-btn-ico" aria-label="Mezclar"><Shuffle size={14} /></button>
      </div>
      <button type="button" onClick={() => setVoltea((v) => !v)} className={`st-tarjeta ${voltea ? "st-tarjeta-on" : ""}`} aria-label={voltea ? "Ver la pregunta" : "Ver la respuesta"}>
        <span className="st-tarjeta-in">
          <span className="st-cara st-frente"><small>Pregunta</small><b><Texto>{c.q}</Texto></b><em>Toque para ver la respuesta</em></span>
          <span className="st-cara st-dorso"><small>Respuesta</small><b className="!font-medium"><Texto>{c.a}</Texto></b><em>Toque para volver</em></span>
        </span>
      </button>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="st-btn" onClick={() => ir(i - 1)} disabled={i === 0}>Anterior</button>
        <button type="button" className="st-btn st-btn-no" onClick={() => marcar(false)}>Repasar</button>
        <button type="button" className="st-btn st-btn-fuerte" onClick={() => marcar(true)}><Check size={16} /> La sé</button>
        <button type="button" className="st-btn" onClick={() => ir(i + 1)} disabled={i === total - 1}>Siguiente</button>
      </div>
    </div>
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

// ---------- Cuestionario ----------

export function VistaCuestionario({ d }: { d: NonNullable<Contenido["cuestionario"]> }) {
  const [paso, setPaso] = useState(0);
  const [resp, setResp] = useState<(number | null)[]>(() => d.map(() => null));
  const [fin, setFin] = useState(false);
  const q = d[paso];
  const elegida = resp[paso];
  const aciertos = resp.filter((r, i) => r === d[i].correct).length;
  const reintentar = () => { setResp(d.map(() => null)); setPaso(0); setFin(false); };

  if (fin) {
    const pct = Math.round((aciertos / d.length) * 100);
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-4 text-center">
        <Anillo valor={aciertos} total={d.length} />
        <div>
          <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{pct >= 80 ? "¡Excelente trabajo!" : pct >= 50 ? "Va por buen camino" : "Vale la pena repasar la lección"}</p>
          <p className="mt-1 text-[var(--text-muted)]">Acertó {aciertos} de {d.length} preguntas.</p>
        </div>
        {aciertos < d.length && (
          <ul className="flex w-full flex-col gap-2 text-left">
            {d.map((p, i) => resp[i] !== p.correct && (
              <li key={i} className="rounded-xl border border-[var(--border)] p-4">
                <p className="font-semibold text-[var(--text)]">{p.q}</p>
                <p className="mt-1 text-sm text-[#3d7a22]"><b>Respuesta: </b>{p.options[p.correct]}</p>
                {p.why && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{p.why}</p>}
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="st-btn st-btn-fuerte" onClick={reintentar}><RotateCcw size={16} /> Intentar de nuevo</button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-1.5" aria-label={`Pregunta ${paso + 1} de ${d.length}`}>
        {d.map((_, i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < paso || (i === paso && elegida !== null) ? (resp[i] === d[i].correct ? VERDE : VINO) : i === paso ? "rgba(114,191,68,0.45)" : "var(--bg-sunken)" }} />)}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">Pregunta {paso + 1} de {d.length}</p>
      <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] sm:text-2xl">{q.q}</h3>
      <div className="flex flex-col gap-2.5">
        {q.options.map((o, k) => {
          const elegido = elegida === k;
          const correcta = elegida !== null && k === q.correct;
          const mala = elegido && k !== q.correct;
          return (
            <button key={k} type="button" disabled={elegida !== null} onClick={() => setResp((r) => r.map((x, i) => (i === paso ? k : x)))} className={`st-opcion ${correcta ? "st-opcion-ok" : mala ? "st-opcion-mal" : ""}`}>
              <span className="st-letra">{correcta ? <Check size={15} /> : mala ? <X size={15} /> : String.fromCharCode(65 + k)}</span>
              <span className="flex-1 text-left">{o}</span>
            </button>
          );
        })}
      </div>
      {elegida !== null && (
        <div className={`rounded-xl p-4 text-[0.95rem] leading-relaxed ${elegida === q.correct ? "bg-[rgba(114,191,68,0.14)] text-[var(--text)]" : "bg-[rgba(137,17,76,0.08)] text-[var(--text)]"}`}>
          <b>{elegida === q.correct ? "¡Correcto! " : "No es esa. "}</b>{q.why || (elegida === q.correct ? "" : `La respuesta es: ${q.options[q.correct]}`)}
        </div>
      )}
      <div className="flex justify-end">
        <button type="button" disabled={elegida === null} className="st-btn st-btn-fuerte" onClick={() => (paso < d.length - 1 ? setPaso(paso + 1) : setFin(true))}>{paso < d.length - 1 ? "Siguiente" : "Ver resultado"}</button>
      </div>
    </div>
  );
}

// ---------- Preguntas frecuentes ----------

export function VistaFaq({ d }: { d: NonNullable<Contenido["faq"]> }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {d.map((p, i) => (
        <details key={i} className="st-acordeon" open={i === 0}>
          <summary><span className="st-num st-num-sm" style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length] }}>?</span><span className="flex-1 font-semibold text-[var(--text)]">{p.q}</span><ChevronDown size={18} className="st-flecha" aria-hidden /></summary>
          <p className="px-5 pb-4 pl-[3.6rem] leading-relaxed text-[var(--text-muted)]"><Texto>{p.a}</Texto></p>
        </details>
      ))}
    </div>
  );
}

// ---------- Línea de tiempo ----------

export function VistaLinea({ d }: { d: NonNullable<Contenido["linea"]> }) {
  return (
    <ol className="st-linea mx-auto max-w-3xl">
      {d.map((p, i) => (
        <li key={i} style={{ ["--st-color" as string]: RAMAS[i % RAMAS.length], animationDelay: `${i * 70}ms` }}>
          <span className="st-linea-punto">{i + 1}</span>
          <div className="st-linea-tarjeta">
            <h3 className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{p.etiqueta}</h3>
            <p className="mt-1 leading-relaxed text-[var(--text-muted)]"><Texto>{p.texto}</Texto></p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- Glosario ----------

const inicial = (t: string) => (t.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase() || "#");

export function VistaGlosario({ d }: { d: NonNullable<Contenido["glosario"]> }) {
  const [q, setQ] = useState("");
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const lista = useMemo(() => [...d].sort((a, b) => norm(a.termino).localeCompare(norm(b.termino))).filter((x) => !q || norm(`${x.termino} ${x.definicion}`).includes(norm(q))), [d, q]);
  const letras = [...new Set(lista.map((x) => inicial(x.termino)))];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
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
    </div>
  );
}
