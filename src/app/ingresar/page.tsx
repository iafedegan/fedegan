import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignInPanel } from "@/components/blocks/SignInPanel";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function IngresarPage() {
  const session = await auth();
  if (session?.user) redirect("/mi-fedegan");

  return (
    <>
      <PageHeader
        eyebrow="Acceso"
        title="Iniciar sesión"
        description="Elija cómo desea ingresar a los servicios personalizados de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Iniciar sesión" }]}
        compact
      />
      <Container className="py-10 sm:py-14">
        <SignInPanel entra={entraConfigured} demo={demoEnabled} />
      </Container>
    </>
  );
}
