import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Sin conexión", robots: { index: false } };

export default function OfflinePage() {
  return (
    <Container className="flex min-h-[60svh] max-w-xl flex-col items-start justify-center gap-5 py-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[rgba(216,181,88,0.12)] text-[var(--fg-lime-400)]">
        <WifiOff size={26} />
      </span>
      <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Sin conexión</h1>
      <p className="leading-relaxed text-[var(--text-muted)]">
        No hay internet en este momento. Las páginas que ya visitó siguen disponibles; esta aún no se había guardado. Vuelva a intentarlo cuando recupere la conexión.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 py-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)]">
          Ir al inicio
        </Link>
        <Link href="/quienes-somos" className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-5 py-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--text)]">
          Quiénes somos
        </Link>
      </div>
    </Container>
  );
}
