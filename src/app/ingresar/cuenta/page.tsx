import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, demoEnabled } from "@/auth";
import { Container } from "@/components/ui/Container";
import { AccountPicker } from "@/components/blocks/AccountPicker";

export const metadata: Metadata = { title: "Elegir cuenta", robots: { index: false } };

export default async function CuentaPage() {
  if (!demoEnabled) redirect("/ingresar");
  const session = await auth();
  if (session?.user) redirect("/mi-fedegan");

  return (
    <Container className="py-14">
      <AccountPicker />
    </Container>
  );
}
