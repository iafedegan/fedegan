import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2, Eye, EyeOff, Pencil, Plus, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getEditor } from "@/lib/cms/guard";
import { adminDb } from "@/lib/cms/client";
import { getEntity } from "@/lib/cms/entities";
import { deleteRecord, moveRecord, togglePublished } from "@/lib/cms/actions";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--fg-lime-500)] hover:text-[var(--fg-lime-400)] disabled:opacity-30";

export default async function EntityListPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { entity: key } = await params;
  const { ok, error } = await searchParams;
  const entity = getEntity(key);
  if (!entity) notFound();
  if (!(await getEditor())) redirect("/admin");

  const db = adminDb();
  let rows: Record<string, unknown>[] = [];
  if (db) {
    const { data } = await db.from(entity.table).select("*").order(entity.orderBy.column, { ascending: entity.orderBy.ascending });
    rows = (data ?? []) as Record<string, unknown>[];
  }

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title={entity.plural}
        description={entity.description}
        breadcrumbs={[{ label: "Administración", href: "/admin" }, { label: entity.plural }]}
        compact
      />
      <Container className="flex max-w-4xl flex-col gap-6 py-10 sm:py-14">
        {ok && (
          <p role="status" className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[rgba(216,181,88,0.1)] px-4 py-3 text-sm text-[var(--text)]">
            <CheckCircle2 size={18} className="text-[var(--fg-lime-400)]" /> {ok}. Los cambios ya se ven en el sitio.
          </p>
        )}
        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[#d64545] bg-[rgba(214,69,69,0.12)] px-4 py-3 text-sm text-[var(--text)]">
            <AlertCircle size={18} className="text-[#ff8a8a]" /> {error}
          </p>
        )}

        {!db ? (
          <ConfigNotice />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--text-muted)]">{rows.length} {rows.length === 1 ? "registro" : "registros"}</p>
              <Link
                href={`/admin/${entity.key}/nuevo`}
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)] transition-colors hover:bg-[var(--fg-lime-400)]"
              >
                <Plus size={16} /> Nuevo {entity.label}
              </Link>
            </div>

            {rows.length === 0 ? (
              <Card hover={false}>
                <p className="p-8 text-center text-[var(--text-muted)]">Todavía no hay registros. Cree el primero con el botón de arriba.</p>
              </Card>
            ) : (
              <ul className="flex flex-col gap-3">
                {rows.map((r, i) => {
                  const id = r.id as string;
                  const title = String(r[entity.titleField] ?? "");
                  const sub = entity.subtitleField ? String(r[entity.subtitleField] ?? "") : "";
                  const published = Boolean(r.published);
                  const hidden = { _entity: entity.key, _id: id };
                  return (
                    <li key={id}>
                      <Card hover={false}>
                        <div className="flex flex-wrap items-center gap-4 p-4 sm:px-6">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[var(--text)]">{title}</p>
                            <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                              {sub && <span className="truncate">{sub}</span>}
                              {!published && <Badge tone="neutral">Oculto</Badge>}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {entity.ordered && (
                              <>
                                <form action={moveRecord}>
                                  <input type="hidden" name="_entity" value={hidden._entity} />
                                  <input type="hidden" name="_id" value={hidden._id} />
                                  <input type="hidden" name="_dir" value="up" />
                                  <button type="submit" aria-label="Subir" title="Subir" disabled={i === 0} className={iconBtn}><ArrowUp size={16} /></button>
                                </form>
                                <form action={moveRecord}>
                                  <input type="hidden" name="_entity" value={hidden._entity} />
                                  <input type="hidden" name="_id" value={hidden._id} />
                                  <input type="hidden" name="_dir" value="down" />
                                  <button type="submit" aria-label="Bajar" title="Bajar" disabled={i === rows.length - 1} className={iconBtn}><ArrowDown size={16} /></button>
                                </form>
                              </>
                            )}
                            <form action={togglePublished}>
                              <input type="hidden" name="_entity" value={hidden._entity} />
                              <input type="hidden" name="_id" value={hidden._id} />
                              <button type="submit" aria-label={published ? "Ocultar del sitio" : "Publicar"} title={published ? "Ocultar del sitio" : "Publicar"} className={iconBtn}>
                                {published ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                            </form>
                            <Link href={`/admin/${entity.key}/${id}`} aria-label="Editar" title="Editar" className={iconBtn}><Pencil size={16} /></Link>
                            <form action={deleteRecord}>
                              <input type="hidden" name="_entity" value={hidden._entity} />
                              <input type="hidden" name="_id" value={hidden._id} />
                              <DeleteButton label={title} />
                            </form>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </Container>
    </>
  );
}
