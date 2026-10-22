import type { ReactNode } from "react";

// Piezas de formulario compartidas por las pantallas del sistema de pago.

export const inputCls =
  "w-full rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-3 text-base text-[var(--text)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--fg-lime-500)] focus:shadow-[0_0_0_3px_rgba(216,181,88,0.16)]";

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-snug text-[var(--text-faint)]">{hint}</p>}
    </div>
  );
}

export const panel = "rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--surface-solid)]";

export function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11] transition hover:bg-[var(--fg-lime-400)] disabled:cursor-not-allowed disabled:opacity-45 ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}
