import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { publications } from "@/content/site";

export function PublicationsGrid() {
  return (
    <section className="py-8 sm:py-10 bg-[var(--bg-muted)]">
      <Container>
        <SectionHeading eyebrow="Recursos" title="Publicaciones y recursos" action={{ label: "Ver todas las publicaciones", href: "/publicaciones" }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {publications.map((p) => (
            <Card key={p.slug} className="!flex-row items-stretch">
              <div className="w-24 sm:w-28 shrink-0 bg-[var(--fg-green-700)] flex items-center justify-center">
                <FileText className="text-[var(--fg-lime-400)]" size={30} />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--fg-green-600)]">
                  {p.type}
                </span>
                <h3 className="font-bold text-[var(--text)] leading-snug">{p.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{p.dek}</p>
                <Link
                  href={`/publicaciones/${p.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-green-700)] hover:text-[var(--fg-green-900)]"
                >
                  <Download size={14} /> Descargar
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
