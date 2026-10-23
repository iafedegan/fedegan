import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Award, IdCard, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import { UniversityLogin } from "@/components/lms/UniversityLogin";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

// Solo rutas internas de la Escuela Virtual: evita redirecciones a sitios externos.
const safe = (v: string | undefined) => (v && /^\/escuela-virtual(\/|$|\?)/.test(v) && !v.startsWith("//") ? v : "/escuela-virtual/perfil");

export default async function UniversityLoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const to = safe(callbackUrl);
  const session = await auth();
  if (session?.user) redirect(to);
  return (
    <section className="relative overflow-hidden">
      <span aria-hidden className="pointer-events-none absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(216,181,88,0.14),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(47,156,98,0.2),transparent)]" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[84rem] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Image src="/brand/ucg-escudo.svg" alt="Escudo UCG" width={1893} height={2385} unoptimized priority className="h-20 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]" />
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--fg-lime-500)]">Escuela Virtual UCG</p>
            <h1 className="mt-2 font-[var(--font-display)] text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">Bienvenido, ganadero y aliado</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">Ingrese o cree su cuenta gratis para estudiar a su ritmo, evaluarse, obtener su certificado y su carnet de estudiante.</p>
          </div>
          <ul className="flex flex-col gap-3 text-[var(--text-muted)]">
            {[[PlayCircle, "11 cursos y 165 videos del Manual Práctico Ganadero"], [Award, "Certificados que puede publicar en LinkedIn"], [IdCard, "Carnet de estudiante con código QR"]].map(([Icon, t]) => {
              const I = Icon as typeof Award;
              return <li key={String(t)} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(216,181,88,0.14)] text-[var(--fg-lime-400)]"><I size={17} /></span>{String(t)}</li>;
            })}
          </ul>
          <Image src="/brand/mascota-beto.svg" alt="" width={1671} height={2388} unoptimized className="hidden h-56 w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] lg:block" />
        </div>
        <div className="flex justify-center lg:justify-end">
          <UniversityLogin callbackUrl={to} />
        </div>
      </div>
    </section>
  );
}
