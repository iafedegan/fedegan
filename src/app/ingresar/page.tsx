import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HelpCircle, Lock, ShieldCheck } from "lucide-react";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { Container } from "@/components/ui/Container";
import { SignInPanel } from "@/components/blocks/SignInPanel";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function IngresarPage() {
  const session = await auth();
  if (session?.user) redirect("/mi-fedegan");

  return (
    <section className="pg-stage flex min-h-[calc(100dvh-4.7rem)] items-center border-b-0 lg:min-h-[calc(100dvh-7.8rem)]">
      <div className="pg-photo" aria-hidden="true">
        <Image src="/headers/campo.jpg" alt="" fill priority sizes="(min-width: 1024px) 56vw, 100vw" style={{ objectPosition: "50% 55%" }} />
      </div>
      <Container className="relative grid w-full items-center gap-5 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-10">
        <div className="max-w-md">
          <span className="eyebrow">Acceso</span>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-[1.06] text-[var(--text)] sm:mt-4 sm:text-5xl">Iniciar sesión</h1>
          <p className="mt-2 text-base leading-relaxed sm:mt-4 sm:text-lg text-[var(--text-muted)]">
            Elija cómo desea ingresar a los servicios personalizados de FEDEGÁN–FNG.
          </p>
          <ul className="mt-7 hidden flex-col gap-3.5 text-sm text-[var(--text-muted)] lg:flex">
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
        <SignInPanel entra={entraConfigured} demo={demoEnabled} />
      </Container>
    </section>
  );
}
