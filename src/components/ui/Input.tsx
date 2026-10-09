import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(216,181,88,0.18)] focus:border-[var(--fg-lime-500)] ${className}`}
      {...props}
    />
  );
}
