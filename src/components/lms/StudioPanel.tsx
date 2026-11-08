"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { BookMarked, BrainCircuit, CalendarRange, ChevronRight, FileText, Gamepad2, Headphones, HelpCircle, Layers, ListChecks, Loader2, MessageCircleQuestion, ScrollText, Sparkles } from "lucide-react";
import { prepararMateriales } from "@/lib/lms/studio-actions";
import { abrirMaterial, leerEstado } from "@/lib/lms/studio-juego";
import { juegosDisponibles, type JuegoId } from "@/lib/lms/studio-juegos-datos";
import { contarNodos, TITULO_KIND, type Contenido, type StudioKind } from "@/lib/lms/studio-tipos";
import { avanceDe, Visor, VistaCuestionario, VistaFaq, VistaGlosario, VistaGuia, VistaInforme, VistaLinea, VistaMapa, VistaResumen, VistaTarjetas } from "@/components/lms/StudioVistas";
import { JUEGOS, VistaJuego } from "@/components/lms/StudioJuegos";
import { JuegoHud } from "@/components/lms/StudioHud";
import { Estrellas } from "@/components/lms/StudioEfectos";
import { AudioLeccion } from "@/components/lms/StudioVoz";

type Meta = { Icon: typeof FileText; color: string; que: (c: Contenido) => string; interactivo?: boolean };

const META: Record<StudioKind, Meta> = {
  resumen: { Icon: ScrollText, color: "#72BF44", que: (c) => `${c.resumen?.puntos.length ?? 0} ideas clave` },
  guia: { Icon: BookMarked, color: "#89114C", que: (c) => `${c.guia?.conceptos.length ?? 0} conceptos · ${c.guia?.repaso.length ?? 0} preguntas de repaso` },
  mapa: { Icon: BrainCircuit, color: "#1B7F73", interactivo: true, que: (c) => `${c.mapa ? contarNodos(c.mapa) : 0} ideas conectadas` },
  tarjetas: { Icon: Layers, color: "#C9992B", interactivo: true, que: (c) => `${c.tarjetas?.length ?? 0} tarjetas para voltear` },
  cuestionario: { Icon: HelpCircle, color: "#3C6DB0", interactivo: true, que: (c) => `${c.cuestionario?.length ?? 0} preguntas con respuesta` },
  faq: { Icon: MessageCircleQuestion, color: "#D9772E", que: (c) => `${c.faq?.length ?? 0} preguntas frecuentes` },
  linea: { Icon: CalendarRange, color: "#72BF44", que: (c) => `${c.linea?.length ?? 0} pasos en orden` },
  glosario: { Icon: ListChecks, color: "#89114C", que: (c) => `${c.glosario?.length ?? 0} términos` },
  informe: { Icon: FileText, color: "#1B7F73", que: (c) => `${c.informe?.secciones.length ?? 0} secciones` },
};
const ORDEN: StudioKind[] = ["resumen", "guia", "mapa", "tarjetas", "cuestionario", "faq", "linea", "glosario", "informe"];
const ORDEN_JUEGOS: JuegoId[] = ["memoria", "relampago", "vf", "ordena", "clasifica"];
const COLOR_JUEGO: Record<JuegoId, string> = { memoria: "#72BF44", relampago: "#D9772E", vf: "#3C6DB0", ordena: "#C9992B", clasifica: "#89114C" };

function vista(kind: StudioKind, c: Contenido, clave: string): ReactNode {
  switch (kind) {
    case "resumen": return c.resumen && <VistaResumen d={c.resumen} clave={clave} />;
    case "guia": return c.guia && <VistaGuia d={c.guia} clave={clave} />;
    case "mapa": return c.mapa && <VistaMapa d={c.mapa} />;
    case "tarjetas": return c.tarjetas && <VistaTarjetas d={c.tarjetas} clave={clave} />;
    case "cuestionario": return c.cuestionario && <VistaCuestionario d={c.cuestionario} clave={clave} />;
    case "faq": return c.faq && <VistaFaq d={c.faq} />;
    case "linea": return c.linea && <VistaLinea d={c.linea} clave={clave} />;
    case "glosario": return c.glosario && <VistaGlosario d={c.glosario} />;
    case "informe": return c.informe && <VistaInforme d={c.informe} />;
  }
}

/** Panel Studio del cuaderno: materiales de estudio ya preparados para la lección y para todo el curso, con vistas interactivas, voz y juegos. */
export function StudioPanel({ courseId, lessonId, slug, enabled, lessonTitle, courseTitle, initial }: { courseId: string; lessonId: string; slug: string; enabled: boolean; lessonTitle: string; courseTitle: string; initial: { leccion: Contenido | null; curso: Contenido | null } }) {
  const [scope, setScope] = useState<"leccion" | "curso">("leccion");
  const [datos, setDatos] = useState(initial);
  const [abierto, setAbierto] = useState<StudioKind | null>(null);
  const [juego, setJuego] = useState<JuegoId | null>(null);
  const [audio, setAudio] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, start] = useTransition();
  const actual = scope === "leccion" ? datos.leccion : datos.curso;
  const disponibles = actual ? ORDEN.filter((k) => actual[k] !== undefined) : [];
  const jugables = actual ? juegosDisponibles(actual) : null;
  const clave = `${scope}:${scope === "leccion" ? lessonId : courseId}`;
  const tema = scope === "leccion" ? lessonTitle : courseTitle;

  // El avance se guarda en este navegador: se lee después de pintar (en el servidor no existe) y al cerrar un material o un juego.
  const [avances, setAvances] = useState<Record<string, string | null>>({});
  const [estrellasJ, setEstrellasJ] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!actual) return;
    setAvances(Object.fromEntries(disponibles.map((k) => [k, avanceDe(clave, k, actual)])));
    const e = leerEstado().estrellas;
    setEstrellasJ(Object.fromEntries(ORDEN_JUEGOS.map((j) => [j, e[`${j}:${clave}`] ?? 0])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual, clave, abierto, juego, audio]);
  useEffect(() => {
    if (abierto) abrirMaterial(clave, abierto);
  }, [abierto, clave]);

  function preparar() {
    setError("");
    start(async () => {
      const r = await prepararMateriales({ courseId, lessonId, slug, scope });
      if (r.ok && r.contenido) setDatos((d) => ({ ...d, [scope]: r.contenido! }));
      else setError(r.error ?? "No se pudieron preparar los materiales.");
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Studio</p>
        <div className="flex rounded-full border border-[var(--border-strong)] p-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em]" role="group" aria-label="Alcance">
          {(["leccion", "curso"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s} className={`rounded-full px-3 py-1 ${scope === s ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)]"}`}>{s === "leccion" ? "Lección" : "Curso"}</button>
          ))}
        </div>
      </div>

      <JuegoHud />

      <p className="-mt-1 text-[0.78rem] leading-snug text-[var(--text-faint)]">
        {scope === "leccion" ? <>Material de <b className="font-semibold text-[var(--text-muted)]">{lessonTitle}</b>, armado a partir del video.</> : <>Visión general de <b className="font-semibold text-[var(--text-muted)]">{courseTitle}</b>.</>}
      </p>

      {actual && (
        <>
          {(actual.resumen || actual.guia) && (
            <button type="button" onClick={() => setAudio(true)} className="st-audio-tarjeta">
              <span className="st-audio-ico"><Headphones size={22} aria-hidden /></span>
              <span className="min-w-0 flex-1 text-left"><b className="block text-[0.95rem]">Audio-lección</b><span className="block text-xs opacity-85">Escúchela narrada, con repaso hablado</span></span>
              <ChevronRight size={18} aria-hidden />
            </button>
          )}

          <ul className="flex flex-col gap-2">
            {disponibles.map((k) => {
              const m = META[k];
              return (
                <li key={k}>
                  <button type="button" onClick={() => setAbierto(k)} className="st-fila" style={{ ["--st-color" as string]: m.color }}>
                    <span className="st-fila-icono"><m.Icon size={19} aria-hidden /></span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2 text-[0.9rem] font-bold leading-tight text-[var(--text)]">{TITULO_KIND[k]}{m.interactivo && <span className="st-chip">Interactivo</span>}</span>
                      <span className="mt-0.5 block text-xs text-[var(--text-faint)]">{m.que(actual)}</span>
                      {avances[k] && <span className="mt-1 block text-xs font-bold text-[#3d7a22]">{avances[k]}</span>}
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-[var(--text-faint)]" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>

          {jugables && ORDEN_JUEGOS.some((j) => jugables[j]) && (
            <section aria-label="Juegos">
              <h3 className="mb-2.5 mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]"><Gamepad2 size={15} aria-hidden /> Jugar para aprender</h3>
              <ul className="grid grid-cols-2 gap-2.5">
                {ORDEN_JUEGOS.filter((j) => jugables[j]).map((j) => {
                  const g = JUEGOS[j];
                  return (
                    <li key={j}>
                      <button type="button" onClick={() => setJuego(j)} className="st-juego" style={{ background: g.fondo }}>
                        <g.Icon size={26} aria-hidden />
                        <b>{g.titulo}</b>
                        <small>{g.sub}</small>
                        <Estrellas n={estrellasJ[j] ?? 0} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {!actual && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-8 text-center">
          {ocupado ? (
            <>
              <Loader2 size={26} className="animate-spin text-[var(--fg-lime-400)]" aria-hidden />
              <p className="text-sm font-semibold text-[var(--text)]">Preparando los materiales…</p>
              <p className="text-xs text-[var(--text-faint)]">Se arman una sola vez a partir del video y quedan guardados. Puede tardar cerca de un minuto.</p>
            </>
          ) : enabled ? (
            <>
              <Sparkles size={26} className="text-[var(--fg-lime-400)]" aria-hidden />
              <p className="text-sm text-[var(--text-muted)]">Los materiales de {scope === "leccion" ? "esta lección" : "este curso"} aún no están preparados.</p>
              <button type="button" onClick={preparar} className="st-btn st-btn-fuerte">Prepararlos ahora</button>
            </>
          ) : (
            <>
              <Sparkles size={26} className="text-[var(--text-faint)]" aria-hidden />
              <p className="text-sm text-[var(--text-muted)]">Los materiales de estudio de este curso estarán disponibles muy pronto.</p>
            </>
          )}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-[#a33]">{error}</p>}

      {abierto && actual && (() => {
        const pos = disponibles.indexOf(abierto);
        const ant = pos > 0 ? disponibles[pos - 1] : null;
        const sig = pos >= 0 && pos < disponibles.length - 1 ? disponibles[pos + 1] : null;
        const I = META[abierto].Icon;
        return (
          <Visor
            titulo={TITULO_KIND[abierto]}
            subtitulo={tema}
            icono={<I size={22} aria-hidden />}
            color={META[abierto].color}
            onClose={() => setAbierto(null)}
            anterior={ant ? { titulo: TITULO_KIND[ant], ir: () => setAbierto(ant) } : undefined}
            siguiente={sig ? { titulo: TITULO_KIND[sig], ir: () => setAbierto(sig) } : undefined}
            posicion={`Material ${pos + 1} de ${disponibles.length}`}
          >
            {vista(abierto, actual, clave)}
          </Visor>
        );
      })()}

      {juego && actual && (() => {
        const g = JUEGOS[juego];
        return (
          <Visor titulo={g.titulo} subtitulo={tema} icono={<g.Icon size={22} aria-hidden />} color={COLOR_JUEGO[juego]} onClose={() => setJuego(null)}>
            <VistaJuego id={juego} contenido={actual} clave={clave} />
          </Visor>
        );
      })()}

      {audio && actual && (
        <Visor titulo="Audio-lección" subtitulo={tema} icono={<Headphones size={22} aria-hidden />} color="#72BF44" onClose={() => setAudio(false)}>
          <AudioLeccion contenido={actual} titulo={tema} />
        </Visor>
      )}
    </div>
  );
}
