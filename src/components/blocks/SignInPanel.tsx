"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Building2, HelpCircle, Lock, ShieldCheck, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const card = "flex flex-col gap-4 p-7 sm:p-8";
function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <rect width="7.5" height="7.5" fill="#f25022" />
      <rect x="8.5" width="7.5" height="7.5" fill="#7fba00" />
      <rect y="8.5" width="7.5" height="7.5" fill="#00a4ef" />
      <rect x="8.5" y="8.5" width="7.5" height="7.5" fill="#ffb900" />
    </svg>
  );
}

const iconBox =
  "flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]";

export function SignInPanel({ entra, demo }: { entra: boolean; demo: boolean }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    await signIn("microsoft-entra-id", { redirectTo: "/mi-fedegan" });
    setBusy(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card hover={false} accent="92,205,134"><section id="ganaderos" className={card}>
        <span className={iconBox}>
          <Sprout size={22} />
        </span>
        <Badge tone="lime" className="self-start">Próximamente</Badge>
        <h2 className="text-xl font-bold text-[var(--text)]">Ganaderos y aliados</h2>
        <p className="leading-relaxed text-[var(--text-muted)]">
          Registro e ingreso con correo, teléfono móvil o cuenta social para consultar trámites,
          recibir alertas y acceder a beneficios por membresía.
        </p>
        <div className="mt-auto flex flex-wrap gap-3">
          <Button disabled className="w-full sm:w-auto">Ingresar</Button>
          <Button variant="secondary" disabled className="w-full sm:w-auto">Crear cuenta</Button>
        </div>
      </section></Card>

      <Card hover={false}><section id="funcionarios" className={card}>
        <span className={iconBox}>
          <Building2 size={22} />
        </span>
        <Badge tone={entra ? "green" : "lime"} className="self-start">
          {entra ? "Disponible" : demo ? "Demostración" : "Pendiente de configurar"}
        </Badge>
        <h2 className="text-xl font-bold text-[var(--text)]">Funcionarios FEDEGÁN</h2>
        <p className="leading-relaxed text-[var(--text-muted)]">
          Ingreso con la cuenta institucional de Microsoft. Según su perfil verá las aplicaciones
          habilitadas, entre ellas la administración del portal y de CONtexto Ganadero.
        </p>
        <div className="mt-auto flex flex-col gap-2">
          {entra ? (
            <Button disabled={busy} onClick={go} className="w-full"><MicrosoftMark /> Ingresar con cuenta institucional</Button>
          ) : demo ? (
            <>
              <Button href="/ingresar/cuenta" className="w-full"><MicrosoftMark /> Ingresar con cuenta institucional</Button>
              <p className="text-xs text-[var(--text-faint)]">
                Ingreso simulado con cuentas de ejemplo, mientras se conecta Azure.
              </p>
            </>
          ) : (
            <>
              <Button disabled className="w-full">Ingresar con cuenta institucional</Button>
              <p className="text-xs text-[var(--text-faint)]">
                Falta registrar la aplicación en Azure y cargar sus credenciales en el servidor.
              </p>
            </>
          )}
        </div>
      </section></Card>

      <ul className="grid gap-4 text-sm text-[var(--text-muted)] sm:grid-cols-3 md:col-span-2">
        <li className="flex items-center gap-3">
          <ShieldCheck size={18} className="shrink-0 text-[var(--fg-lime-400)]" /> Conexión cifrada y acceso por perfil
        </li>
        <li className="flex items-center gap-3">
          <Lock size={18} className="shrink-0 text-[var(--fg-lime-400)]" /> Sus datos no se comparten con terceros
        </li>
        <li className="flex items-center gap-3">
          <HelpCircle size={18} className="shrink-0 text-[var(--fg-lime-400)]" />
          <span>
            ¿Necesita ayuda?{" "}
            <Link href="/contacto" className="font-semibold text-[var(--fg-lime-400)] underline underline-offset-4">Escríbanos</Link>
          </span>
        </li>
      </ul>
    </div>
  );
}
