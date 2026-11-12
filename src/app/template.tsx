import type { ReactNode } from "react";

// Se vuelve a montar en cada navegación: el contenido entra con un desenfoque que se aclara y un destello dorado cruza la parte superior.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="page-in">
      <i className="page-sweep" aria-hidden />
      {children}
    </div>
  );
}
