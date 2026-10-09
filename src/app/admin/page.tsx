import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Construction, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      <Container className="max-w-2xl py-14 sm:py-20">
        {allowed ? (
          <Card hover={false}><div className="flex flex-col items-start gap-4 p-8 sm:p-10">
            <Construction size={24} className="text-[var(--fg-green-700)]" />
            <h2 className="text-xl font-bold text-[var(--text)]">El gestor de contenido está pendiente</h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Su perfil tiene permiso para administrar el portal. Cuando se conecte el CMS, aquí se
              editarán el menú, los bloques de la home, las secciones y las publicaciones.
            </p>
            <Button href="/mi-fedegan" variant="secondary">Volver a mis aplicaciones</Button>
          </div></Card>
        ) : (
          <Card hover={false}><div className="flex flex-col items-start gap-4 p-8 sm:p-10">
            <ShieldAlert size={24} className="text-[var(--fg-green-700)]" />
            <h2 className="text-xl font-bold text-[var(--text)]">Sin permiso para esta aplicación</h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Su perfil no incluye la administración del portal. Solicite el rol correspondiente al
              área de Tecnología.
            </p>
            <Button href="/mi-fedegan" variant="secondary">Volver a mis aplicaciones</Button>
          </div></Card>
        )}
      </Container>
    </>
  );
}
