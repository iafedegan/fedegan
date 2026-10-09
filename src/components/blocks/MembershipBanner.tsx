import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const bullets = [
  "Gestione sus trámites en línea",
  "Acceda a información personalizada",
  "Reciba comunicaciones y alertas",
  "Y mucho más…",
];

export function MembershipBanner() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="gl">
          <div className="gl-face">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(90% 120% at 95% 100%, rgba(216,181,88,0.22), transparent 60%)" }}
            />
            <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <Badge tone="lime">Próximamente</Badge>
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                  Mi FEDEGÁN, su espacio personalizado
                </h2>
                <p className="mt-4 max-w-lg leading-relaxed text-[var(--text-muted)]">
                  Un área exclusiva para nuestros afiliados y usuarios registrados, con acceso a
                  información, herramientas y beneficios del ecosistema FEDEGÁN–FNG.
                </p>
                <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Check size={15} className="text-[var(--fg-lime-400)]" /> {b}
                    </li>
                  ))}
                </ul>
                <Button href="/mi-fedegan" variant="lime" className="mt-8">
                  Conozca más →
                </Button>
              </div>

              <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[rgba(255,255,255,0.03)] lg:block">
                <div className="absolute inset-4 flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-solid)] p-5 shadow-[var(--shadow-lg)]">
                  <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-400)]">Mi FEDEGÁN</span>
                  {[70, 45, 85].map((w, i) => (
                    <span key={i} className="h-2.5 rounded-full bg-[var(--bg-sunken)]">
                      <span className="block h-full rounded-full bg-[var(--fg-lime-500)]" style={{ width: `${w}%` }} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
