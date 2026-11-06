import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeView, type HomeKind } from "@/components/home/HomeView";
import { getPublishedDesign } from "@/lib/design/store";
import { TEMPLATES } from "@/lib/design/regions";

// Vista previa de la portada de cada plantilla (la usa el editor de diseño): misma composición que tendría el inicio.
export const metadata: Metadata = { title: "Vista previa de la portada", robots: { index: false, follow: false } };

const KINDS = ["clasico", ...TEMPLATES.map((t) => t.id)];

export function generateStaticParams() {
  return KINDS.map((plantilla) => ({ plantilla }));
}

export default async function VistaPrevia({ params }: { params: Promise<{ plantilla: string }> }) {
  const { plantilla } = await params;
  if (!KINDS.includes(plantilla)) notFound();
  const design = await getPublishedDesign();
  return <HomeView kind={plantilla as HomeKind} design={design} />;
}
