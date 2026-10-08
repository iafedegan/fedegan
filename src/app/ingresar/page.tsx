import type { Metadata } from "next";
import { Building2, Sprout } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function IngresarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acceso"
        title="Iniciar sesión"
        description="Elija cómo desea ingresar a los servicios personalizados de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Iniciar sesión" }]}
      />
      <Container className="grid gap-6 py-12 md:grid-cols-2">
        <section id="ganaderos" className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] p-7 shadow-[var(--shadow-sm)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--fg-green-700)] text-[var(--on-accent)]">
            <Sprout size={22} />
          </span>
          <Badge tone="lime" className="self-start">Próximamente</Badge>
          <h2 className="text-xl font-bold text-[var(--text)]">Ganaderos y aliados</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">
            Registro e ingreso con correo, teléfono móvil o cuenta social para consultar trámites,
            recibir alertas y acceder a beneficios por membresía.
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            <Button disabled>Ingresar</Button>
            <Button variant="secondary" disabled>Crear cuenta</Button>
          </div>
        </section>

        <section id="funcionarios" className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] p-7 shadow-[var(--shadow-sm)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--fg-green-700)] text-[var(--on-accent)]">
            <Building2 size={22} />
          </span>
          <Badge tone="lime" className="self-start">Próximamente</Badge>
          <h2 className="text-xl font-bold text-[var(--text)]">Funcionarios FEDEGÁN</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">
            Ingreso único con la cuenta institucional para acceder a las aplicaciones internas desde
            un solo panel.
          </p>
          <div className="mt-auto flex flex-wrap gap-3">
            <Button disabled>Ingresar con cuenta institucional</Button>
          </div>
        </section>

        <p className="text-sm text-[var(--text-faint)] md:col-span-2">
          El acceso se activará cuando FEDEGÁN habilite el módulo de identidad del portal. Mientras
          tanto, los servicios disponibles hoy están en la sección{" "}
          <a href="/servicios" className="font-semibold underline">Servicios</a>.
        </p>
      </Container>
    </>
  );
}
