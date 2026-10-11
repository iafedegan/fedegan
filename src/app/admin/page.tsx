import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { getEditor } from "@/lib/cms/guard";
import { adminDb } from "@/lib/cms/client";
import { entities } from "@/lib/cms/entities";

export const metadata: Metadata = { title: "Administración del portal", robots: { index: false } };

const ACCENTS = ["216,181,88", "92,205,134", "230,160,108", "112,214,196"];

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");
  const editor = await getEditor();
  const db = adminDb();

  const counts = new Map<string, number>();
  let recent: { id: number; at: string; actor: string; action: string; entity: string; summary: string | null }[] = [];
  if (editor && db) {
    await Promise.all(
      entities.map(async (e) => {
        const { count } = await db.from(e.table).select("id", { count: "exact", head: true });
        counts.set(e.key, count ?? 0);
      }),
    );
    const { data } = await db.from("audit_log").select("*").order("at", { ascending: false }).limit(8);
    recent = (data ?? []) as typeof recent;
  }

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Gestor de contenido"
        description={editor ? "Edite el contenido del portal. Los cambios se publican al guardar." : undefined}
        breadcrumbs={[{ label: "Mi FEDEGÁN", href: "/mi-fedegan" }, { label: "Administración" }]}
        compact
      />
      <Container className="flex flex-col gap-8 py-10 sm:py-14">
        {!editor ? (
          <div className="max-w-2xl">
            <Card hover={false}>
              <div className="flex flex-col items-start gap-4 p-8 sm:p-10">
                <ShieldAlert size={24} className="text-[var(--fg-lime-400)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">Sin permiso para esta aplicación</h2>
                <p className="leading-relaxed text-[var(--text-muted)]">
                  Su perfil no incluye la administración del portal. Solicite el rol correspondiente al área de Tecnología.
                </p>
                <Button href="/mi-fedegan" variant="secondary">Volver a mis aplicaciones</Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {!db && <ConfigNotice />}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((e, i) => (
                <Link key={e.key} href={`/admin/${e.key}`} className="group block h-full">
                  <Card accent={ACCENTS[i % ACCENTS.length]}>
                    <div className="flex flex-1 flex-col gap-2 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{e.plural}</h2>
                        {db && <span className="rounded-full bg-[rgba(var(--acc-rgb),0.16)] px-2.5 py-0.5 text-xs font-bold text-[rgb(var(--acc-rgb))]">{counts.get(e.key) ?? 0}</span>}
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{e.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
                        Editar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}

              <a href="https://contexto-olive.vercel.app/panel" target="_blank" rel="noreferrer" className="group block h-full">
                <Card accent="190,222,203">
                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Noticias</h2>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      Las noticias se editan en el panel de CONtexto Ganadero y llegan solas al portal.
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
                      Abrir CONtexto <ExternalLink size={14} />
                    </span>
                  </div>
                </Card>
              </a>
            </div>

            {recent.length > 0 && (
              <section>
                <h2 className="mb-4 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Actividad reciente</h2>
                <Card hover={false}>
                  <ul className="divide-y divide-[var(--border)]">
                    {recent.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                        <span className="text-[var(--text)]">
                          <strong className="font-semibold capitalize">{r.action}</strong> · {r.entity}
                          {r.summary ? ` · ${r.summary}` : ""}
                        </span>
                        <span className="text-xs text-[var(--text-faint)]">
                          {r.actor} · {new Date(r.at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}
          </>
        )}
      </Container>
    </>
  );
}
