import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { infoLinks } from "@/content/site";
import { iconMap } from "@/components/ui/icon-map";

const accents = ["216,181,88", "92,205,134", "230,160,108"];

export function InfoLinksRow() {
  return (
    <section className="py-8 sm:py-12">
      <Container className="grid gap-6 sm:grid-cols-3">
        {infoLinks.map((l, i) => {
          const Icon = iconMap[l.icon];
          const cta = l.title.includes("Programas") ? "Explorar programas" : l.title.includes("Normatividad") ? "Ver normatividad" : "Ir a preguntas frecuentes";
          return (
            <Link key={l.href} href={l.href} className="group block h-full">
              <Card accent={accents[i % accents.length]}>
                <div className="flex flex-1 gap-4 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))] transition-colors duration-300 group-hover:bg-[rgb(var(--acc-rgb))] group-hover:text-[var(--on-accent)]">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{l.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{l.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
                      {cta}
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </Container>
    </section>
  );
}
