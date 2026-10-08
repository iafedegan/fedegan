import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconMap } from "@/components/ui/icon-map";
import { pisos, type Local } from "@/content/site";

function Storefront({ local }: { local: Local }) {
  const Icon = iconMap[local.icon] ?? iconMap.store;
  const open = local.status === "abierto";
  const content = (
    <div
      className={`group relative h-full flex flex-col rounded-[var(--radius-md)] border bg-white overflow-hidden transition-all duration-500 [transition-timing-function:var(--ease-lux)] ${
        open
          ? "border-[var(--border)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)] hover:border-[var(--fg-green-600)]"
          : "border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]"
      }`}
    >
      <div
        aria-hidden
        className="h-3 w-full"
        style={{
          background: open
            ? "repeating-linear-gradient(90deg, var(--fg-green-700) 0 18px, var(--fg-lime-500) 18px 36px)"
            : "repeating-linear-gradient(90deg, var(--border-strong) 0 18px, var(--border) 18px 36px)",
        }}
      />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`w-11 h-11 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors ${
              open
                ? "bg-[var(--bg-muted)] text-[var(--fg-green-700)] group-hover:bg-[var(--fg-green-700)] group-hover:text-white"
                : "bg-[var(--bg-sunken)] text-[var(--text-faint)]"
            }`}
          >
            <Icon size={21} />
          </span>
          <span className="font-mono text-[0.68rem] font-bold tracking-wider text-[var(--text-faint)] border border-[var(--border-strong)] rounded-[var(--radius-sm)] px-1.5 py-0.5">
            LOCAL {local.numero}
          </span>
        </div>
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-green-600)]">{local.rubro}</p>
          <h3 className="font-bold text-[var(--text)] text-lg leading-snug mt-0.5">{local.nombre}</h3>
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{local.descripcion}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
              open ? "text-[var(--fg-green-700)]" : "text-[var(--text-faint)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${open ? "bg-[var(--fg-lime-500)] shadow-[0_0_0_3px_rgba(141,198,63,0.25)]" : "bg-[var(--border-strong)]"}`}
            />
            {open ? "Abierto" : "Próxima apertura"}
          </span>
          {open && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--fg-green-700)]">
              Entrar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!open) return <div aria-disabled="true">{content}</div>;
  return (
    <Link href={local.href} target={local.external ? "_blank" : undefined} className="block h-full">
      {content}
    </Link>
  );
}

export function MallDirectory({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="py-10 sm:py-14 bg-[var(--bg-muted)]" aria-labelledby="directorio-title">
      <Container>
        {showHeading && (
          <SectionHeading eyebrow="Directorio del portal" title="¿A qué local desea entrar hoy?" action={{ label: "Ver directorio completo", href: "/directorio" }} />
        )}
        <div className="flex flex-col gap-12">
          {pisos.map((piso) => (
            <div key={piso.id}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4 pb-3 border-b-2 border-[var(--fg-green-700)]">
                <h3 className="font-extrabold text-lg text-[var(--fg-green-800)] font-[var(--font-display)]">{piso.nombre}</h3>
                <p className="text-sm text-[var(--text-muted)]">{piso.descripcion}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {piso.locales.map((l) => (
                  <Storefront key={l.id} local={l} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
