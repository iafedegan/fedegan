import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { publications } from "@/content/site";

export const metadata: Metadata = { title: "Publicaciones" };

export default function PublicacionesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Publicaciones"
        description="Informes, manuales y boletines institucionales del sector ganadero."
        breadcrumbs={[{ label: "Publicaciones" }]}
      />
      <Container className="py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {publications.map((p) => (
          <Card key={p.slug} className="!flex-row items-stretch">
            <div className="w-24 sm:w-28 shrink-0 bg-[var(--fg-green-700)] flex items-center justify-center">
              <FileText className="text-[var(--fg-lime-400)]" size={30} />
            </div>
            <div className="p-5 flex flex-col gap-2 flex-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--fg-green-600)]">{p.type}</span>
              <h3 className="font-bold text-[var(--text)] leading-snug">{p.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{p.dek}</p>
              <Link href={`/publicaciones/${p.slug}`} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-green-700)]">
                <Download size={14} /> Ver publicación
              </Link>
            </div>
          </Card>
        ))}
      </Container>
    </>
  );
}
