import Link from "next/link";
import type { ReactNode } from "react";
import { ENLACE_OK, IMAGEN_OK } from "@/lib/cms/bloques";
import { Inline } from "./Inline";

// Piezas que comparten los elementos del constructor de páginas al pintarse en el sitio (BloquesRicos y ElementosExtra).
// Los enlaces y las imágenes se vuelven a comprobar al pintar, por si el dato guardado no fuera el esperado.

export const enlaceSeguro = (u: string) => (ENLACE_OK.test(u) ? u : "");
export const imagenSegura = (u: string) => (IMAGEN_OK.test(u) ? u : "");
export const esExterno = (u: string) => /^https?:\/\//i.test(u);

export function Vinculo({ href, className, label, children }: { href: string; className?: string; label?: string; children: ReactNode }) {
  const h = enlaceSeguro(href);
  if (!h) return <span className={className}>{children}</span>;
  if (h.startsWith("/")) return <Link href={h} className={className} aria-label={label}>{children}</Link>;
  const externo = /^https?:/i.test(h);
  return (
    <a href={h} className={className} aria-label={label} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

// Los enlaces con fondo propio (`bg-…`) quedan fuera del subrayado que el texto de la página pone a los enlaces.
export const botonClase = {
  solido: "bg-[var(--fg-green-800)] border-2 border-[var(--fg-green-800)] text-[var(--text-on-brand)] hover:opacity-90",
  borde: "bg-transparent border-2 border-[var(--fg-green-800)] text-[var(--fg-green-800)] hover:bg-[var(--fg-green-800)] hover:text-[var(--text-on-brand)]",
};
export const botonForma = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold no-underline transition-colors";
export const botonBase = `my-3 mr-3 ${botonForma}`;

/** Un texto con párrafos (separados por una línea en blanco) y formato (**negrita**, enlaces). */
export function Parrafos({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <>
      {texto
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p, i) => (
          <span key={i} className={`mt-2 block first:mt-0 ${className}`}>
            <Inline text={p} />
          </span>
        ))}
    </>
  );
}
