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
    <section className="py-10 sm:py-12">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--fg-green-900)] text-white p-8 sm:p-12 grid lg:grid-cols-[1fr_0.9fr] gap-8 items-center">
          <div
            className="absolute inset-0 opacity-90 -z-10"
            style={{
              background:
                "radial-gradient(90% 120% at 90% 100%, rgba(216,181,88,0.25), transparent 60%)",
            }}
          />
          <div>
            <Badge tone="lime">Próximamente</Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight">
              Mi FEDEGÁN, su espacio personalizado
            </h2>
            <p className="mt-3 text-white/75 max-w-lg leading-relaxed">
              Un área exclusiva para nuestros afiliados y usuarios registrados, con acceso a
              información, herramientas y beneficios del ecosistema FEDEGÁN–FNG.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-white/85">
                  <Check size={15} className="text-[var(--fg-lime-400)]" /> {b}
                </li>
              ))}
            </ul>
            <Button href="/mi-fedegan" variant="lime" className="mt-7">
              Conozca más →
            </Button>
          </div>

          <div className="hidden lg:block relative aspect-[4/3] rounded-[var(--radius-md)] border border-white/15 bg-white/5 overflow-hidden">
            <div className="absolute inset-4 rounded-[var(--radius-sm)] bg-white/95 shadow-[var(--shadow-lg)] p-4 flex flex-col gap-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--fg-green-700)]">
                Mi FEDEGÁN
              </span>
              {[70, 45, 85].map((w, i) => (
                <span key={i} className="h-2.5 rounded-full bg-[var(--bg-sunken)]">
                  <span
                    className="block h-full rounded-full bg-[var(--fg-lime-500)]"
                    style={{ width: `${w}%` }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
