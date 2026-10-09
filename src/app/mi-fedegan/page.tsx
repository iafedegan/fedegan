import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Newspaper, ShieldCheck } from "lucide-react";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { appsForRoles } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/components/layout/SignOutButton";

export const metadata: Metadata = { title: "Mi FEDEGÁN" };

const icons = { shield: ShieldCheck, newspaper: Newspaper };

export default async function MiFedeganPage() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");

  const roles = session.user.roles;
  const apps = appsForRoles(roles);

  return (
    <>
      <PageHeader
        eyebrow="Mi FEDEGÁN"
        title={`Hola, ${session.user.name?.split(" ")[0] ?? "bienvenido"}`}
        description="Estas son las aplicaciones habilitadas para su perfil."
        breadcrumbs={[{ label: "Mi FEDEGÁN" }]}
        compact
      />
      <Container className="flex flex-col gap-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {demoEnabled && !entraConfigured && <Badge tone="lime">Sesión de demostración</Badge>}
          <span className="text-sm text-[var(--text-muted)]">Su perfil:</span>
          {roles.length ? roles.map((r) => <Badge key={r} tone="neutral">{r}</Badge>) : <Badge tone="neutral">Sin roles asignados</Badge>}
          <div className="ml-auto"><SignOutButton /></div>
        </div>

        {apps.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8 text-[var(--text-muted)]">
            Su cuenta todavía no tiene aplicaciones habilitadas. Solicite acceso al área de Tecnología.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((a) => {
              const Icon = icons[a.icon];
              return (
                <Link key={a.id} href={a.href} target={a.external ? "_blank" : undefined} className="group block h-full">
                  <Card>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h2 className="flex items-center gap-1.5 font-[var(--font-display)] text-lg font-bold text-[var(--text)]">
                        {a.nombre}
                        <ArrowUpRight size={15} className="text-[var(--text-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </h2>
                      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{a.descripcion}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
