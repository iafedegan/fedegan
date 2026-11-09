import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { pagosActual } from "@/content/pagos";
import { panel } from "./ui";

// Ingreso de recaudadores: el formulario real del sistema de pago en línea. Si ese sistema permite mostrarse dentro del portal
// se incrusta aquí; si no, se ofrece el acceso directo. No se usa «sandbox»: es un sistema propio de FEDEGÁN y el flujo de pago (PSE)
// necesita poder salir del marco hacia el banco.
export function PagosEmbebido({ embebible }: { embebible: boolean }) {
  if (embebible) {
    return (
      <div className={`${panel} overflow-hidden border-t-2 border-t-[var(--fg-lime-500)]`}>
        <iframe
          src={pagosActual}
          title="Sistema de pago en línea de la cuota de fomento"
          className="block h-[54rem] w-full border-0 bg-white sm:h-[50rem]"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <p className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--text-muted)]">
          ¿Algo no carga bien?{" "}
          <a href={pagosActual} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--fg-lime-400)] underline underline-offset-[3px]">
            Abra el sistema de pagos en una pestaña nueva <ArrowUpRight size={13} />
          </a>
        </p>
      </div>
    );
  }
  return (
    <div className={`${panel} border-t-2 border-t-[var(--fg-lime-500)] p-6 sm:p-8`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)]">
        <LockKeyhole size={20} strokeWidth={1.6} />
      </span>
      <h2 className="mt-4 font-[var(--font-display)] text-2xl font-bold text-[var(--text)] sm:text-3xl">Bienvenido al sistema de pago en línea</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
        Ingrese con su identificación de recaudador (NIT con dígito de verificación, sin guion ni espacio, o cédula) para diligenciar la planilla y pagar por PSE. En su primer ingreso, su clave es el mismo número de identificación.
      </p>
      <a
        href={pagosActual}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-[0.25rem] bg-[var(--fg-lime-500)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11] transition hover:brightness-110"
      >
        Ingresar al sistema de pagos <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
