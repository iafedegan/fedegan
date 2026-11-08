import type { ReactNode } from "react";

// Ancho del contenido del panel: todas las pantallas usan todo el ancho disponible.
export function AdminContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-none px-4 py-7 sm:px-8 sm:py-10 lg:px-10">{children}</div>;
}
