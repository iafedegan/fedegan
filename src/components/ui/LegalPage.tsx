import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export type LegalDoc = { label: string; href: string };
export type LegalSection = { title: string; body: string[] };

// Plantilla de las páginas legales del pie: texto resumido + enlace a los documentos oficiales.
export function LegalPage({
  eyebrow,
  title,
  description,
  sections,
  docs,
  crumb,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
  docs: LegalDoc[];
  crumb: string;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} image="/headers/ia-legal.jpg" breadcrumbs={[{ label: crumb }]} compact />
      <Container className="grid gap-10 py-8 sm:py-12 lg:grid-cols-[1.4fr_0.8fr] lg:gap-14">
        <div className="flex max-w-3xl flex-col gap-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">{p}</p>
              ))}
            </section>
          ))}
        </div>
        <aside>
          <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)]">Documentos oficiales</h2>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {docs.map((d) => (
              <li key={d.href}>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 py-3 text-sm font-semibold text-[var(--text)] hover:text-[var(--fg-lime-400)]">
                  {d.label} <ArrowUpRight size={14} className="mt-0.5 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </>
  );
}
