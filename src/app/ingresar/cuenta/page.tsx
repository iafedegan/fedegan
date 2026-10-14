import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";
import { auth, demoEnabled } from "@/auth";
import { Container } from "@/components/ui/Container";
import { AccountPicker } from "@/components/blocks/AccountPicker";

export const metadata: Metadata = { title: "Elegir cuenta", robots: { index: false } };

export default async function CuentaPage() {
  if (!demoEnabled) redirect("/ingresar");
  const session = await auth();
  if (session?.user) redirect("/mi-fedegan");

  return (
    <section className="relative isolate flex min-h-[calc(100svh-7.5rem)] items-center overflow-hidden">
      <Image src="/locales/programas.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: "62% 50%" }} />
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,14,9,0.94) 0%, rgba(4,14,9,0.82) 42%, rgba(4,14,9,0.45) 100%), radial-gradient(44rem 22rem at 90% 0%, rgba(216,181,88,0.25), transparent 65%), radial-gradient(40rem 20rem at 0% 100%, rgba(47,156,98,0.3), transparent 65%)",
        }}
      />
      <Container className="grid w-full items-center gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_28rem] lg:gap-16">
        <div className="hidden max-w-lg lg:block">
          <span className="mx-kicker">Acceso seguro</span>
          <h1 className="mt-4 font-[var(--font-display)] text-5xl font-bold leading-[1.05] text-white">
            Su espacio en <span className="text-[var(--fg-lime-400)]">Mi FEDEGÁN</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Elija un perfil para ver las aplicaciones que su rol tiene habilitadas dentro del ecosistema FEDEGÁN–FNG.
          </p>
          <ul className="mt-8 flex flex-col gap-3.5 text-sm text-white/80">
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
  );
}
