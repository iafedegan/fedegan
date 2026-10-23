/** Texto del asistente: negritas, listas y citas de lección simples, sin HTML. */
export function Rich({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-[0.95rem] leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return null;
        const bullet = /^\s*([-*•]|\d+[.)])\s+/.exec(line);
        const body = line.replace(/^\s*([-*•]|\d+[.)])\s+/, "").replace(/^#+\s*/, "");
        const parts = body.split(/(\*\*[^*]+\*\*|\[Lección[^\]]*\])/g).map((p, k) =>
          p.startsWith("**") ? <b key={k} className="text-[var(--text)]">{p.slice(2, -2)}</b> : p.startsWith("[Lección") ? <span key={k} className="whitespace-nowrap rounded bg-[rgba(216,181,88,0.14)] px-1.5 py-0.5 text-xs font-semibold text-[var(--fg-lime-400)]">{p.slice(1, -1)}</span> : <span key={k}>{p}</span>,
        );
        return bullet ? <p key={i} className="flex gap-2 pl-1"><span className="text-[var(--fg-lime-500)]">•</span><span>{parts}</span></p> : <p key={i}>{parts}</p>;
      })}
    </div>
  );
}
