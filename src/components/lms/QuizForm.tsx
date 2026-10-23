"use client";

import { useActionState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { submitQuiz, type QuizResult } from "@/lib/lms/actions";

type Q = { id: string; question: string; options: string[] };

/** Evaluación: se califica en el servidor y solo se marca la lección si se alcanza la nota mínima. */
export function QuizForm({ courseId, lessonId, slug, questions, passScore, done }: { courseId: string; lessonId: string; slug: string; questions: Q[]; passScore: number; done: boolean }) {
  const [state, action, pending] = useActionState<QuizResult, FormData>(submitQuiz, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="course_id" value={courseId} /><input type="hidden" name="lesson_id" value={lessonId} /><input type="hidden" name="slug" value={slug} />
      {questions.map((q, i) => (
        <fieldset key={q.id} className="rounded-[var(--radius-md)] border border-[var(--border-strong)] p-5">
          <legend className="px-2 font-semibold text-[var(--text)]">{i + 1}. {q.question}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {q.options.map((o, oi) => (
              <label key={oi} className="flex cursor-pointer items-start gap-3 rounded-[0.25rem] border border-transparent px-3 py-2 text-[var(--text-muted)] hover:border-[var(--border-strong)] has-[:checked]:border-[var(--fg-lime-500)] has-[:checked]:text-[var(--text)]">
                <input type="radio" name={`q_${q.id}`} value={oi} required className="mt-1 accent-[var(--fg-lime-500)]" /> {o}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {state.error && <p role="alert" className="text-sm text-[#f08a8a]">{state.error}</p>}
      {state.score !== undefined && (
        <div role="status" className={`rounded-[var(--radius-md)] border p-5 ${state.passed ? "border-[var(--fg-lime-500)]" : "border-[#f08a8a]"}`}>
          <p className="flex items-center gap-2 font-semibold text-[var(--text)]">
            {state.passed ? <CheckCircle2 className="text-[var(--fg-lime-500)]" /> : <XCircle className="text-[#f08a8a]" />}
            Obtuvo {state.score} % {state.passed ? "· ¡aprobada!" : `· necesita ${passScore} % para aprobar`}
          </p>
          {state.wrong && state.wrong.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--text-muted)]">
              {state.wrong.map((w) => <li key={w.question}><b className="text-[var(--text)]">{w.question}</b>{w.explanation ? ` — ${w.explanation}` : ""}</li>)}
            </ul>
          )}
        </div>
      )}
      <button type="submit" disabled={pending} className="self-start rounded-[0.25rem] bg-[var(--fg-lime-500)] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)] disabled:opacity-60">
        {pending ? "Calificando…" : done ? "Presentar de nuevo" : "Enviar respuestas"}
      </button>
    </form>
  );
}
