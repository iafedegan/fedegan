import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden flex flex-col ${
        hover
          ? "transition-all duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)] hover:border-[var(--fg-green-600)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 flex flex-col gap-2.5 flex-1 ${className}`}>{children}</div>;
}
