import { getEditor } from "@/lib/cms/guard";
import { respuestasDe, textoRespuesta } from "@/lib/cms/formularios";

const cel = (v: string) => {
  let s = v.replace(/"/g, '""');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita fórmulas al abrir en Excel
  return `"${s}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ clave: string }> }) {
  const ed = await getEditor();
  if (!ed) return new Response("No autorizado", { status: 403 });
  const { clave } = await params;
  const filas = await respuestasDe(clave);
  const preguntas = [...new Set(filas.flatMap((r) => r.answers.map((a) => a.e)))];
  const cuerpo = filas.map((r) => [r.created_at, ...preguntas.map((p) => textoRespuesta(r.answers.find((a) => a.e === p)?.v ?? ""))].map(cel).join(","));
  const csv = "﻿" + [["Recibida", ...preguntas].map(cel).join(","), ...cuerpo].join("\r\n");
  const archivo = clave.replace(/[^a-z0-9-]/g, "");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="formulario-${archivo}.csv"` } });
}
