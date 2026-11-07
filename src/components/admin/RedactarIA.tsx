"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Sparkles, Undo2, XCircle } from "lucide-react";
import { generarContenido } from "@/lib/cms/ia-actions";

export type OpcionIA = { id: "claude" | "gemini"; label: string };

// Panel para pedirle a la IA el contenido de la página. El resultado reemplaza el texto del editor,
// pero no se guarda hasta que el editor pulse «Guardar cambios»; se puede deshacer.
export function RedactarIA({
  opciones,
  guia,
  contexto,
  leer,
  escribir,
}: {
  opciones: OpcionIA[];
  guia: string;
  contexto: { titulo: () => string; nombre: () => string; ruta: string; seccion: string };
  leer: () => string;
  escribir: (texto: string) => void;
}) {
  const [proveedor, setProveedor] = useState<OpcionIA["id"] | "">(opciones[0]?.id ?? "");
  const [pedido, setPedido] = useState("");
  const [nota, setNota] = useState<{ ok: boolean; text: string } | null>(null);
  const [previo, setPrevio] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (opciones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c9d8bf] bg-[#f6faf2] p-4 text-sm text-[#5d6e65]">
        <p className="flex items-center gap-2 font-semibold text-[#11271d]"><Sparkles size={16} className="text-[#3d7a22]" /> Redactar con IA</p>
        <p className="mt-1">Para pedirle a Claude o Gemini que escriba la página, cargue una clave en <Link href="/admin/apis" className="font-semibold text-[#3d7a22] underline underline-offset-2">Conexiones</Link>.</p>
      </div>
    );
  }

  const generar = () => {
    if (!proveedor) return;
    setNota(null);
    start(async () => {
      const actual = leer();
      const r = await generarContenido({ proveedor, pedido, titulo: contexto.titulo(), nombre: contexto.nombre(), ruta: contexto.ruta, seccion: contexto.seccion, actual });
      if (!r.ok) {
        setNota({ ok: false, text: r.message });
        return;
      }
      setPrevio(actual);
      escribir(r.texto);
      setNota({ ok: true, text: `${r.aviso ? `${r.aviso} ` : ""}Listo. Revise el texto abajo y pulse «Publicar cambios» para que quede en el sitio.` });
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#c9d8bf] bg-[#f6faf2] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#11271d]"><Sparkles size={16} className="text-[#3d7a22]" /> Redactar con IA <span className="font-normal text-[#5d6e65]">· usa el texto actual como base</span></p>
        <select value={proveedor} onChange={(e) => setProveedor(e.target.value as OpcionIA["id"])} aria-label="Proveedor de IA" className="ad-input !w-auto !py-1.5 text-sm">
          {opciones.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
      <textarea
        value={pedido}
        onChange={(e) => setPedido(e.target.value)}
        rows={4}
        maxLength={4000}
        placeholder="Describa la página que quiere. Ej.: Página sobre el ciclo de vacunación contra aftosa: a quién va dirigida, fechas, documentos que debe tener el ganadero y a quién contactar."
        className="ad-input resize-y text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={generar} disabled={pending || pedido.trim().length < 8} className="ad-btn ad-btn-primary">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {pending ? "Redactando… (puede tardar un minuto)" : "Generar con IA"}
        </button>
        {previo !== null && !pending && (
          <button type="button" onClick={() => { escribir(previo); setPrevio(null); setNota(null); }} className="ad-btn ad-btn-ghost">
            <Undo2 size={16} /> Deshacer
          </button>
        )}
      </div>
      {nota && (
        <p role={nota.ok ? "status" : "alert"} className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${nota.ok ? "border-[#b9dcc7] bg-[#e5f3ea] text-[#14573a]" : "border-[#f0b5b5] bg-[#fdecec] text-[#7a1f1f]"}`}>
          {nota.ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />} {nota.text}
        </p>
      )}
      <details className="text-xs text-[#5d6e65]">
        <summary className="cursor-pointer font-semibold">Guía de estilo que sigue la IA</summary>
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 font-sans leading-relaxed">{guia}</pre>
      </details>
    </div>
  );
}
