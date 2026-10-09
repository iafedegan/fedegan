import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { stats } from "@/content/site";

export function StatsStrip() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <div className="flex flex-1 flex-col gap-1.5 p-5 sm:p-6">
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{s.label}</span>
                <span className="font-[var(--font-display)] text-3xl font-bold tabular-nums text-[var(--text)] sm:text-4xl">
                  {s.value}
                  <span className="ml-1 text-base font-semibold text-[var(--text-faint)]">{s.unit}</span>
                </span>
                <span className="text-xs font-bold text-[var(--fg-lime-400)]">{s.delta}</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
