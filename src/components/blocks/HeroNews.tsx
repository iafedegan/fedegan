import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { NewsCarousel } from "./NewsCarousel";
import { getHomeNews } from "@/lib/contexto";

export async function HeroNews() {
  const { carousel } = await getHomeNews();
  if (carousel.length > 0) return <NewsCarousel items={carousel} />;

  return (
    <section className="pg-stage pb-24 pt-14 sm:pb-28 sm:pt-20">
      <Container className="relative">
        <span className="eyebrow">Federación Colombiana de Ganaderos</span>
        <h1 className="mt-4 max-w-3xl text-balance font-[var(--font-display)] text-4xl font-bold leading-[1.06] text-[var(--text)] sm:text-5xl lg:text-6xl">
          FEDEGÁN–FNG, el hub del ecosistema digital ganadero de Colombia
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
          Una sola entrada para todo el ecosistema: cada servicio, medio y línea de valor tiene su propio local, con buscador, navegación y atención comunes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/quienes-somos">Conozca FEDEGÁN–FNG</Button>
          <Button href="/directorio" variant="secondary">Ver directorio de locales</Button>
        </div>
        <p className="mt-6 text-sm text-[var(--text-faint)]">
          Las noticias de portada llegan desde{" "}
          <Link href="https://www.contextoganadero.com/" className="underline">CONtexto Ganadero</Link>.
        </p>
      </Container>
    </section>
  );
}
