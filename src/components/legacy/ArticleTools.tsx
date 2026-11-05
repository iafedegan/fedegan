"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";

// Acciones de la página: imprimir y copiar el enlace.
export function ArticleTools() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el navegador no permitió copiar: no hay nada más que hacer */
    }
  };
  return (
    <div className="art-tools" role="group" aria-label="Acciones de la página">
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
      <button type="button" onClick={() => window.print()}>
        <Printer size={14} aria-hidden /> Imprimir
      </button>
    </div>
  );
}
