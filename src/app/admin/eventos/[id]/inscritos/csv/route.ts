import { getEditor } from "@/lib/cms/guard";
import { inscritosDe } from "@/lib/cms/inscripciones";

const cel = (v: string | null) => {
  let s = (v ?? "").replace(/"/g, '""');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita fórmulas al abrir en Excel
  return `"${s}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ed = await getEditor();
  if (!ed) return new Response("No autorizado", { status: 403 });
  const { id } = await params;
  const filas = await inscritosDe(id);
  const cab = ["Código", "Nombre", "Correo", "Celular", "Documento", "Empresa", "Inscrito", "Asistió"];
  const cuerpo = filas.map((i) => [i.code, i.name, i.email, i.phone, i.document, i.organization, i.created_at, i.checked_in_at ?? ""].map((v) => cel(v)).join(","));
  const csv = "﻿" + [cab.map((c) => cel(c)).join(","), ...cuerpo].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscritos-${id}.csv"` } });
}
