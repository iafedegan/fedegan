"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Brain, Compass, Flame, Headphones, Layers, Lock, Mic, Star, Target, Volume2, VolumeX, Zap, type LucideIcon } from "lucide-react";
import { ajustar, ESTADO_INICIAL, EVENTO, INSIGNIAS, leerEstado, nivelDe, sonar, type Aviso, type Estado } from "@/lib/lms/studio-juego";
import { Confeti } from "@/components/lms/StudioEfectos";

const ICONOS: Record<string, LucideIcon> = { layers: Layers, compass: Compass, target: Target, flame: Flame, zap: Zap, brain: Brain, headphones: Headphones, mic: Mic, star: Star };
type Toast = { id: number; texto: string; tipo: "xp" | "insignia" | "nivel" };

/** Cabecera de gamificación: nivel de ganadero, XP, racha, sonido, voz e insignias; avisa cada logro con un mensaje breve. */
export function JuegoHud() {
  const [e, setE] = useState<Estado>(ESTADO_INICIAL);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [insignias, setInsignias] = useState(false);
  const [fiesta, setFiesta] = useState(0);
  const id = useRef(0);

  useEffect(() => {
    setE(leerEstado());
    const poner = (texto: string, tipo: Toast["tipo"]) => {
      const n = ++id.current;
      setToasts((t) => [...t.slice(-2), { id: n, texto, tipo }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n)), tipo === "xp" ? 2200 : 3800);
    };
    const f = (ev: Event) => {
      const a = (ev as CustomEvent<Aviso>).detail;
      setE(leerEstado());
      if (a.cambio) return;
      if (a.xp >= 3) poner(`+${a.xp} XP · ${a.motivo}`, "xp");
      for (const i of a.insignias) poner(`Insignia: ${INSIGNIAS[i].titulo}`, "insignia");
      if (a.subio) {
        poner(`¡Nivel ${a.subio.n}: ${a.subio.nombre}!`, "nivel");
        setFiesta((x) => x + 1);
        sonar("nivel");
      }
    };
    window.addEventListener(EVENTO, f);
    return () => window.removeEventListener(EVENTO, f);
  }, []);

  const nv = nivelDe(e.xp);
  const ganadas = new Set(e.insignias);
  const todas = Object.entries(INSIGNIAS);
  return (
    <div className="st-hud">
      <div className="flex items-center gap-3">
        <span className="st-nivel" aria-label={`Nivel ${nv.n}`}>{nv.n}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <b className="truncate font-[var(--font-display)] text-[0.95rem] text-[var(--text)]">{nv.nombre}</b>
            <span className="shrink-0 text-[0.7rem] font-bold tabular-nums text-[var(--text-faint)]">{e.xp} XP{nv.hasta ? ` · faltan ${nv.falta}` : " · nivel máximo"}</span>
          </div>
          <span className="mt-1 block h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${nv.pct}%`, background: "linear-gradient(90deg,#72BF44,#C9992B)" }} /></span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <span className={`st-combo ${e.racha >= 2 ? "st-combo-on" : ""}`} title="Días seguidos estudiando"><Flame size={14} aria-hidden /> {e.racha || 0} {e.racha === 1 ? "día" : "días"}</span>
        <button type="button" className="st-btn st-btn-ico ml-auto" onClick={() => ajustar({ sonido: !e.sonido })} aria-pressed={e.sonido} aria-label={e.sonido ? "Silenciar los efectos" : "Activar los efectos de sonido"} title={e.sonido ? "Efectos de sonido: sí" : "Efectos de sonido: no"}>{e.sonido ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
        <button type="button" className={`st-btn st-btn-ico ${e.voz ? "st-btn-fuerte" : ""}`} onClick={() => ajustar({ voz: !e.voz })} aria-pressed={e.voz} aria-label="Leer las preguntas de los juegos en voz alta" title="Leer las preguntas de los juegos en voz alta"><Mic size={15} /></button>
        <button type="button" className="st-btn" onClick={() => setInsignias((v) => !v)} aria-expanded={insignias}><Award size={15} aria-hidden /> {e.insignias.length}/{todas.length}</button>
      </div>
      {insignias && (
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {todas.map(([k, i]) => {
            const Icono = ICONOS[i.icono] ?? Award;
            const si = ganadas.has(k);
            return (
              <li key={k} className={`st-insignia ${si ? "st-insignia-on" : ""}`} title={i.texto}>
                <span className="st-insignia-ico">{si ? <Icono size={17} aria-hidden /> : <Lock size={15} aria-hidden />}</span>
                <span className="min-w-0"><b className="block truncate text-[0.74rem] leading-tight">{i.titulo}</b><span className="block text-[0.64rem] leading-tight opacity-75">{i.texto}</span></span>
              </li>
            );
          })}
        </ul>
      )}
      {fiesta > 0 && <Confeti key={fiesta} />}
      <div className="st-toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`st-toast st-toast-${t.tipo}`}>{t.tipo === "nivel" ? <Star size={16} aria-hidden /> : t.tipo === "insignia" ? <Award size={16} aria-hidden /> : <Zap size={14} aria-hidden />}{t.texto}</div>)}
      </div>
    </div>
  );
}
