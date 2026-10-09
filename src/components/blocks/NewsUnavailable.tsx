import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewsUnavailable({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-start gap-4 rounded-[1.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] text-[var(--fg-lime-500)]">
        <Newspaper size={22} />
      </span>
      <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Las noticias no están disponibles por ahora</h2>
      <p className="max-w-xl leading-relaxed text-[var(--text-muted)]">
        No pudimos cargar las notas de CONtexto Ganadero en este momento. Puede consultarlas directamente en su portal mientras se restablece la conexión.
      </p>
      <Button href="https://www.contextoganadero.com/" variant="primary">
        Ir a CONtexto Ganadero
      </Button>
    </div>
  );
}
