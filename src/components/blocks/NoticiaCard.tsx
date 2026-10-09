import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Noticia } from "@/lib/contexto";

export function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <Link href={`/noticias/${n.slug}`} className="block h-full">
      <Card>
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--fg-green-900)]">
          {n.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.image} alt={n.imageAlt ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-80" style={{ background: "linear-gradient(160deg,#146238,#0c3524)" }} />
              <div
                className="absolute inset-0 opacity-30"
                style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 26px)" }}
              />
            </>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge tone="lime">{n.section}</Badge>
            {n.ultimaHora && <Badge tone="alert">Última hora</Badge>}
            {n.enVivo && <Badge tone="alert">En vivo</Badge>}
          </div>
        </div>
        <CardBody>
          <span className="text-xs font-semibold text-[var(--text-faint)]">{n.date}</span>
          <h3 className="font-bold leading-snug text-[var(--text)]">{n.title}</h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">{n.dek}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
