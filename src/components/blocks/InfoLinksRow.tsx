import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { infoLinks } from "@/content/site";
import { iconMap } from "@/components/ui/icon-map";

export function InfoLinksRow() {
  return (
    <section className="py-6 sm:py-8 bg-[var(--bg-muted)]">
      <Container className="grid sm:grid-cols-3 gap-5">
        {infoLinks.map((l) => {
          const Icon = iconMap[l.icon];
          return (
            <Link
              key={l.href}
              href={l.href}
              className="group flex gap-4 rounded-[var(--radius-lg)] bg-[var(--surface-solid)] border border-[var(--border)] p-5 hover:border-[var(--fg-green-600)] hover:shadow-[var(--shadow-md)] transition-all duration-300"
            >
              <span className="w-11 h-11 shrink-0 rounded-full bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center group-hover:bg-[var(--fg-green-700)] group-hover:text-[var(--on-accent)] transition-colors">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-bold text-[var(--text)]">{l.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">{l.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--fg-green-700)] mt-2">
                  {l.title.includes("Programas") ? "Explorar programas" : l.title.includes("Normatividad") ? "Ver normatividad" : "Ir a preguntas frecuentes"}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </Container>
    </section>
  );
}
