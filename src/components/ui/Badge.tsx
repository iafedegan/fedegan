type Tone = "green" | "lime" | "teal" | "neutral";

const tones: Record<Tone, string> = {
  green: "bg-[var(--fg-green-700)] text-white",
  lime: "bg-[var(--fg-lime-500)] text-[var(--fg-green-900)]",
  teal: "bg-[var(--fg-teal-600)] text-white",
  neutral: "bg-[var(--bg-sunken)] text-[var(--text-muted)]",
};

export function Badge({
  children,
  tone = "green",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
