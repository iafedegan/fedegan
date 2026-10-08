import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--fg-green-900)]">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 100% at 82% 20%, rgba(216,181,88,0.28), transparent 55%), linear-gradient(120deg, #0c3524 0%, #0f4a30 55%, #146238 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 28px)",
        }}
      />
      <Container className="relative py-16 sm:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div className="text-white">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-400)]">
            <span className="w-6 h-px bg-[var(--fg-lime-400)]" />
            Bienvenido al centro del sector ganadero
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-[1.08] text-white">
            FEDEGÁN–FNG, el hub del ecosistema digital ganadero de Colombia
          </h1>
          <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
            Una sola entrada para todo el ecosistema: cada servicio, medio y línea de valor tiene su propio
            local, con buscador, navegación y atención comunes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/quienes-somos" variant="lime">
              Conozca más sobre FEDEGÁN–FNG
            </Button>
            <Button href="/directorio" variant="secondary" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
              Ver directorio de locales →
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden border border-white/15 shadow-[var(--shadow-lg)]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(200deg, #1c7a42 0%, #146238 45%, #0c3524 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(70deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 34px)",
            }}
          />
          <span className="absolute left-5 bottom-5 text-white/90 font-[var(--font-display)] text-lg">
            Ganadería sostenible colombiana
          </span>
        </div>
      </Container>
    </section>
  );
}
