import { Badge } from "@/components/ui/Badge";
import { PhotoCard } from "@/components/ui/PhotoCard";
import type { Noticia } from "@/lib/contexto";

const ACCENTS = ["47,156,98", "214,172,78", "222,134,80", "56,176,160"];

// Nota de CONtexto como ficha con foto y ola: la sección y el título abajo; al pasar el cursor, la bajada.
export function NoticiaCard({ n }: { n: Noticia }) {
  const accent = ACCENTS[(n.slug.length + n.section.length) % ACCENTS.length];
  return (
    <PhotoCard
      image={n.image ?? "/headers/campo.jpg"}
      accent={accent}
      kicker={`${n.section} · ${n.date}`}
      title={n.title}
      text={n.dek}
      href={`/noticias/${n.slug}`}
      cta="Leer la nota"
      badge={
        n.ultimaHora || n.enVivo ? (
          <>
            {n.ultimaHora && <Badge tone="alert">Última hora</Badge>}
            {n.enVivo && <Badge tone="alert">En vivo</Badge>}
          </>
        ) : undefined
      }
    />
  );
}
