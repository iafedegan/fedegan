"use client";

import { useState, useTransition } from "react";
import { BookMarked, BrainCircuit, CalendarRange, FileText, HelpCircle, Layers, ListChecks, MessageCircleQuestion, ScrollText, Sparkles, X } from "lucide-react";
import { generateStudio, type StudioKind } from "@/lib/lms/assistant";
import { Rich } from "@/components/lms/Rich";

const TOOLS: { kind: StudioKind; label: string; Icon: typeof FileText }[] = [
  { kind: "resumen", label: "Resumen", Icon: ScrollText },
  { kind: "guia", label: "Guía de estudio", Icon: BookMarked },
  { kind: "mapa", label: "Mapa mental", Icon: BrainCircuit },
  { kind: "tarjetas", label: "Tarjetas didácticas", Icon: Layers },
  { kind: "cuestionario", label: "Cuestionario", Icon: HelpCircle },
  { kind: "faq", label: "Preguntas frecuentes", Icon: MessageCircleQuestion },
  { kind: "linea", label: "Línea de tiempo", Icon: CalendarRange },
  { kind: "glosario", label: "Glosario", Icon: ListChecks },
  { kind: "informe", label: "Informe", Icon: FileText },
];

type Result = { id: number; kind: StudioKind; scope: "leccion" | "curso"; text: string };

function Flashcards({ text }: { text: string }) {
  let cards: { q: string; a: string }[] = [];
  try { cards = JSON.parse(text); } catch { /* texto inválido */ }
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  if (!cards.length) return <Rich text={text} />;
  const c = cards[i];
  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" onClick={() => setFlip(!flip)} className="flex min-h-40 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg)] p-5 text-center text-[var(--text)] hover:border-[var(--fg-lime-500)]" aria-label="Voltear tarjeta">
        <span className={flip ? "text-[0.95rem] text-[var(--fg-lime-400)]" : "font-semibold"}>{flip ? c.a : c.q}</span>
      </button>
      <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
        <button type="button" disabled={i === 0} onClick={() => { setI(i - 1); setFlip(false); }} className="font-bold uppercase tracking-[0.1em] hover:text-[var(--text)] disabled:opacity-40">Anterior</button>
        {i + 1} / {cards.length}
        <button type="button" disabled={i === cards.length - 1} onClick={() => { setI(i + 1); setFlip(false); }} className="font-bold uppercase tracking-[0.1em] hover:text-[var(--text)] disabled:opacity-40">Siguiente</button>
      </div>
    </div>
  );
}

function Quiz({ text }: { text: string }) {
  let qs: { q: string; options: string[]; correct: number; why?: string }[] = [];
  try { qs = JSON.parse(text); } catch { /* texto inválido */ }
  const [pick, setPick] = useState<Record<number, number>>({});
  if (!qs.length) return <Rich text={text} />;
  const score = qs.filter((q, i) => pick[i] === q.correct).length;
  return (
    <div className="flex flex-col gap-5">
      {qs.map((q, i) => (
        <div key={i}>
          <p className="font-semibold text-[var(--text)]">{i + 1}. {q.q}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {q.options.map((o, k) => {
              const chosen = pick[i] !== undefined;
              const good = chosen && k === q.correct;
              const bad = chosen && pick[i] === k && k !== q.correct;
              return <button key={k} type="button" disabled={chosen} onClick={() => setPick({ ...pick, [i]: k })} className={`rounded-md border px-3 py-2 text-left text-sm ${good ? "border-[var(--fg-lime-500)] bg-[rgba(47,156,98,0.18)] text-[var(--text)]" : bad ? "border-[#f08a8a] bg-[rgba(240,138,138,0.12)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"}`}>{o}</button>;
            })}
          </div>
          {pick[i] !== undefined && q.why && <p className="mt-1.5 text-xs text-[var(--text-faint)]">{q.why}</p>}
        </div>
      ))}
      {Object.keys(pick).length === qs.length && <p className="font-bold text-[var(--fg-lime-400)]">Resultado: {score} de {qs.length}</p>}
    </div>
  );
}

function MindMap({ text }: { text: string }) {
  const rows = text.split("\n").filter((l) => l.trim()).map((l) => ({ d: Math.floor((l.length - l.trimStart().length) / 2), t: l.trim().replace(/^[-*•]\s*/, "") }));
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {rows.map((r, i) => (
        <li key={i} style={{ marginLeft: `${Math.min(r.d, 4) * 1.1}rem` }} className={r.d === 0 ? "font-[var(--font-display)] text-base font-bold text-[var(--fg-lime-400)]" : r.d === 1 ? "border-l-2 border-[var(--fg-lime-500)] pl-2 font-semibold text-[var(--text)]" : "border-l border-[var(--border-strong)] pl-2 text-[var(--text-muted)]"}>{r.t}</li>
      ))}
    </ul>
  );
}

/** Panel Studio del cuaderno: genera materiales de estudio a partir de la lección o de todo el curso. */
export function StudioPanel({ courseId, lessonId, slug, enabled }: { courseId: string; lessonId: string; slug: string; enabled: boolean }) {
  const [scope, setScope] = useState<"leccion" | "curso">("leccion");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<StudioKind | null>(null);
  const [, start] = useTransition();

  function make(kind: StudioKind) {
    if (busy) return;
    setError("");
    setBusy(kind);
    start(async () => {
      const r = await generateStudio({ courseId, lessonId, slug, kind, scope });
      if (r.text) setResults((rs) => [{ id: Date.now(), kind, scope, text: r.text! }, ...rs]);
      else setError(r.error ?? "No se pudo generar.");
      setBusy(null);
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Studio</p>
        <div className="flex rounded-full border border-[var(--border-strong)] p-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em]" role="group" aria-label="Alcance">
          {(["leccion", "curso"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s} className={`rounded-full px-3 py-1 ${scope === s ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)]"}`}>{s === "leccion" ? "Lección" : "Curso"}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map(({ kind, label, Icon }) => (
          <button key={kind} type="button" disabled={!enabled || busy !== null} onClick={() => make(kind)} className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-3 text-left text-[0.82rem] font-semibold leading-tight text-[var(--text)] transition-colors hover:border-[var(--fg-lime-500)] disabled:opacity-50">
            <Icon size={17} className="shrink-0 text-[var(--fg-lime-500)]" />{busy === kind ? "Generando…" : label}
          </button>
        ))}
      </div>
      {!enabled && <p className="text-xs text-[var(--text-faint)]">Las herramientas de estudio aún no están activadas en este sitio.</p>}
      {error && <p role="alert" className="text-sm text-[#f08a8a]">{error}</p>}
      {results.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 px-2 py-8 text-center text-sm text-[var(--text-faint)]">
          <Sparkles size={26} className="text-[var(--fg-lime-500)]" />
          Los materiales que genere aparecerán aquí. Elija si quiere usar solo esta lección o todo el curso.
        </div>
      )}
      {results.map((r) => {
        const t = TOOLS.find((x) => x.kind === r.kind)!;
        return (
          <article key={r.id} className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-4">
            <header className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
              <t.Icon size={14} /> {t.label} <span className="font-normal normal-case tracking-normal text-[var(--text-faint)]">· {r.scope === "leccion" ? "esta lección" : "todo el curso"}</span>
              <button type="button" onClick={() => setResults((rs) => rs.filter((x) => x.id !== r.id))} aria-label="Quitar" className="ml-auto text-[var(--text-faint)] hover:text-[var(--text)]"><X size={14} /></button>
            </header>
            {r.kind === "tarjetas" ? <Flashcards text={r.text} /> : r.kind === "cuestionario" ? <Quiz text={r.text} /> : r.kind === "mapa" ? <MindMap text={r.text} /> : <Rich text={r.text} />}
          </article>
        );
      })}
    </div>
  );
}
