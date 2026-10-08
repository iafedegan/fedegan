import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Construction, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Administración del portal", robots: { index: false } };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");

  const allowed = hasAnyRole(session.user.roles, [ROLES.portalAdmin, ROLES.portalEditor]);

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Administración del portal"
        breadcrumbs={[{ label: "Mi FEDEGÁN", href: "/mi-fedegan" }, { label: "Administración" }]}
      />
      <Container className="max-w-2xl py-14">
        {allowed ? (
          <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8">
            <Construction size={24} className="text-[var(--fg-green-700)]" />
            <h2 className="text-xl font-bold text-[var(--text)]">El gestor de contenido está pendiente</h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Su perfil tiene permiso para administrar el portal. Cuando se conecte el CMS, aquí se
              editarán el menú, los bloques de la home, las secciones y las publicaciones.
            </p>
            <Button href="/mi-fedegan" variant="secondary">Volver a mis aplicaciones</Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] p-8">
            <ShieldAlert size={24} className="text-[var(--fg-green-700)]" />
            <h2 className="text-xl font-bold text-[var(--text)]">Sin permiso para esta aplicación</h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Su perfil no incluye la administración del portal. Solicite el rol correspondiente al
              área de Tecnología.
            </p>
            <Button href="/mi-fedegan" variant="secondary">Volver a mis aplicaciones</Button>
          </div>
        )}
      </Container>
    </>
  );
}
