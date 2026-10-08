import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Noticia } from "@/lib/contexto";

export function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <Link href={`/noticias/${n.slug}`} className="block h-full">
      <Card className="h-full">
        <div className="aspect-[16/10] relative bg-[var(--fg-green-900)] overflow-hidden">
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
          <Badge tone="lime" className="absolute left-3 top-3">
            {n.section}
          </Badge>
        </div>
        <CardBody>
          <span className="text-xs text-[var(--text-faint)] font-semibold">{n.date}</span>
          <h3 className="font-bold text-[var(--text)] leading-snug">{n.title}</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">{n.dek}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
