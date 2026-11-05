import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Noticia } from "@/lib/contexto";

// Nota principal de la portada de noticias: foto grande a la izquierda, texto a la derecha.
export function NoticiaDestacada({ n }: { n: Noticia }) {
  return (
    <Link href={`/noticias/${n.slug}`} className="nw-lead group">
      <span className="nw-lead-img">
        <Image src={n.image ?? "/headers/campo.jpg"} alt={n.imageAlt ?? ""} fill priority unoptimized={Boolean(n.image?.startsWith("http"))} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </span>
      <span className="nw-lead-body">
        <span className="nw-kicker">
          {n.section} · {n.date}
        </span>
        {(n.ultimaHora || n.enVivo) && (
          <span className="flex flex-wrap gap-1.5">
            {n.ultimaHora && <Badge tone="alert">Última hora</Badge>}
            {n.enVivo && <Badge tone="alert">En vivo</Badge>}
          </span>
        )}
        <span className="nw-lead-title">{n.title}</span>
        {n.dek && <span className="nw-lead-dek">{n.dek}</span>}
        <span className="nw-more">
          Leer la nota <ArrowRight size={15} aria-hidden />
        </span>
      </span>
    </Link>
  );
}

// Nota breve para la columna «Lo último»: miniatura, sección y titular.
export function NoticiaFila({ n }: { n: Noticia }) {
  return (
    <Link href={`/noticias/${n.slug}`} className="nw-row group">
      <span className="nw-row-img">
        <Image src={n.image ?? "/headers/campo.jpg"} alt="" fill unoptimized={Boolean(n.image?.startsWith("http"))} sizes="120px" className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="nw-kicker">
          {n.section} · {n.date}
        </span>
        <span className="nw-row-title">{n.title}</span>
      </span>
    </Link>
  );
}
