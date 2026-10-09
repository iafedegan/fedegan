import type { ReactNode } from "react";

// Se vuelve a montar en cada navegación: en móvil da la transición de pantalla de una app.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
