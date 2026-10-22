"use client";

import { useState } from "react";
import { Eye, EyeOff, Info, LockKeyhole } from "lucide-react";
import { Field, PrimaryButton, inputCls, panel } from "./ui";
import { pagosActual } from "@/content/pagos";

type Estado = "idle" | "falta" | "pendiente" | "clave";

// Acceso al sistema de pago. Aún no está conectado al sistema de recaudo: no envía las credenciales a ninguna parte.
export function PaymentLogin() {
  const [id, setId] = useState("");
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [estado, setEstado] = useState<Estado>("idle");

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEstado(id.trim() && clave ? "pendiente" : "falta");
  }

  return (
    <div className={`${panel} border-t-2 border-t-[var(--fg-lime-500)] p-6 sm:p-8`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)]">
        <LockKeyhole size={20} strokeWidth={1.6} />
      </span>
      <h2 className="mt-4 font-[var(--font-display)] text-2xl font-bold text-[var(--text)] sm:text-3xl">Bienvenido al sistema de pago en línea</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">Ingrese con su identificación de recaudador para diligenciar la planilla y pagar por PSE.</p>

      <form onSubmit={entrar} noValidate className="mt-6 flex flex-col gap-5">
        <Field label="Identificación" htmlFor="pago-id" hint="NIT con dígito de verificación, sin guion ni espacio, o cédula de ciudadanía.">
          <input id="pago-id" inputMode="numeric" autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} className={inputCls} placeholder="Ej. 8001234567" />
        </Field>
        <Field label="Clave" htmlFor="pago-clave" hint="En su primer ingreso, su clave es el mismo número de identificación.">
          <div className="relative">
            <input id="pago-clave" type={ver ? "text" : "password"} autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className={`${inputCls} pr-12`} />
            <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Ocultar clave" : "Mostrar clave"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--text-faint)] hover:text-[var(--fg-lime-400)]">
              {ver ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <PrimaryButton type="submit">Entrar</PrimaryButton>
          <button type="button" onClick={() => setEstado("clave")} className="text-sm font-semibold text-[var(--fg-lime-400)] underline decoration-[rgba(216,181,88,0.45)] underline-offset-[5px] hover:text-[var(--text)]">
            ¿Olvidó su contraseña?
          </button>
        </div>

        {estado !== "idle" && (
          <div role="status" className={`flex gap-3 rounded-[0.6rem] border p-4 text-sm leading-relaxed ${estado === "falta" ? "border-[rgba(230,160,108,0.6)] text-[var(--text)]" : "border-[var(--border-strong)] bg-[var(--bg-muted)] text-[var(--text-muted)]"}`}>
            <Info size={18} className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />
            <div>
              {estado === "falta" && <p>Escriba su identificación y su clave para continuar.</p>}
              {(estado === "pendiente" || estado === "clave") && (
                <>
                  <p className="font-semibold text-[var(--text)]">Esta pantalla aún no está conectada al sistema de recaudo.</p>
                  <p className="mt-1">
                    {estado === "clave" ? "La recuperación de clave se activará al conectarla. " : "Sus datos no se enviaron a ninguna parte. "}
                    Mientras tanto, puede pagar en el{" "}
                    <a href={pagosActual} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--fg-lime-400)] underline underline-offset-[3px]">
                      sistema actual de pagos
                    </a>
                    .
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
