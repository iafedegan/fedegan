import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { RecordForm } from "@/components/admin/RecordForm";
import { getEditor } from "@/lib/cms/guard";
import { adminDb } from "@/lib/cms/client";
import { getEntity } from "@/lib/cms/entities";

export const metadata: Metadata = { title: "Editar contenido", robots: { index: false } };

export default async function EntityEditPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity: key, id } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();
  if (!(await getEditor())) redirect("/admin");

  const db = adminDb();
  let record: Record<string, unknown> | null = null;
  if (db && id !== "nuevo") {
    const { data } = await db.from(entity.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    record = data as Record<string, unknown>;
  }
  const creating = id === "nuevo";

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title={creating ? `Nuevo ${entity.label}` : `Editar ${entity.label}`}
        breadcrumbs={[{ label: "Administración", href: "/admin" }, { label: entity.plural, href: `/admin/${entity.key}` }, { label: creating ? "Nuevo" : "Editar" }]}
        compact
      />
      <Container className="max-w-2xl py-10 sm:py-14">
        {!db ? (
          <ConfigNotice />
        ) : (
          <Card hover={false}>
            <div className="p-6 sm:p-8">
              <RecordForm entity={entity} record={record} />
            </div>
          </Card>
        )}
      </Container>
    </>
  );
}
