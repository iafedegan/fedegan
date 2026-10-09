type Tone = "green" | "lime" | "teal" | "neutral" | "alert";

const tones: Record<Tone, string> = {
  green: "bg-[var(--fg-green-700)] text-[var(--on-accent)]",
  lime: "bg-[var(--fg-lime-500)] text-[var(--fg-green-900)]",
  teal: "bg-[var(--fg-teal-600)] text-white",
  neutral: "bg-[var(--bg-sunken)] text-[var(--text-muted)]",
  alert: "bg-[#d64545] text-white",
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
