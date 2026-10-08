"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Building2, FlaskConical, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { demoProfiles } from "@/lib/access";

const card =
  "flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] p-7 shadow-[var(--shadow-sm)]";
const iconBox =
  "flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--fg-green-700)] text-[var(--on-accent)]";

export function SignInPanel({ entra, demo }: { entra: boolean; demo: boolean }) {
  const [profile, setProfile] = useState<string>(demoProfiles[0].id);
  const [busy, setBusy] = useState(false);

  async function go(provider: string, extra?: Record<string, string>) {
    setBusy(true);
    await signIn(provider, { redirectTo: "/mi-fedegan", ...extra });
    setBusy(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section id="ganaderos" className={card}>
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
      </section>

      <section id="funcionarios" className={card}>
        <span className={iconBox}>
          <Building2 size={22} />
        </span>
        <Badge tone={entra ? "green" : "lime"} className="self-start">
          {entra ? "Disponible" : "Pendiente de configurar"}
        </Badge>
        <h2 className="text-xl font-bold text-[var(--text)]">Funcionarios FEDEGÁN</h2>
        <p className="leading-relaxed text-[var(--text-muted)]">
          Ingreso con la cuenta institucional de Microsoft. Según su perfil verá las aplicaciones
          habilitadas, entre ellas la administración del portal y de CONtexto Ganadero.
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Button disabled={!entra || busy} onClick={() => go("microsoft-entra-id")}>
            Ingresar con cuenta institucional
          </Button>
          {!entra && (
            <p className="text-xs text-[var(--text-faint)]">
              Falta registrar la aplicación en Azure y cargar sus credenciales en el servidor.
            </p>
          )}
        </div>
      </section>

      {demo && (
        <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-7 md:col-span-2">
          <div className="flex items-center gap-3">
            <FlaskConical size={20} className="text-[var(--fg-green-700)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Modo de prueba</h2>
            <Badge tone="neutral">Solo desarrollo</Badge>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Simula el ingreso con un perfil sin usar Azure, para probar qué aplicaciones ve cada rol.
            No existe en producción.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {demoProfiles.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border p-3 text-sm ${
                  profile === p.id ? "border-[var(--fg-green-700)] bg-[var(--surface-solid)]" : "border-[var(--border)]"
                }`}
              >
                <input type="radio" name="demo-profile" value={p.id} checked={profile === p.id} onChange={() => setProfile(p.id)} />
                <span className="flex flex-col">
                  <span className="font-semibold text-[var(--text)]">{p.nombre}</span>
                  <span className="text-xs text-[var(--text-faint)]">{p.roles.join(" · ")}</span>
                </span>
              </label>
            ))}
          </div>
          <Button className="self-start" disabled={busy} onClick={() => go("demo", { profile })}>
            Entrar en modo de prueba
          </Button>
        </section>
      )}
    </div>
  );
}
