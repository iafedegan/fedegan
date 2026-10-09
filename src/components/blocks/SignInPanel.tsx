"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Building2, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const body = "flex flex-col gap-3 p-5 sm:p-6";
const iconBox =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]";

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

export function SignInPanel({ entra, demo }: { entra: boolean; demo: boolean }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    await signIn("microsoft-entra-id", { redirectTo: "/mi-fedegan" });
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card hover={false}>
        <section id="funcionarios" className={body}>
          <div className="flex items-center gap-4">
            <span className={iconBox}>
              <Building2 size={21} />
            </span>
            <div className="flex flex-col items-start gap-1.5">
              <Badge tone={entra ? "green" : "lime"}>{entra ? "Disponible" : demo ? "Demostración" : "Pendiente de configurar"}</Badge>
              <h2 className="text-xl font-bold leading-tight text-[var(--text)]">Funcionarios FEDEGÁN</h2>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Cuenta institucional de Microsoft. Verá las aplicaciones habilitadas para su perfil, entre ellas la administración del portal y de CONtexto Ganadero.
          </p>
          {entra ? (
            <Button disabled={busy} onClick={go} className="w-full">
              <MicrosoftMark /> Ingresar con cuenta institucional
            </Button>
          ) : demo ? (
            <>
              <Button href="/ingresar/cuenta" className="w-full">
                <MicrosoftMark /> Ingresar con cuenta institucional
              </Button>
              <p className="text-xs text-[var(--text-faint)]">Ingreso simulado con cuentas de ejemplo, mientras se conecta Azure.</p>
            </>
          ) : (
            <>
              <Button disabled className="w-full">Ingresar con cuenta institucional</Button>
              <p className="text-xs text-[var(--text-faint)]">Falta registrar la aplicación en Azure y cargar sus credenciales en el servidor.</p>
            </>
          )}
        </section>
      </Card>

      <Card hover={false} accent="92,205,134">
        <section id="ganaderos" className={body}>
          <div className="flex items-center gap-4">
            <span className={iconBox}>
              <Sprout size={21} />
            </span>
            <div className="flex flex-col items-start gap-1.5">
              <Badge tone="lime">Próximamente</Badge>
              <h2 className="text-xl font-bold leading-tight text-[var(--text)]">Ganaderos y aliados</h2>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Registro e ingreso con correo, teléfono móvil o cuenta social para consultar trámites, recibir alertas y acceder a beneficios.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button disabled>Ingresar</Button>
            <Button variant="secondary" disabled>Crear cuenta</Button>
          </div>
        </section>
      </Card>
    </div>
  );
}
