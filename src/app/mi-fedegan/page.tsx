import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileCheck2, GraduationCap, Mail, Newspaper, Tv } from "lucide-react";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { appsForRoles } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { WaveCard } from "@/components/ui/WaveCard";

export const metadata: Metadata = { title: "Mi FEDEGÁN" };


const quick = [
  { icon: Newspaper, label: "Noticias", href: "/noticias" },
  { icon: FileCheck2, label: "Servicios", href: "/servicios" },
  { icon: GraduationCap, label: "Escuela Virtual", href: "/escuela-virtual" },
  { icon: Tv, label: "TVGAN", href: "/tvgan" },
  { icon: Mail, label: "Contacto", href: "/contacto" },
];

const initials = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const pill = "rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]";

export default async function MiFedeganPage() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");

  const roles = session.user.roles;
  const apps = appsForRoles(roles);
  const name = session.user.name ?? "Bienvenido";
  // Las cuentas de equipo («Equipo de Tecnología») se saludan completas; las personales, por su nombre.
  const greeting = /^equipo\b/i.test(name) ? name : name.split(" ")[0];

  return (
    <>
      <PageHeader compact title={`Hola, ${greeting}`} breadcrumbs={[{ label: "Mi FEDEGÁN" }]} />

      <Container className="grid items-start gap-6 py-6 sm:py-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
        <aside className="mx-card flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--acc-rgb),0.6)] bg-[linear-gradient(145deg,rgba(var(--acc-rgb),0.45),rgba(var(--acc-rgb),0.1))] font-[var(--font-display)] text-lg font-bold text-[var(--text)]">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-[var(--font-display)] text-lg font-bold leading-tight text-[var(--text)]">{name}</p>
              {session.user.email && <p className="truncate text-xs text-[var(--text-muted)]">{session.user.email}</p>}
            </div>
          </div>
          {demoEnabled && !entraConfigured && <span className="mx-kicker self-start">Sesión de demostración</span>}
          <div>
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Su perfil</p>
            <ul className="flex flex-wrap gap-1.5">
              {roles.length ? roles.map((r) => <li key={r} className={pill}>{r}</li>) : <li className={pill}>Sin roles asignados</li>}
            </ul>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="apps-title">
            <h2 id="apps-title" className="mb-4 font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Sus aplicaciones</h2>
            {apps.length === 0 ? (
              <p className="mx-card text-[var(--text-muted)]">Su cuenta todavía no tiene aplicaciones habilitadas. Solicite acceso al área de Tecnología.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2">
                {apps.map((a, i) => (
                  <li key={a.id}>
                    <WaveCard href={a.href} external={a.external} accent={(["oro", "esmeralda", "terracota", "turquesa"] as const)[i % 4]} icon={a.icon === "newspaper" ? "libro" : "porton"} title={a.nombre} text={a.descripcion} cta="Abrir aplicación" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="quick-title">
            <h2 id="quick-title" className="mb-4 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Accesos rápidos</h2>
            <ul className="flex flex-wrap gap-2.5">
              {quick.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-solid)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-lime-400)]">
                    <q.icon size={16} className="text-[var(--fg-lime-400)]" /> {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
