"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Building2, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const card = "flex flex-col gap-4 p-7 sm:p-8";
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
          <Button disabled>Ingresar</Button>
          <Button variant="secondary" disabled>Crear cuenta</Button>
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
            <Button disabled={busy} onClick={go}>Ingresar con cuenta institucional</Button>
          ) : demo ? (
            <>
              <Button href="/ingresar/cuenta">Ingresar con cuenta institucional</Button>
              <p className="text-xs text-[var(--text-faint)]">
                Ingreso simulado con cuentas de ejemplo, mientras se conecta Azure.
              </p>
            </>
          ) : (
            <>
              <Button disabled>Ingresar con cuenta institucional</Button>
              <p className="text-xs text-[var(--text-faint)]">
                Falta registrar la aplicación en Azure y cargar sus credenciales en el servidor.
              </p>
            </>
          )}
        </div>
      </section></Card>

    </div>
  );
}
