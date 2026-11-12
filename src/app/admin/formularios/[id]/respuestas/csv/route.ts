import { getEditor } from "@/lib/cms/guard";
import { formularioPorId, respuestasDe } from "@/lib/cms/formularios";

const cel = (v: string) => {
  let s = v.replace(/"/g, '""');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita fórmulas al abrir en Excel
  return `"${s}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ed = await getEditor();
  if (!ed) return new Response("No autorizado", { status: 403 });
  const { id } = await params;
  const f = await formularioPorId(id);
  if (!f) return new Response("No encontrado", { status: 404 });
  const filas = await respuestasDe(id);
  // Columnas: las preguntas actuales y, al final, las de versiones anteriores que ya no están (se agrupan por id).
  const columnas = new Map<string, string>(f.schema.campos.map((c) => [c.id, c.etiqueta]));
  for (const r of filas) for (const a of r.answers) if (!columnas.has(a.id)) columnas.set(a.id, a.e);
  const ids = [...columnas.keys()];
  const cab = ["Fecha", "Versión", ...ids.map((k) => columnas.get(k) ?? k)];
  const cuerpo = filas.map((r) => {
    const por = new Map(r.answers.map((a) => [a.id, Array.isArray(a.v) ? a.v.join(", ") : a.v]));
    return [r.created_at, String(r.version), ...ids.map((k) => por.get(k) ?? "")].map(cel).join(",");
  });
  const csv = "﻿" + [cab.map(cel).join(","), ...cuerpo].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="respuestas-${f.slug}.csv"` } });
}
