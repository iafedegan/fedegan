import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldX } from "lucide-react";
import { lookupCode } from "@/lib/lms/queries";

export const metadata: Metadata = { title: "Verificación", robots: { index: false } };

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = await lookupCode(decodeURIComponent(code));
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-14 text-center">
      <Image src="/brand/ucg-escudo.svg" alt="Escudo UCG" width={1893} height={2385} unoptimized className="h-20 w-auto" />
      {found ? (
        <div className="w-full rounded-[var(--radius-lg)] border border-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-8">
          <BadgeCheck size={36} className="mx-auto text-[var(--fg-lime-500)]" />
          <h1 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">{found.type === "carnet" ? "Carnet válido" : "Certificado válido"}</h1>
          <p className="mt-5 text-sm uppercase tracking-[0.16em] text-[var(--text-faint)]">{found.type === "carnet" ? "Estudiante" : "Se certifica a"}</p>
          <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{found.name}</p>
          {found.type === "carnet" ? (
            <p className="mt-4 text-[var(--text-muted)]">Estudiante de la Escuela Virtual FEDEGÁN–FNG desde {fmt(found.since)}. Certificados obtenidos: <b className="text-[var(--text)]">{found.certificates}</b>.</p>
          ) : (
            <p className="mt-4 text-[var(--text-muted)]">Completó el curso <b className="text-[var(--text)]">{found.course}</b> el {fmt(found.date)}.</p>
          )}
          <p className="mt-5 font-mono text-sm text-[var(--text-faint)]">{code.toUpperCase()}</p>
        </div>
      ) : (
        <div className="w-full rounded-[var(--radius-lg)] border border-[#f08a8a] bg-[var(--surface-solid)] p-8">
          <ShieldX size={36} className="mx-auto text-[#f08a8a]" />
          <h1 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">No encontramos ese código</h1>
          <p className="mt-3 text-[var(--text-muted)]">Revise que esté bien escrito. Si lo escaneó de un carnet o certificado y sigue sin validar, escríbanos desde la página de contacto.</p>
        </div>
      )}
      <Link href="/escuela-virtual" className="text-sm font-semibold text-[var(--fg-lime-400)] hover:underline">Ir a la Escuela Virtual →</Link>
    </div>
  );
}
