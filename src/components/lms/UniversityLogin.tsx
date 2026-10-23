"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, Sprout, User, Handshake } from "lucide-react";
import { registerAccount } from "@/lib/lms/accounts";

const field = "w-full rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] py-3 pl-11 pr-4 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--fg-lime-500)]";

/** Ingreso y registro exclusivos para ganaderos y aliados de la Escuela Virtual. */
export function UniversityLogin({ callbackUrl }: { callbackUrl: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [kind, setKind] = useState<"ganadero" | "aliado">("ganadero");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  async function enter() {
    const r = await signIn("ganadero", { email, password, redirect: false });
    if (r?.error) {
      setError("Correo o contraseña incorrectos. Tras varios intentos fallidos la cuenta se bloquea 10 minutos.");
      return;
    }
    window.location.assign(callbackUrl);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      if (mode === "up") {
        const r = await registerAccount({ name, email, password, kind });
        if (!r.ok) {
          setError(r.error);
          return;
        }
      }
      await enter();
    });
  }

  const tab = (on: boolean) => `flex-1 rounded-full px-4 py-2.5 text-[0.76rem] font-bold uppercase tracking-[0.12em] transition-colors ${on ? "bg-[var(--fg-lime-500)] text-[#0a1a11]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`;

  return (
    <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <div role="tablist" aria-label="Acceso" className="flex gap-1 rounded-full border border-[var(--border-strong)] p-1">
        <button type="button" role="tab" aria-selected={mode === "in"} onClick={() => { setMode("in"); setError(""); }} className={tab(mode === "in")}>Ingresar</button>
        <button type="button" role="tab" aria-selected={mode === "up"} onClick={() => { setMode("up"); setError(""); }} className={tab(mode === "up")}>Crear cuenta</button>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        {mode === "up" && (
          <>
            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="mb-2 text-sm font-semibold text-[var(--text)]">Soy…</legend>
              {([["ganadero", "Ganadero", Sprout], ["aliado", "Aliado", Handshake]] as const).map(([v, l, Icon]) => (
                <label key={v} className={`flex cursor-pointer items-center justify-center gap-2 rounded-[0.25rem] border px-3 py-3 text-sm font-semibold transition-colors ${kind === v ? "border-[var(--fg-lime-500)] bg-[rgba(216,181,88,0.12)] text-[var(--fg-lime-400)]" : "border-[var(--border-strong)] text-[var(--text-muted)]"}`}>
                  <input type="radio" name="kind" value={v} checked={kind === v} onChange={() => setKind(v)} className="sr-only" />
                  <Icon size={17} /> {l}
                </label>
              ))}
            </fieldset>
            <label className="relative block">
              <span className="sr-only">Nombre completo</span>
              <User size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-lime-500)]" />
              <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Nombre completo" className={field} />
            </label>
          </>
        )}
        <label className="relative block">
          <span className="sr-only">Correo electrónico</span>
          <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-lime-500)]" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="Correo electrónico" className={field} />
        </label>
        <label className="relative block">
          <span className="sr-only">Contraseña</span>
          <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-lime-500)]" />
          <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "up" ? 8 : 1} autoComplete={mode === "up" ? "new-password" : "current-password"} placeholder={mode === "up" ? "Contraseña (mínimo 8 caracteres)" : "Contraseña"} className={`${field} pr-12`} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-faint)] hover:text-[var(--text)]">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </label>
        {error && <p role="alert" className="rounded-[0.25rem] border border-[#f0b5b5] bg-[#fdecec] px-3 py-2.5 text-sm text-[#7a1f1f]">{error}</p>}
        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-[0.25rem] bg-[var(--fg-lime-500)] px-6 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[#0a1a11] transition-colors hover:bg-[var(--fg-lime-400)] disabled:opacity-60">
          {pending ? "Un momento…" : mode === "in" ? "Ingresar a la Escuela" : "Crear mi cuenta"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-relaxed text-[var(--text-faint)]">
        Acceso exclusivo para ganaderos y aliados. Sus datos se usan solo para su avance, certificados y carnet.
      </p>
    </div>
  );
}
