import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = true,
  accent,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: string;
}) {
  return (
    <div className={`gl ${hover ? "gl-hover" : ""}`} style={accent ? ({ ["--acc-rgb" as string]: accent } as CSSProperties) : undefined}>
      <div className={`gl-face ${className}`}>{children}</div>
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
  return <div className={`flex flex-1 flex-col gap-2.5 p-5 ${className}`}>{children}</div>;
}
