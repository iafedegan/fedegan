import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, ListChecks, Lock, ShieldCheck } from "lucide-react";
import { FormularioPublico } from "@/components/formularios/FormularioPublico";
import "@/components/formularios/formulario.css";
import { formularioPublico } from "@/lib/cms/formularios";
import { mapasDe } from "@/lib/cms/catalogos";
import { esPregunta } from "@/lib/cms/formulario-esquema";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await formularioPublico(slug);
  return { title: f?.title ?? "Formulario", description: f?.description || undefined, robots: { index: false } };
}

/** «Identificación de actividades y uso de IA» → la última palabra (o las dos últimas si es corta) va resaltada. */
function titulo(t: string) {
  const p = t.trim().split(/\s+/);
  const n = p.length > 3 ? (p[p.length - 1].length <= 3 ? 2 : 1) : 0;
  return n ? <>{p.slice(0, -n).join(" ")} <em>{p.slice(-n).join(" ")}</em></> : t;
}

export default async function FormularioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await formularioPublico(slug);
  if (!f || !f.published) notFound();
  const preguntas = f.published.campos.filter((c) => esPregunta(c.tipo)).length;
  const minutos = f.description.match(/(\d+)\s*min/i)?.[1];
  return (
    <div className="fp" style={{ background: "linear-gradient(180deg, #f4f8ef 0%, #fff 60%)" }}>
      <section className="fp-portada">
        <span className="fp-blob" style={{ width: 380, height: 380, left: "-6rem", top: "-6rem", background: "#4f9a2a" }} aria-hidden />
        <span className="fp-blob" style={{ width: 300, height: 300, right: "-4rem", top: "2rem", background: "#d8b558", animationDelay: "-5s" }} aria-hidden />
        <div className="fp-portada-in">
          <span className="fp-eyebrow"><i aria-hidden /> Formulario FEDEGÁN</span>
          <h1>{titulo(f.title)}</h1>
          {f.description && <p>{f.description}</p>}
          <div className="fp-meta">
            {minutos && <span><Clock size={15} /> {minutos} minutos</span>}
            <span><ListChecks size={15} /> {preguntas} {preguntas === 1 ? "pregunta" : "preguntas"}</span>
            <span><ShieldCheck size={15} /> Respuestas confidenciales</span>
          </div>
        </div>
      </section>
      <div className="fp-cuerpo">
        {f.status === "cerrado" ? (
          <div className="fp-seccion flex flex-col items-center gap-3 py-12 text-center">
            <Lock size={38} className="text-[#6b7d71]" aria-hidden />
            <p className="text-xl font-bold">Este formulario ya no recibe respuestas.</p>
          </div>
        ) : (
          <FormularioPublico slug={f.slug} esquema={f.published} mapas={mapasDe(f.published)} />
        )}
      </div>
    </div>
  );
}
