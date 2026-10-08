import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredNews } from "@/content/site";

export function NewsGrid() {
  return (
    <section className="py-4 sm:py-6">
      <Container>
        <SectionHeading eyebrow="Actualidad" title="Noticias destacadas" action={{ label: "Ver todas las noticias", href: "/noticias" }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredNews.map((n) => (
            <Link key={n.slug} href={`/noticias/${n.slug}`}>
              <Card>
                <div className="aspect-[16/10] relative bg-[var(--fg-green-800)] overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{ background: "linear-gradient(160deg,#146238,#0c3524)" }}
                  />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 26px)",
                    }}
                  />
                  <Badge tone="lime" className="absolute left-3 top-3">
                    {n.section}
                  </Badge>
                </div>
                <CardBody>
                  <span className="text-xs text-[var(--text-faint)] font-semibold">{n.date}</span>
                  <h3 className="font-bold text-[var(--text)] leading-snug">{n.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">{n.dek}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
