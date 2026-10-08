import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(28,122,66,0.15)] focus:border-[var(--fg-green-600)] ${className}`}
      {...props}
    />
  );
}
