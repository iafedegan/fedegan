"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Brain, Check, Flame, Heart, Layers, ListOrdered, RotateCcw, Shapes, Timer, X, Zap } from "lucide-react";
import { afirmacionesVF, barajar, clasificacion, elegirPorVoz, paresMemoria, pasosOrden, preguntasRapidas, type JuegoId, type Par, type Rapida, type VF } from "@/lib/lms/studio-juegos-datos";
import { dar, estrellas as guardarEstrellas, leerEstado, sonar } from "@/lib/lms/studio-juego";
import type { Contenido } from "@/lib/lms/studio-tipos";
import { Confeti, Estrellas } from "@/components/lms/StudioEfectos";
import { Dictar, hablar } from "@/components/lms/StudioVoz";

// Cinco juegos para repasar con lo ya generado: memoria, reto relámpago, verdadero o falso, ordenar pasos y clasificar ideas.
// Dan estrellas (0 a 3) y XP; el mejor resultado de cada juego se guarda en este navegador.

export const JUEGOS: Record<JuegoId, { titulo: string; sub: string; Icon: typeof Brain; fondo: string }> = {
  memoria: { titulo: "Memoria", sub: "Encuentre las parejas", Icon: Brain, fondo: "linear-gradient(135deg,#72BF44,#2c6a14)" },
  relampago: { titulo: "Reto relámpago", sub: "60 segundos, 3 vidas", Icon: Zap, fondo: "linear-gradient(135deg,#D9772E,#89114C)" },
  vf: { titulo: "Verdadero o falso", sub: "Deslice la tarjeta", Icon: Layers, fondo: "linear-gradient(135deg,#3C6DB0,#1B7F73)" },
  ordena: { titulo: "Ordene los pasos", sub: "Arme la secuencia", Icon: ListOrdered, fondo: "linear-gradient(135deg,#C9992B,#D9772E)" },
  clasifica: { titulo: "Clasifique ideas", sub: "Cada idea en su rama", Icon: Shapes, fondo: "linear-gradient(135deg,#89114C,#3C6DB0)" },
};

type Props = { contenido: Contenido; clave: string };

function Resultado({ titulo, n, detalle, onRepetir }: { titulo: string; n: number; detalle: string; onRepetir: () => void }) {
  return (
    <div className="relative flex flex-col items-center gap-5 py-8 text-center">
      {n >= 1 && <Confeti />}
      <Estrellas n={n} grande />
      <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">{titulo}</p>
      <p className="max-w-md text-[var(--text-muted)]">{detalle}</p>
      <button type="button" className="st-btn st-btn-fuerte" onClick={onRepetir}><RotateCcw size={16} aria-hidden /> Jugar otra vez</button>
    </div>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---------- Memoria ----------

type Carta = { k: number; par: number; texto: string; lado: 0 | 1 };
const armarMazo = (pares: Par[]): Carta[] => barajar(pares.flatMap((p, i) => [{ par: i, texto: p.a, lado: 0 as const }, { par: i, texto: p.b, lado: 1 as const }])).map((c, k) => ({ ...c, k }));

export function JuegoMemoria({ contenido, clave }: Props) {
  const pares = useMemo(() => paresMemoria(contenido), [contenido]);
  const [mazo, setMazo] = useState<Carta[]>(() => armarMazo(pares));
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [halladas, setHalladas] = useState<Set<number>>(new Set());
  const [intentos, setIntentos] = useState(0);
  const [ini, setIni] = useState<number | null>(null);
  const [seg, setSeg] = useState(0);
  const [fin, setFin] = useState<{ n: number; seg: number } | null>(null);
  const bloqueo = useRef(false);

  useEffect(() => {
    if (ini === null || fin) return;
    const id = setInterval(() => setSeg(Math.floor((Date.now() - ini) / 1000)), 500);
    return () => clearInterval(id);
  }, [ini, fin]);

  const reiniciar = () => { setMazo(armarMazo(pares)); setAbiertas([]); setHalladas(new Set()); setIntentos(0); setIni(null); setSeg(0); setFin(null); bloqueo.current = false; };

  const voltear = (k: number) => {
    if (bloqueo.current || fin || abiertas.includes(k) || halladas.has(mazo[k].par)) return;
    sonar("clic");
    if (ini === null) setIni(Date.now());
    const nuevas = [...abiertas, k];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;
    const [a, b] = nuevas.map((x) => mazo[x]);
    const intentosAhora = intentos + 1;
    setIntentos(intentosAhora);
    if (a.par === b.par) {
      sonar("ok");
      const h = new Set(halladas).add(a.par);
      setHalladas(h);
      setAbiertas([]);
      if (h.size === pares.length) {
        const s = Math.floor((Date.now() - (ini ?? Date.now())) / 1000);
        const n = intentosAhora <= Math.ceil(pares.length * 1.4) ? 3 : intentosAhora <= pares.length * 2.2 ? 2 : 1;
        guardarEstrellas("memoria", clave, n, "Memoria completada");
        setSeg(s);
        setFin({ n, seg: s });
      }
    } else {
      bloqueo.current = true;
      sonar("mal");
      setTimeout(() => { setAbiertas([]); bloqueo.current = false; }, 950);
    }
  };

  if (fin) return <Resultado titulo={fin.n === 3 ? "¡Memoria de elefante!" : "¡Lo logró!"} n={fin.n} detalle={`${pares.length} parejas en ${intentos} intentos y ${mmss(fin.seg)}.`} onRepetir={reiniciar} />;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">
        <span>{halladas.size} de {pares.length} parejas</span>
        <span>{intentos} intentos</span>
        <span className="inline-flex items-center gap-1 tabular-nums"><Timer size={13} aria-hidden /> {mmss(seg)}</span>
      </div>
      <p className="text-sm text-[var(--text-muted)]">Toque dos cartas: una trae el término y otra su definición.</p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {mazo.map((c) => {
          const arriba = abiertas.includes(c.k) || halladas.has(c.par);
          return (
            <button key={c.k} type="button" onClick={() => voltear(c.k)} aria-label={arriba ? c.texto : "Carta boca abajo"} className={`st-mem ${arriba ? "st-mem-on" : ""} ${halladas.has(c.par) ? "st-mem-ok" : ""}`}>
              <span className="st-mem-in">
                <span className="st-mem-cara st-mem-atras"><Brain size={26} aria-hidden /></span>
                <span className={`st-mem-cara st-mem-frente ${c.lado === 0 ? "st-mem-termino" : ""}`}>{c.texto}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Reto relámpago ----------

const DURACION = 60;

export function JuegoRelampago({ contenido, clave }: Props) {
  const [preg, setPreg] = useState<Rapida[]>([]);
  const [fase, setFase] = useState<"inicio" | "juego" | "fin">("inicio");
  const [i, setI] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [t, setT] = useState(DURACION);
  const [marca, setMarca] = useState<{ k: number; ok: boolean } | null>(null);
  const [res, setRes] = useState({ n: 0, puntos: 0, aciertos: 0 });
  const bloqueo = useRef(false);
  const ref = useRef({ puntos: 0, vidas: 3, racha: 0, aciertos: 0 });
  const q = preg[i];

  const terminar = () => {
    if (fase === "fin") return;
    const p = ref.current.puntos;
    const n = p >= 150 ? 3 : p >= 90 ? 2 : p >= 30 ? 1 : 0;
    guardarEstrellas("relampago", clave, n, "Reto relámpago", { xp: Math.round(p / 5), extra: (e) => ({ ...e, contadores: { ...e.contadores, relampago: Math.max(e.contadores.relampago ?? 0, p) } }) });
    setRes({ n, puntos: p, aciertos: ref.current.aciertos });
    setFase("fin");
  };

  const empezar = () => {
    setPreg(barajar(preguntasRapidas(contenido)));
    ref.current = { puntos: 0, vidas: 3, racha: 0, aciertos: 0 };
    setI(0); setPuntos(0); setRacha(0); setVidas(3); setT(DURACION); setMarca(null); bloqueo.current = false;
    setFase("juego");
  };

  useEffect(() => {
    if (fase !== "juego") return;
    const id = setInterval(() => setT((x) => x - 1), 1000);
    return () => clearInterval(id);
  }, [fase]);
  useEffect(() => {
    if (fase !== "juego") return;
    if (t <= 0) terminar();
    else if (t <= 5) sonar("tic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, fase]);

  // Con la voz activada, lee cada pregunta con sus opciones.
  useEffect(() => {
    if (fase !== "juego" || !q || !leerEstado().voz) return;
    return hablar(`${q.q}. ${q.opciones.map((o, k) => `${"ABCD"[k]}: ${o}`).join(". ")}`, { rate: 1.1 });
  }, [fase, q]);

  const responder = (k: number) => {
    if (bloqueo.current || fase !== "juego" || !q) return;
    bloqueo.current = true;
    const ok = k === q.correcta;
    setMarca({ k, ok });
    if (ok) {
      const mult = 1 + Math.min(2, Math.floor(ref.current.racha / 3));
      ref.current.puntos += 10 * mult;
      ref.current.racha += 1;
      ref.current.aciertos += 1;
      sonar("ok");
    } else {
      ref.current.racha = 0;
      ref.current.vidas -= 1;
      sonar("mal");
    }
    setPuntos(ref.current.puntos); setRacha(ref.current.racha); setVidas(ref.current.vidas);
    setTimeout(() => {
      setMarca(null);
      bloqueo.current = false;
      if (ref.current.vidas <= 0 || i + 1 >= preg.length) terminar();
      else setI((n) => n + 1);
    }, ok ? 420 : 900);
  };

  useEffect(() => {
    if (fase !== "juego") return;
    const tecla = (e: KeyboardEvent) => {
      const k = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (k >= 0) responder(k);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  if (fase === "inicio") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl text-white" style={{ background: JUEGOS.relampago.fondo }}><Zap size={30} aria-hidden /></span>
        <h3 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Reto relámpago</h3>
        <ul className="flex flex-col gap-1.5 text-left text-[var(--text-muted)]">
          <li className="flex items-center gap-2"><Timer size={16} aria-hidden /> Tiene {DURACION} segundos.</li>
          <li className="flex items-center gap-2"><Heart size={16} aria-hidden /> Cada error le quita una de sus 3 vidas.</li>
          <li className="flex items-center gap-2"><Flame size={16} aria-hidden /> Cada 3 aciertos seguidos multiplican los puntos (hasta ×3).</li>
        </ul>
        <button type="button" className="st-btn st-btn-fuerte !px-8 !py-3 !text-base" onClick={empezar}>¡Empezar!</button>
        <p className="text-xs text-[var(--text-faint)]">Puede responder con las teclas 1 a 4 (o A a D).</p>
      </div>
    );
  }
  if (fase === "fin") {
    return <Resultado titulo={res.n === 3 ? "¡Imparable!" : res.n >= 1 ? "¡Buen reto!" : "¡Casi!"} n={res.n} detalle={`${res.puntos} puntos · ${res.aciertos} aciertos. ${res.n < 3 ? "Con 150 puntos gana las tres estrellas." : ""}`} onRepetir={empezar} />;
  }
  const mult = 1 + Math.min(2, Math.floor(racha / 3));
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex gap-1" aria-label={`${vidas} vidas`}>{[0, 1, 2].map((k) => <Heart key={k} size={20} style={{ color: "#89114C", fill: k < vidas ? "#89114C" : "transparent", opacity: k < vidas ? 1 : 0.3 }} aria-hidden />)}</span>
        <div className="mx-2 h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${(t / DURACION) * 100}%`, background: t <= 10 ? "#89114C" : "#72BF44" }} /></div>
        <span className={`w-10 text-right font-mono text-lg font-bold tabular-nums ${t <= 10 ? "text-[#89114C]" : "text-[var(--text)]"}`}>{Math.max(0, t)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-[var(--font-display)] text-3xl font-extrabold tabular-nums text-[var(--text)]">{puntos}<small className="ml-1 text-sm font-bold text-[var(--text-faint)]">pts</small></span>
        <span className={`st-combo ${mult > 1 ? "st-combo-on" : ""}`}><Flame size={16} aria-hidden /> ×{mult} · racha {racha}</span>
        <Dictar etiqueta="Voz" alTexto={(txt, final) => { if (!final) return; const k = elegirPorVoz(txt, q?.opciones ?? []); if (k >= 0) responder(k); }} />
      </div>
      {q && (
        <>
          <h3 className="min-h-[3.5rem] font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] sm:text-2xl">{q.q}</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {q.opciones.map((o, k) => {
              const ok = marca !== null && k === q.correcta;
              const mal = marca?.k === k && !marca.ok;
              return (
                <button key={k} type="button" onClick={() => responder(k)} className={`st-opcion ${ok ? "st-opcion-ok" : mal ? "st-opcion-mal st-sacude" : ""}`}>
                  <span className="st-letra">{ok ? <Check size={15} /> : mal ? <X size={15} /> : "ABCD"[k]}</span><span className="flex-1 text-left">{o}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Verdadero o falso ----------

export function JuegoVF({ contenido, clave }: Props) {
  const [items, setItems] = useState<VF[]>(() => afirmacionesVF(contenido));
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; correcta: string } | null>(null);
  const [dx, setDx] = useState(0);
  const [fin, setFin] = useState<number | null>(null);
  const arr = useRef<{ x: number; mov: boolean } | null>(null);
  const bloqueo = useRef(false);
  const x = items[i];

  const responder = (dice: boolean) => {
    if (bloqueo.current || fin !== null || !x) return;
    bloqueo.current = true;
    const ok = dice === x.verdad;
    sonar(ok ? "ok" : "mal");
    const a = aciertos + (ok ? 1 : 0);
    setAciertos(a);
    setRacha(ok ? racha + 1 : 0);
    setFb({ ok, correcta: x.correcta });
    setTimeout(() => {
      setFb(null); setDx(0);
      bloqueo.current = false;
      if (i + 1 >= items.length) {
        const pct = a / items.length;
        const n = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
        guardarEstrellas("vf", clave, n, "Verdadero o falso");
        setFin(n);
      } else setI(i + 1);
    }, ok ? 650 : 1500);
  };
  const reiniciar = () => { setItems(afirmacionesVF(contenido)); setI(0); setAciertos(0); setRacha(0); setFb(null); setDx(0); setFin(null); bloqueo.current = false; };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === "ArrowRight") responder(true); else if (e.key === "ArrowLeft") responder(false); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  const bajar = (e: RPointerEvent<HTMLDivElement>) => { arr.current = { x: e.clientX, mov: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const mover = (e: RPointerEvent<HTMLDivElement>) => { if (!arr.current) return; const v = e.clientX - arr.current.x; if (Math.abs(v) > 6) arr.current.mov = true; if (arr.current.mov) setDx(v); };
  const subir = () => { const a = arr.current; arr.current = null; if (a?.mov && Math.abs(dx) > 110) responder(dx > 0); else setDx(0); };

  if (fin !== null) return <Resultado titulo={fin === 3 ? "¡Ojo de águila!" : "¡Terminó la ronda!"} n={fin} detalle={`Acertó ${aciertos} de ${items.length}.`} onRepetir={reiniciar} />;
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">
        <span>{i + 1} de {items.length}</span>
        <span className={`st-combo ${racha >= 3 ? "st-combo-on" : ""}`}><Flame size={14} aria-hidden /> racha {racha}</span>
        <span>{aciertos} aciertos</span>
      </div>
      <p className="text-center text-sm text-[var(--text-muted)]">¿La respuesta propuesta es correcta? Deslice a la derecha (verdadero) o a la izquierda (falso).</p>
      <div className="relative" onPointerDown={bajar} onPointerMove={mover} onPointerUp={subir} onPointerCancel={() => { arr.current = null; setDx(0); }} style={{ touchAction: "pan-y" }}>
        <span className="st-deslizar st-deslizar-no" style={{ opacity: Math.min(1, Math.max(0, -dx / 110)) }}>Falso</span>
        <span className="st-deslizar st-deslizar-si" style={{ opacity: Math.min(1, Math.max(0, dx / 110)) }}>Verdadero</span>
        {x && (
          <div className={`st-vf ${fb ? (fb.ok ? "st-vf-ok" : "st-vf-mal") : ""}`} style={{ transform: `translateX(${dx}px) rotate(${dx / 28}deg)`, transition: dx ? "none" : "transform .25s" }}>
            <small>Pregunta</small>
            <b>{x.q}</b>
            <span className="st-vf-prop"><small>Respuesta propuesta</small>{x.mostrada}</span>
            {fb && <em>{fb.ok ? "¡Correcto!" : `No: la correcta es «${fb.correcta}»`}</em>}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="st-btn st-btn-no !py-3 !text-base" onClick={() => responder(false)}><X size={18} aria-hidden /> Falso</button>
        <button type="button" className="st-btn st-btn-fuerte !py-3 !text-base" onClick={() => responder(true)}><Check size={18} aria-hidden /> Verdadero</button>
      </div>
    </div>
  );
}

// ---------- Ordene los pasos ----------

export function JuegoOrdena({ contenido, clave }: Props) {
  const pasos = useMemo(() => pasosOrden(contenido), [contenido]);
  const n = pasos.length;
  const [banco, setBanco] = useState<number[]>(() => barajar(pasos.map((_, i) => i)));
  const [slots, setSlots] = useState<(number | null)[]>(() => pasos.map(() => null));
  const [fijos, setFijos] = useState<Set<number>>(new Set());
  const [malos, setMalos] = useState<Set<number>>(new Set());
  const [intentos, setIntentos] = useState(0);
  const [fin, setFin] = useState<number | null>(null);

  const reiniciar = () => { setBanco(barajar(pasos.map((_, i) => i))); setSlots(pasos.map(() => null)); setFijos(new Set()); setMalos(new Set()); setIntentos(0); setFin(null); };
  const poner = (idx: number) => {
    const s = slots.indexOf(null);
    if (s < 0) return;
    sonar("clic");
    setSlots(slots.map((v, k) => (k === s ? idx : v)));
    setBanco(banco.filter((b) => b !== idx));
  };
  const quitar = (s: number) => {
    if (fijos.has(s) || slots[s] === null) return;
    sonar("clic");
    setBanco([...banco, slots[s] as number]);
    setSlots(slots.map((v, k) => (k === s ? null : v)));
  };
  const comprobar = () => {
    const ok = new Set<number>(fijos);
    const mal = new Set<number>();
    slots.forEach((v, s) => (v === s ? ok.add(s) : mal.add(s)));
    setIntentos((x) => x + 1);
    if (mal.size === 0) {
      sonar("ok");
      const e = intentos === 0 ? 3 : intentos === 1 ? 2 : 1;
      guardarEstrellas("ordena", clave, e, "Secuencia ordenada");
      setFijos(ok);
      setFin(e);
      return;
    }
    sonar("mal");
    setFijos(ok);
    setMalos(mal);
    setTimeout(() => {
      setBanco((b) => [...b, ...[...mal].map((s) => slots[s] as number)]);
      setSlots((sl) => sl.map((v, s) => (mal.has(s) ? null : v)));
      setMalos(new Set());
    }, 900);
  };

  if (fin !== null) return <Resultado titulo={fin === 3 ? "¡Orden perfecto!" : "¡Secuencia lista!"} n={fin} detalle={`Lo logró en ${intentos} ${intentos === 1 ? "intento" : "intentos"}.`} onRepetir={reiniciar} />;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <p className="text-sm text-[var(--text-muted)]">Toque los pasos en el orden correcto. Los que acierte se quedan fijos.</p>
      <ol className="flex flex-col gap-2">
        {slots.map((v, s) => (
          <li key={s}>
            <button type="button" onClick={() => quitar(s)} className={`st-slot ${v === null ? "st-slot-vacio" : ""} ${fijos.has(s) ? "st-slot-ok" : ""} ${malos.has(s) ? "st-slot-mal st-sacude" : ""}`}>
              <span className="st-slot-n">{fijos.has(s) ? <Check size={15} /> : s + 1}</span>
              <span className="flex-1 text-left">{v === null ? "…" : pasos[v]}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2.5" aria-label="Pasos por ordenar">
        {banco.map((idx) => <button key={idx} type="button" onClick={() => poner(idx)} className="st-ficha">{pasos[idx]}</button>)}
      </div>
      <div className="flex justify-end"><button type="button" className="st-btn st-btn-fuerte" disabled={slots.includes(null) || malos.size > 0} onClick={comprobar}>Comprobar</button></div>
      <span className="sr-only">{n} pasos</span>
    </div>
  );
}

// ---------- Clasifique ideas ----------

export function JuegoClasifica({ contenido, clave }: Props) {
  const cl = useMemo(() => clasificacion(contenido), [contenido]);
  const [orden, setOrden] = useState<number[]>(() => barajar((cl?.items ?? []).map((_, i) => i)));
  const [puestas, setPuestas] = useState<Record<number, number>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [fallos, setFallos] = useState(0);
  const [sacude, setSacude] = useState<number | null>(null);
  const [fin, setFin] = useState<number | null>(null);
  if (!cl) return null;

  const reiniciar = () => { setOrden(barajar(cl.items.map((_, i) => i))); setPuestas({}); setSel(null); setFallos(0); setFin(null); };
  const pendientes = orden.filter((i) => puestas[i] === undefined);
  const soltar = (rama: number) => {
    if (sel === null) return;
    if (cl.items[sel].rama === rama) {
      sonar("ok");
      dar(2, "Idea bien clasificada");
      const p = { ...puestas, [sel]: rama };
      setPuestas(p);
      setSel(null);
      if (Object.keys(p).length === cl.items.length) {
        const n = fallos <= 1 ? 3 : fallos <= 4 ? 2 : 1;
        guardarEstrellas("clasifica", clave, n, "Ideas clasificadas");
        setFin(n);
      }
    } else {
      sonar("mal");
      setFallos((f) => f + 1);
      setSacude(rama);
      setTimeout(() => setSacude(null), 500);
    }
  };

  if (fin !== null) return <Resultado titulo={fin === 3 ? "¡Todo en su lugar!" : "¡Clasificación lista!"} n={fin} detalle={`${fallos} ${fallos === 1 ? "error" : "errores"} al clasificar ${cl.items.length} ideas.`} onRepetir={reiniciar} />;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <p className="text-sm text-[var(--text-muted)]">Toque una idea y luego la rama a la que pertenece. {fallos > 0 && <b style={{ color: "#89114C" }}>Errores: {fallos}</b>}</p>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cl.ramas.length}, minmax(0, 1fr))` }}>
        {cl.ramas.map((r, k) => (
          <button key={k} type="button" onClick={() => soltar(k)} className={`st-cubeta ${sel !== null ? "st-cubeta-lista" : ""} ${sacude === k ? "st-sacude" : ""}`} style={{ ["--st-color" as string]: ["#72BF44", "#89114C", "#C9992B", "#1B7F73"][k % 4] }}>
            <b>{r}</b>
            <span className="flex flex-wrap gap-1.5">{cl.items.map((it, i) => puestas[i] === k && <span key={i} className="st-mini">{it.t}</span>)}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {pendientes.map((i) => <button key={i} type="button" onClick={() => { sonar("clic"); setSel(i); }} className={`st-ficha ${sel === i ? "st-ficha-sel" : ""}`}>{cl.items[i].t}</button>)}
      </div>
    </div>
  );
}

export function VistaJuego({ id, contenido, clave }: { id: JuegoId } & Props) {
  switch (id) {
    case "memoria": return <JuegoMemoria contenido={contenido} clave={clave} />;
    case "relampago": return <JuegoRelampago contenido={contenido} clave={clave} />;
    case "vf": return <JuegoVF contenido={contenido} clave={clave} />;
    case "ordena": return <JuegoOrdena contenido={contenido} clave={clave} />;
    case "clasifica": return <JuegoClasifica contenido={contenido} clave={clave} />;
  }
}
