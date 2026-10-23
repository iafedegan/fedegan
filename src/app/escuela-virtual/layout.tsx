import type { Metadata } from "next";
import type { ReactNode } from "react";

// La Escuela Virtual se presenta como un sitio aparte (UCG): su propio título de pestaña.
export const metadata: Metadata = {
  title: { default: "UCG · Escuela Virtual", template: "%s · UCG" },
  description: "Cursos del Manual Práctico Ganadero con evaluaciones, certificado y carnet de estudiante.",
};

export default function EscuelaLayout({ children }: { children: ReactNode }) {
  return children;
}
