import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowUpRight, FileCheck2, GraduationCap, Mail, Newspaper, ShieldCheck, Tv } from "lucide-react";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { appsForRoles } from "@/lib/access";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Editorial";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Spotlight } from "@/components/design/Spotlight";

export const metadata: Metadata = { title: "Mi FEDEGÁN" };

const icons = { shield: ShieldCheck, newspaper: Newspaper };
const ACCENTS = ["216,181,88", "92,205,134", "230,160,108", "112,214,196"];
const acc = (i: number) => ({ ["--acc-rgb" as string]: ACCENTS[i % ACCENTS.length] }) as CSSProperties;

const quick = [
  { icon: Newspaper, label: "Noticias", href: "/noticias" },
  { icon: FileCheck2, label: "Servicios", href: "/servicios" },
  { icon: GraduationCap, label: "Escuela Virtual", href: "/escuela-virtual" },
  { icon: Tv, label: "TVGAN", href: "/tvgan" },
  { icon: Mail, label: "Contacto", href: "/contacto" },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function MiFedeganPage() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");

  const roles = session.user.roles;
  const apps = appsForRoles(roles);
  const name = session.user.name ?? "Bienvenido";
  const first = name.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Mi FEDEGÁN"
        title={`Hola, ${first}`}
        description="Estas son las aplicaciones habilitadas para su perfil."
        image="/locales/programas.jpg"
        imagePos="62% 50%"
        breadcrumbs={[{ label: "Mi FEDEGÁN" }]}
      />

      <Container className="py-6 sm:py-8">
        <div className="mx-card flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--acc-rgb),0.6)] bg-[linear-gradient(145deg,rgba(var(--acc-rgb),0.45),rgba(var(--acc-rgb),0.1))] font-[var(--font-display)] text-xl font-bold text-[var(--text)]">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{name}</p>
              {demoEnabled && !entraConfigured && <span className="mx-kicker">Sesión de demostración</span>}
            </div>
            {session.user.email && <p className="truncate text-sm text-[var(--text-muted)]">{session.user.email}</p>}
            <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Su perfil">
              {roles.length ? (
                roles.map((r) => (
                  <li key={r} className="rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{r}</li>
                ))
              ) : (
                <li className="rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Sin roles asignados</li>
              )}
            </ul>
          </div>
          <SignOutButton />
        </div>
      </Container>

      <Section title="Sus aplicaciones">
        {apps.length === 0 ? (
          <p className="mx-card text-[var(--text-muted)]">Su cuenta todavía no tiene aplicaciones habilitadas. Solicite acceso al área de Tecnología.</p>
        ) : (
          <Spotlight as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((a, i) => {
              const Icon = icons[a.icon as keyof typeof icons] ?? ShieldCheck;
              return (
                <li key={a.id}>
                  <Link href={a.href} target={a.external ? "_blank" : undefined} rel={a.external ? "noopener noreferrer" : undefined} className="mx-card group flex h-full flex-col gap-4" style={acc(i)}>
                    <span className="flex items-start justify-between">
                      <span className="mx-icon"><Icon size={22} strokeWidth={1.7} /></span>
                      <ArrowUpRight size={20} className="text-[var(--text-faint)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--acc-rgb))]" />
                    </span>
                    <div>
                      <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{a.nombre}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{a.descripcion}</p>
                    </div>
                    <span className="mt-auto text-xs font-bold uppercase tracking-[0.14em] text-[rgb(var(--acc-rgb))]">Abrir aplicación</span>
                  </Link>
                </li>
              );
            })}
          </Spotlight>
        )}
      </Section>

      <Section title="Accesos rápidos" tinted>
        <ul className="flex flex-wrap gap-3">
          {quick.map((q) => (
            <li key={q.href}>
              <Link href={q.href} className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-solid)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-lime-400)]">
                <q.icon size={17} className="text-[var(--fg-lime-400)]" /> {q.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
