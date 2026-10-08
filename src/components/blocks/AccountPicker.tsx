"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Check, FlaskConical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { demoProfiles } from "@/lib/access";

const steps = ["Validando la cuenta", "Cargando perfil y roles", "Habilitando aplicaciones"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function AccountPicker() {
  const [picked, setPicked] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!picked) return;
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), 700 * (i + 1)));
    const done = setTimeout(() => signIn("demo", { profile: picked, redirectTo: "/mi-fedegan" }), 700 * steps.length + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [picked]);

  const profile = demoProfiles.find((p) => p.id === picked);

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-xs text-[var(--text-muted)]">
        <FlaskConical size={14} className="shrink-0 text-[var(--fg-green-700)]" />
        Demostración: simula el ingreso con Microsoft Entra ID. No se piden contraseñas.
      </div>

      {!picked ? (
        <div className="flex flex-col gap-1 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--fg-green-600)]">FEDEGÁN–FNG</p>
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Elija una cuenta</h1>
          <p className="mb-3 text-sm text-[var(--text-muted)]">para continuar a Mi FEDEGÁN</p>
          <ul className="flex flex-col divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)]">
            {demoProfiles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPicked(p.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-muted)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fg-green-700)] text-sm font-bold text-[var(--on-accent)]">
                    {initials(p.nombre)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-[var(--text)]">{p.nombre}</span>
                    <span className="truncate text-xs text-[var(--text-faint)]">{p.email}</span>
                    <span className="truncate text-xs text-[var(--text-muted)]">{p.cargo}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--text-faint)]">Cuentas de ejemplo para mostrar los distintos perfiles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fg-green-700)] text-sm font-bold text-[var(--on-accent)]">
              {initials(profile?.nombre ?? "")}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--text)]">{profile?.nombre}</span>
              <span className="text-xs text-[var(--text-faint)]">{profile?.email}</span>
            </div>
          </div>
          <h1 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Iniciando sesión…</h1>
          <ul className="flex flex-col gap-3">
            {steps.map((label, i) => {
              const done = step > i;
              const current = step === i;
              return (
                <li key={label} className={`flex items-center gap-3 text-sm ${done || current ? "text-[var(--text)]" : "text-[var(--text-faint)]"}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-strong)]">
                    {done ? <Check size={14} className="text-[var(--fg-green-700)]" /> : current ? <Loader2 size={14} className="animate-spin" /> : null}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {profile?.roles.map((r) => (
              <Badge key={r} tone="neutral">{r}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
