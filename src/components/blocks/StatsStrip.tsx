import { Container } from "@/components/ui/Container";
import { stats } from "@/content/site";

export function StatsStrip() {
  return (
    <section className="py-10 sm:py-12">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-5 flex flex-col gap-1 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <span className="text-xs font-semibold text-[var(--text-muted)]">{s.label}</span>
              <span className="font-[var(--font-display)] text-2xl sm:text-3xl font-extrabold text-[var(--fg-green-800)] tabular-nums">
                {s.value}
                <span className="text-base font-semibold text-[var(--text-faint)]">{s.unit}</span>
              </span>
              <span className="text-xs font-bold text-[var(--fg-lime-500)]">{s.delta}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
