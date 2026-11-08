"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BookMarked, BrainCircuit, CalendarRange, ChevronRight, FileText, HelpCircle, Layers, ListChecks, Loader2, MessageCircleQuestion, ScrollText, Sparkles } from "lucide-react";
import { prepararMateriales } from "@/lib/lms/studio-actions";
import { contarNodos, TITULO_KIND, type Contenido, type StudioKind } from "@/lib/lms/studio-tipos";
import { Visor, VistaCuestionario, VistaFaq, VistaGlosario, VistaGuia, VistaInforme, VistaLinea, VistaMapa, VistaResumen, VistaTarjetas } from "@/components/lms/StudioVistas";

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

function vista(kind: StudioKind, c: Contenido): ReactNode {
  switch (kind) {
    case "resumen": return c.resumen && <VistaResumen d={c.resumen} />;
    case "guia": return c.guia && <VistaGuia d={c.guia} />;
    case "mapa": return c.mapa && <VistaMapa d={c.mapa} />;
    case "tarjetas": return c.tarjetas && <VistaTarjetas d={c.tarjetas} />;
    case "cuestionario": return c.cuestionario && <VistaCuestionario d={c.cuestionario} />;
    case "faq": return c.faq && <VistaFaq d={c.faq} />;
    case "linea": return c.linea && <VistaLinea d={c.linea} />;
    case "glosario": return c.glosario && <VistaGlosario d={c.glosario} />;
    case "informe": return c.informe && <VistaInforme d={c.informe} />;
  }
}

/** Panel Studio del cuaderno: materiales de estudio ya preparados para la lección y para todo el curso, con vistas interactivas. */
export function StudioPanel({ courseId, lessonId, slug, enabled, lessonTitle, courseTitle, initial }: { courseId: string; lessonId: string; slug: string; enabled: boolean; lessonTitle: string; courseTitle: string; initial: { leccion: Contenido | null; curso: Contenido | null } }) {
  const [scope, setScope] = useState<"leccion" | "curso">("leccion");
  const [datos, setDatos] = useState(initial);
  const [abierto, setAbierto] = useState<StudioKind | null>(null);
  const [error, setError] = useState("");
  const [ocupado, start] = useTransition();
  const actual = scope === "leccion" ? datos.leccion : datos.curso;
  const disponibles = actual ? ORDEN.filter((k) => actual[k] !== undefined) : [];

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

      <p className="-mt-1 text-[0.78rem] leading-snug text-[var(--text-faint)]">
        {scope === "leccion" ? <>Material de <b className="font-semibold text-[var(--text-muted)]">{lessonTitle}</b>, armado a partir del video.</> : <>Visión general de <b className="font-semibold text-[var(--text-muted)]">{courseTitle}</b>.</>}
      </p>

      {actual && (
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
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-[var(--text-faint)]" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
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

      {abierto && actual && (
        <Visor
          titulo={TITULO_KIND[abierto]}
          subtitulo={scope === "leccion" ? lessonTitle : courseTitle}
          icono={(() => { const I = META[abierto].Icon; return <I size={22} aria-hidden />; })()}
          color={META[abierto].color}
          onClose={() => setAbierto(null)}
        >
          {vista(abierto, actual)}
        </Visor>
      )}
    </div>
  );
}
