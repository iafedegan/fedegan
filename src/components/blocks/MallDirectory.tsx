import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MallRibbon } from "./MallRibbon";
import { pisos } from "@/content/site";

export function MallDirectory({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="py-10 sm:py-14 bg-[var(--bg-muted)]" aria-labelledby="directorio-title">
      <Container>
        {showHeading && (
          <SectionHeading eyebrow="Directorio del portal" title="¿A qué local desea entrar hoy?" action={{ label: "Ver directorio completo", href: "/directorio" }} />
        )}
        <div className="flex flex-col gap-12">
          {pisos.map((piso) => (
            <div key={piso.id}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4 pb-3 border-b-2 border-[var(--fg-green-700)]">
                <h3 className="font-extrabold text-lg text-[var(--fg-green-800)] font-[var(--font-display)]">{piso.nombre}</h3>
                <p className="text-sm text-[var(--text-muted)]">{piso.descripcion}</p>
              </div>
              <MallRibbon locales={piso.locales} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
