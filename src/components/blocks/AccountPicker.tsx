"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { signIn } from "next-auth/react";
import { Check, ChevronRight, FlaskConical, Loader2 } from "lucide-react";
import { demoProfiles } from "@/lib/access";

const steps = ["Validando la cuenta", "Cargando perfil y roles", "Habilitando aplicaciones"];
const ACCENTS = ["216,181,88", "92,205,134", "230,160,108", "112,214,196"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const accent = (i: number) => ({ ["--acc-rgb" as string]: ACCENTS[i % ACCENTS.length] }) as CSSProperties;

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

  const idx = demoProfiles.findIndex((p) => p.id === picked);
  const profile = demoProfiles[idx];

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-[0.25rem] border border-[rgba(216,181,88,0.35)] bg-[rgba(8,24,17,0.78)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-[rgba(216,181,88,0.1)] px-5 py-3 text-xs text-white/75">
        <FlaskConical size={15} className="shrink-0 text-[var(--fg-lime-400)]" />
        Demostración: simula el ingreso con Microsoft Entra ID. No se piden contraseñas.
      </div>

      {!picked ? (
        <div className="flex flex-col gap-1 p-6">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-400)]">FEDEGÁN–FNG</p>
          <h2 className="font-[var(--font-display)] text-3xl font-bold text-white">Elija una cuenta</h2>
          <p className="mb-4 text-sm text-white/65">para continuar a Mi FEDEGÁN</p>
          <ul className="flex flex-col gap-2.5">
            {demoProfiles.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPicked(p.id)}
                  style={accent(i)}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--acc-rgb),0.7)] hover:bg-[rgba(var(--acc-rgb),0.08)] focus-visible:border-[rgb(var(--acc-rgb))] focus-visible:outline-none"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--acc-rgb),0.6)] bg-[linear-gradient(145deg,rgba(var(--acc-rgb),0.45),rgba(var(--acc-rgb),0.12))] text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(var(--acc-rgb),0.9)]">
                    {initials(p.nombre)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[0.95rem] font-semibold text-white">{p.nombre}</span>
                    <span className="truncate text-xs text-white/55">{p.email}</span>
                    <span className="mt-1 inline-flex self-start rounded-full border border-[rgba(var(--acc-rgb),0.45)] px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[rgb(var(--acc-rgb))]">
                      {p.cargo}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[rgb(var(--acc-rgb))]" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/45">Cuentas de ejemplo para mostrar los distintos perfiles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6" aria-live="polite" style={accent(idx)}>
          <div className="flex items-center gap-3.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(var(--acc-rgb),0.6)] bg-[linear-gradient(145deg,rgba(var(--acc-rgb),0.45),rgba(var(--acc-rgb),0.12))] text-base font-bold text-white">
              {initials(profile?.nombre ?? "")}
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-white">{profile?.nombre}</span>
              <span className="text-xs text-white/55">{profile?.email}</span>
            </div>
          </div>
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-white">Iniciando sesión…</h2>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={step}>
              <span className="block h-full rounded-full bg-[rgb(var(--acc-rgb))] transition-all duration-700 ease-out" style={{ width: `${Math.max(8, (step / steps.length) * 100)}%` }} />
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {steps.map((label, i) => {
              const done = step > i;
              const current = step === i;
              return (
                <li key={label} className={`flex items-center gap-3 text-sm transition-colors ${done || current ? "text-white" : "text-white/35"}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${done ? "border-[rgb(var(--acc-rgb))] bg-[rgba(var(--acc-rgb),0.2)]" : "border-white/20"}`}>
                    {done ? <Check size={14} className="text-[rgb(var(--acc-rgb))]" /> : current ? <Loader2 size={14} className="animate-spin" /> : null}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {profile?.roles.map((r) => (
              <span key={r} className="rounded-full border border-white/15 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white/70">{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
