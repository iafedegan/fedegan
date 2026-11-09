import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";
import { auth, demoEnabled } from "@/auth";
import { destinoTrasIngresar } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { AccountPicker } from "@/components/blocks/AccountPicker";

export const metadata: Metadata = { title: "Elegir cuenta", robots: { index: false } };

export default async function CuentaPage() {
  if (!demoEnabled) redirect("/ingresar");
  const session = await auth();
  if (session?.user) redirect(destinoTrasIngresar(session.user.roles));

  return (
    <>
    <i hidden className="nomast" />
    <section className="pg-stage flex min-h-[calc(100dvh-4.7rem)] items-center border-b-0 lg:min-h-[calc(100dvh-7.8rem)]">
      <div className="pg-photo" aria-hidden="true">
        <Image src="/headers/campo.jpg" alt="" fill priority sizes="(min-width: 1024px) 56vw, 100vw" style={{ objectPosition: "50% 55%" }} />
      </div>
      <Container className="relative grid w-full items-center gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_28rem] lg:gap-16">
        <div className="hidden max-w-lg lg:block">
          <span className="eyebrow">Acceso seguro</span>
          <h1 className="mt-4 font-[var(--font-display)] text-5xl font-bold leading-[1.05] text-[var(--text)]">
            Su espacio en <span className="text-[var(--fg-lime-400)]">Mi FEDEGÁN</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">
            Elija un perfil para ver las aplicaciones que su rol tiene habilitadas dentro del ecosistema FEDEGÁN–FNG.
          </p>
          <ul className="mt-8 flex flex-col gap-3.5 text-sm text-[var(--text-muted)]">
            <li className="flex items-center gap-3"><ShieldCheck size={18} className="shrink-0 text-[var(--fg-lime-400)]" /> Acceso por perfil y rol</li>
            <li className="flex items-center gap-3"><Lock size={18} className="shrink-0 text-[var(--fg-lime-400)]" /> Sin contraseñas en esta demostración</li>
            <li className="flex items-center gap-3"><Sparkles size={18} className="shrink-0 text-[var(--fg-lime-400)]" /> Aplicaciones personalizadas para cada equipo</li>
          </ul>
          <Link href="/ingresar" className="mt-8 inline-block text-sm font-semibold text-[var(--fg-lime-400)] underline underline-offset-4">
            Volver a las opciones de ingreso
          </Link>
        </div>
        <AccountPicker />
      </Container>
    </section>
    </>
  );
}
