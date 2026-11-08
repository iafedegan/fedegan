"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Mic, MicOff, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { contar, dar } from "@/lib/lms/studio-juego";
import type { Contenido } from "@/lib/lms/studio-tipos";

// Voz del Studio con lo que trae el navegador (sin costo): leer en voz alta, dictar respuestas y una audio-lección narrada.

const limpiar = (t: string) => t.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

export const hayVoz = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Voces en español disponibles (el navegador las entrega un poco después de cargar). */
export function useVoces(): SpeechSynthesisVoice[] {
  const [voces, setVoces] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!hayVoz()) return;
    const leer = () => setVoces(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("es")));
    leer();
    window.speechSynthesis.addEventListener("voiceschanged", leer);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", leer);
  }, []);
  return voces;
}

const puntaje = (v: SpeechSynthesisVoice) => (/natural|neural|google|premium|enhanced/i.test(v.name) ? 4 : 0) + (/es-co/i.test(v.lang) ? 3 : /es-(mx|us|419)/i.test(v.lang) ? 2 : 1);
export const mejorVoz = (voces: SpeechSynthesisVoice[]) => [...voces].sort((a, b) => puntaje(b) - puntaje(a))[0];

/** Habla un texto por frases (los navegadores cortan las lecturas largas). Devuelve una función para cancelar. */
export function hablar(texto: string, opc: { voz?: string; rate?: number; alTerminar?: () => void } = {}): () => void {
  if (!hayVoz()) {
    opc.alTerminar?.();
    return () => {};
  }
  const s = window.speechSynthesis;
  s.cancel();
  const frases = limpiar(texto).match(/[^.!?;:\n]+[.!?;:]?/g)?.map((f) => f.trim()).filter(Boolean) ?? [];
  const trozos: string[] = [];
  for (const f of frases) {
    const ult = trozos[trozos.length - 1];
    if (ult && ult.length + f.length < 170) trozos[trozos.length - 1] = `${ult} ${f}`;
    else trozos.push(f);
  }
  let cancelado = false;
  const voz = opc.voz ? window.speechSynthesis.getVoices().find((v) => v.name === opc.voz) : undefined;
  const decir = (i: number) => {
    if (cancelado) return;
    if (i >= trozos.length) {
      opc.alTerminar?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(trozos[i]);
    u.lang = voz?.lang ?? "es-CO";
    if (voz) u.voice = voz;
    u.rate = opc.rate ?? 1;
    u.onend = () => decir(i + 1);
    u.onerror = () => !cancelado && decir(i + 1);
    s.speak(u);
  };
  decir(0);
  return () => {
    cancelado = true;
    s.cancel();
  };
}

/** Botón pequeño para escuchar un texto. */
export function Leer({ texto, etiqueta = "Escuchar", className = "" }: { texto: string; etiqueta?: string; className?: string }) {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  const parar = useRef<() => void>(() => {});
  useEffect(() => {
    setOk(hayVoz());
    return () => parar.current();
  }, []);
  if (!ok) return null;
  return (
    <button
      type="button"
      className={`st-btn st-btn-ico ${on ? "st-btn-fuerte" : ""} ${className}`}
      aria-pressed={on}
      aria-label={on ? "Detener la lectura" : etiqueta}
      title={on ? "Detener la lectura" : etiqueta}
      onClick={() => {
        if (on) {
          parar.current();
          setOn(false);
          return;
        }
        setOn(true);
        parar.current = hablar(texto, { alTerminar: () => setOn(false) });
      }}
    >
      {on ? <VolumeX size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
    </button>
  );
}

type Reco = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const crearReco = (): Reco | null => {
  if (typeof window === "undefined") return null;
  const C = (window as unknown as { SpeechRecognition?: new () => Reco; webkitSpeechRecognition?: new () => Reco }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Reco }).webkitSpeechRecognition;
  return C ? new C() : null;
};
export const hayDictado = () => typeof window !== "undefined" && Boolean((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

/** Micrófono: convierte lo que dice en texto. `alTexto` recibe el texto parcial y, al terminar, el final. */
export function Dictar({ alTexto, etiqueta = "Responder con la voz", className = "" }: { alTexto: (texto: string, final: boolean) => void; etiqueta?: string; className?: string }) {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  const reco = useRef<Reco | null>(null);
  useEffect(() => {
    setOk(hayDictado());
    return () => reco.current?.stop();
  }, []);
  if (!ok) return null;
  const alternar = () => {
    if (on) {
      reco.current?.stop();
      return;
    }
    window.speechSynthesis?.cancel();
    const r = crearReco();
    if (!r) return;
    r.lang = "es-CO";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      const partes = Array.from(e.results);
      const texto = partes.map((x) => x[0].transcript).join(" ").trim();
      const final = partes[partes.length - 1]?.isFinal ?? false;
      if (final) contar("voz", 1, "Respuesta dictada");
      alTexto(texto, final);
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    reco.current = r;
    setOn(true);
    try {
      r.start();
    } catch {
      setOn(false);
    }
  };
  return (
    <button type="button" className={`st-btn ${on ? "st-btn-no st-mic" : ""} ${className}`} onClick={alternar} aria-pressed={on} title={etiqueta}>
      {on ? <MicOff size={15} aria-hidden /> : <Mic size={15} aria-hidden />} {on ? "Escuchando… (toque para parar)" : etiqueta}
    </button>
  );
}

// ---------- Audio-lección ----------

type Item = { id: string; tipo: "intro" | "punto" | "cierre" | "pregunta" | "respuesta"; rotulo: string; texto: string; pausa?: number };

function construir(c: Contenido, titulo: string): Item[] {
  const out: Item[] = [];
  if (c.resumen) {
    out.push({ id: "intro", tipo: "intro", rotulo: "Idea central", texto: `${titulo}. ${c.resumen.idea}` });
    c.resumen.puntos.forEach((p, i) => out.push({ id: `p${i}`, tipo: "punto", rotulo: p.titulo || `Idea ${i + 1}`, texto: `${p.titulo ? `${p.titulo}. ` : ""}${p.texto}` }));
    if (c.resumen.cierre) out.push({ id: "cierre", tipo: "cierre", rotulo: "Para llevar a la finca", texto: `Para llevar a la finca. ${c.resumen.cierre}` });
  } else if (c.guia?.conceptos.length) {
    c.guia.conceptos.forEach((x, i) => out.push({ id: `c${i}`, tipo: "punto", rotulo: x.termino, texto: `${x.termino}. ${x.definicion}` }));
  }
  const q = (c.tarjetas ?? []).slice(0, 5);
  if (q.length) {
    out.push({ id: "repaso", tipo: "intro", rotulo: "Repaso rápido", texto: "Ahora un repaso rápido. Le haré una pregunta, piense su respuesta y luego le digo la correcta." });
    q.forEach((t, i) => {
      out.push({ id: `q${i}`, tipo: "pregunta", rotulo: `Pregunta ${i + 1}`, texto: t.q, pausa: 5 });
      out.push({ id: `r${i}`, tipo: "respuesta", rotulo: "Respuesta", texto: `La respuesta es: ${t.a}` });
    });
  }
  return out;
}

const VELOCIDADES = [0.85, 1, 1.15, 1.35];

/** Lección en audio: narra el resumen y hace un repaso hablado con pausas para pensar. */
export function AudioLeccion({ contenido, titulo }: { contenido: Contenido; titulo: string }) {
  const items = construir(contenido, titulo);
  const voces = useVoces();
  const [i, setI] = useState(0);
  const [juega, setJuega] = useState(false);
  const [vel, setVel] = useState(1);
  const [vozNombre, setVozNombre] = useState("");
  const [cuenta, setCuenta] = useState<number | null>(null);
  const premiada = useRef(false);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const item = items[i];

  useEffect(() => {
    if (!vozNombre && voces.length) setVozNombre(mejorVoz(voces)?.name ?? "");
  }, [voces, vozNombre]);

  useEffect(() => {
    if (!juega) return;
    if (i >= items.length) {
      setJuega(false);
      setI(0);
      if (!premiada.current) {
        premiada.current = true;
        dar(15, "Audio-lección completa");
        contar("audio", 1);
      }
      return;
    }
    let cancelar = () => {};
    let tiempo: ReturnType<typeof setInterval> | undefined;
    const x = items[i];
    cancelar = hablar(x.texto, {
      voz: vozNombre || undefined,
      rate: vel,
      alTerminar: () => {
        if (x.pausa) {
          let falta = x.pausa;
          setCuenta(falta);
          tiempo = setInterval(() => {
            falta -= 1;
            setCuenta(falta > 0 ? falta : null);
            if (falta <= 0) {
              clearInterval(tiempo);
              setI((n) => n + 1);
            }
          }, 1000);
        } else setI((n) => n + 1);
      },
    });
    return () => {
      cancelar();
      if (tiempo) clearInterval(tiempo);
      setCuenta(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [juega, i, vel, vozNombre]);

  useEffect(() => () => { if (hayVoz()) window.speechSynthesis.cancel(); }, []);
  useEffect(() => { refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [i]);

  if (!hayVoz()) return <p className="py-8 text-center text-[var(--text-muted)]">Este navegador no puede leer en voz alta. Pruebe con Chrome, Edge o Safari.</p>;

  const total = items.length;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="st-reproductor">
        <div className="flex items-center gap-4">
          <span className={`st-ondas ${juega ? "st-ondas-on" : ""}`} aria-hidden><i /><i /><i /><i /><i /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] opacity-75">{item?.rotulo ?? "Listo"}</p>
            <p className="line-clamp-3 text-lg font-semibold leading-snug sm:text-xl">{item ? limpiar(item.texto) : "Pulse reproducir para empezar"}</p>
            {cuenta !== null && <p className="mt-1 text-sm font-bold opacity-90">Piense su respuesta… {cuenta}</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="st-play-ico" onClick={() => setI((n) => Math.max(0, n - 1))} aria-label="Anterior" disabled={i === 0}><SkipBack size={18} /></button>
          <button type="button" className="st-play" onClick={() => { if (i >= total) setI(0); setJuega((j) => !j); }} aria-label={juega ? "Pausar" : "Reproducir"}>{juega ? <Pause size={24} /> : <Play size={24} />}</button>
          <button type="button" className="st-play-ico" onClick={() => setI((n) => Math.min(total - 1, n + 1))} aria-label="Siguiente" disabled={i >= total - 1}><SkipForward size={18} /></button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-white/15 p-0.5 text-xs font-bold" role="group" aria-label="Velocidad">
              {VELOCIDADES.map((v) => <button key={v} type="button" onClick={() => setVel(v)} aria-pressed={vel === v} className={`rounded-full px-2.5 py-1 ${vel === v ? "bg-white text-[#2c6a14]" : "text-white/85"}`}>{v}×</button>)}
            </div>
            {voces.length > 1 && (
              <select value={vozNombre} onChange={(e) => setVozNombre(e.target.value)} aria-label="Voz" className="max-w-40 rounded-full border-0 bg-white/15 px-3 py-1.5 text-xs font-bold text-white outline-none">
                {voces.map((v) => <option key={v.name} value={v.name} className="text-black">{v.name}</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><span className="block h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${total ? (Math.min(i, total) / total) * 100 : 0}%` }} /></div>
      </div>

      <ol className="flex flex-col gap-1.5">
        {items.map((x, k) => (
          <li key={x.id} ref={(el) => { refs.current[k] = el; }}>
            <button type="button" onClick={() => { setI(k); setJuega(true); }} className={`st-pista ${k === i ? "st-pista-on" : k < i ? "st-pista-hecha" : ""}`}>
              <span className="st-pista-n">{k < i ? "✓" : k + 1}</span>
              <span className="min-w-0 flex-1 text-left"><b className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--text-faint)]">{x.rotulo}</b><span className="line-clamp-1 text-[0.92rem] text-[var(--text)]">{limpiar(x.texto)}</span></span>
              {k === i && juega && <Headphones size={16} className="shrink-0 text-[#3d7a22]" aria-hidden />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
