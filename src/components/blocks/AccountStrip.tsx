import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

// Invitación breve a Mi FEDEGÁN, en lugar de un banner grande con maqueta.
export function AccountStrip() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col items-start justify-between gap-5 rounded-[0.9rem] border border-[var(--border-strong)] border-l-[3px] border-l-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Mi FEDEGÁN, su espacio personalizado</h2>
            <p className="mt-1 max-w-2xl text-[var(--text-muted)]">Ingrese para gestionar sus trámites, recibir alertas y acceder a las aplicaciones del ecosistema.</p>
          </div>
          <Link href="/ingresar" className="inline-flex shrink-0 items-center gap-2 rounded-[0.4rem] border border-[var(--fg-lime-500)] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)] transition hover:bg-[var(--fg-lime-500)] hover:text-[#0a1a11]">
            Ingresar <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
