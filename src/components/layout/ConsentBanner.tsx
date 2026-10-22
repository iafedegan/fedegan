"use client";

import { useEffect, useState } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { EVENTO_PRIVACIDAD, borrarUso, getConsent, getUso, setConsent } from "@/lib/uso";
import { legales } from "@/content/accesos";

// Permiso para personalizar el orden del recorrido según el uso. Se pregunta una vez y puede cambiarse en
// «Preferencias de privacidad» (pie de página).
export function ConsentBanner() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<boolean | null>(null);

  useEffect(() => {
    const c = getConsent();
    // lectura de una cookie del navegador: solo puede hacerse tras montar
    const t = window.setTimeout(() => {
      setEstado(c);
      setAbierto(c === null);
    }, 1200);
    const abrir = () => {
      setEstado(getConsent());
      setAbierto(true);
    };
    window.addEventListener(EVENTO_PRIVACIDAD, abrir);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(EVENTO_PRIVACIDAD, abrir);
    };
  }, []);

  if (!abierto) return null;
  const decidir = (v: boolean) => {
    setConsent(v);
    setEstado(v);
    setAbierto(false);
  };
  const usos = Object.values(getUso()).reduce((a, b) => a + b, 0);

  return (
    <section role="dialog" aria-labelledby="consent-title" className="fixed bottom-24 left-4 z-[80] w-[min(26rem,calc(100vw-2rem))] rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] md:bottom-6">
      <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="absolute right-3 top-3 rounded p-1 text-[var(--text-faint)] hover:text-[var(--text)]">
        <X size={16} />
      </button>
      <p id="consent-title" className="flex items-center gap-2 font-[var(--font-display)] text-lg font-bold text-[var(--text)]">
        <Cookie size={18} className="text-[var(--fg-lime-400)]" /> Personalice su recorrido
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        Con su permiso, guardamos en <b className="text-[var(--text)]">este dispositivo</b> una cookie que cuenta qué secciones visita más, para mostrarle primero las que más usa. No guardamos datos personales ni la dirección MAC, y nada sale de su dispositivo.
      </p>
      <p className="mt-2 text-xs text-[var(--text-faint)]">
        <ShieldCheck size={12} className="mr-1 inline" />
        Puede cambiarlo cuando quiera en «Preferencias de privacidad».{" "}
        <a href={legales[0].href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--fg-lime-400)]">Política de datos</a>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => decidir(true)} className="rounded-[0.25rem] bg-[var(--fg-lime-500)] px-4 py-2.5 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-[#0a1a11] hover:bg-[var(--fg-lime-400)]">
          {estado === true ? "Mantener activado" : "Aceptar"}
        </button>
        <button type="button" onClick={() => decidir(false)} className="rounded-[0.25rem] border border-[var(--border-strong)] px-4 py-2.5 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--text)]">
          {estado === true ? "Desactivar" : "Ahora no"}
        </button>
        {estado === true && usos > 0 && (
          <button type="button" onClick={() => { borrarUso(); setAbierto(false); }} className="text-xs font-semibold text-[var(--text-faint)] underline underline-offset-2 hover:text-[#f08a8a]">
            Borrar mis datos de uso
          </button>
        )}
      </div>
    </section>
  );
}
