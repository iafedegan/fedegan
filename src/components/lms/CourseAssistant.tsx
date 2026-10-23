"use client";

import { useRef, useState, useTransition } from "react";
import { BookOpenText, Send, Sparkles } from "lucide-react";
import { askAssistant, type ChatTurn } from "@/lib/lms/assistant";
import { Rich } from "@/components/lms/Rich";

const QUICK = ["Resume esta lección", "Dame los puntos clave", "Hazme 5 preguntas de práctica", "Explícalo más sencillo"];

/** Chat del cuaderno: responde con base en las fuentes del curso (la lección y su video), con citas. */
export function CourseAssistant({ courseId, lessonId, slug, lessonTitle, sources, enabled }: { courseId: string; lessonId: string; slug: string; lessonTitle: string; sources: { n: number; title: string; current: boolean }[]; enabled: boolean }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  function ask(text: string) {
    const question = text.trim();
    if (!question || pending) return;
    setError("");
    const history = turns;
    setTurns([...turns, { role: "user", text: question }]);
    setQ("");
    start(async () => {
      const r = await askAssistant({ courseId, lessonId, slug, question, history });
      if (r.answer) setTurns((t) => [...t, { role: "model", text: r.answer! }]);
      else setError(r.error ?? "No se pudo responder.");
      setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    });
  }

  return (
    <section id="asistente" aria-label="Chat del cuaderno" className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[linear-gradient(100deg,rgba(47,156,98,0.18),rgba(216,181,88,0.12))] px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fg-lime-500)] text-[#0a1a11]"><Sparkles size={16} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[var(--font-display)] text-base font-bold leading-tight text-[var(--text)]">Pregúntele al curso</h2>
          <p className="truncate text-xs text-[var(--text-muted)]">Sobre «{lessonTitle}» · responde solo con lo que enseña este curso</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]"><BookOpenText size={13} /> {sources.length} fuentes</span>
      </header>

      {!enabled ? (
        <p className="p-6 text-sm text-[var(--text-muted)]">El asistente aún no está activado en este sitio.</p>
      ) : (
        <div className="flex flex-col gap-4 p-5">
          {turns.length === 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Preguntas rápidas">
              {QUICK.map((t) => (
                <button key={t} type="button" onClick={() => ask(t)} disabled={pending} className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[0.75rem] font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-lime-400)] disabled:opacity-50">{t}</button>
              ))}
            </div>
          )}
          {turns.length > 0 && (
            <ol className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1" aria-live="polite">
              {turns.map((t, i) => (
                <li key={i} className={t.role === "user" ? "self-end rounded-2xl rounded-br-sm bg-[rgba(216,181,88,0.16)] px-4 py-2.5 text-sm text-[var(--text)]" : "text-[var(--text-muted)]"}>
                  {t.role === "user" ? t.text : <Rich text={t.text} />}
                </li>
              ))}
              {pending && <li className="text-sm italic text-[var(--text-faint)]">Revisando las fuentes del curso…</li>}
              <div ref={end} />
            </ol>
          )}
          {error && <p role="alert" className="text-sm text-[#f08a8a]">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={600} placeholder="Haga una pregunta sobre el curso…" aria-label="Pregunta" className="min-w-0 flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-2.5 text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]" />
            <span className="hidden shrink-0 text-xs text-[var(--text-faint)] sm:block">{sources.length} fuentes</span>
            <button type="submit" disabled={pending || !q.trim()} aria-label="Enviar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fg-lime-500)] text-[#0a1a11] disabled:opacity-50"><Send size={16} /></button>
          </form>
          {turns.length > 0 && <button type="button" onClick={() => { setTurns([]); setError(""); }} className="self-start text-xs font-semibold text-[var(--text-faint)] hover:text-[var(--text)]">Empezar una conversación nueva</button>}
          <p className="text-[0.72rem] text-[var(--text-faint)]">Asistente con inteligencia artificial: puede equivocarse. Verifique la información en las lecciones y consulte a un veterinario ante casos de animales enfermos.</p>
        </div>
      )}
    </section>
  );
}
