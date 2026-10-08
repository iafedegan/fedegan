import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "lime";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition-all duration-300 [transition-timing-function:var(--ease-lux)] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--fg-green-700)] text-white hover:bg-[var(--fg-green-800)] hover:-translate-y-0.5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  secondary:
    "bg-white text-[var(--fg-green-800)] border border-[var(--border-strong)] hover:border-[var(--fg-green-700)] hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-[var(--fg-green-800)] hover:bg-[var(--bg-muted)]",
  lime: "bg-[var(--fg-lime-500)] text-[var(--fg-green-900)] hover:bg-[var(--fg-lime-400)] hover:-translate-y-0.5 shadow-[var(--shadow-sm)]",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2",
  md: "text-[0.95rem] px-5 py-2.75",
};

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
