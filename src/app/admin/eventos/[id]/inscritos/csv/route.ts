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
  // Las preguntas que el equipo añadió al formulario (y que no son las columnas de siempre) van como columnas extra.
  const fijas = new Set(["Celular", "Documento", "Empresa o gremio"]);
  const extra = [...new Set(filas.flatMap((i) => (i.answers ?? []).map((a) => a.e)))].filter((e) => e && !fijas.has(e));
  const txt = (i: (typeof filas)[number], e: string) => {
    const v = (i.answers ?? []).find((a) => a.e === e)?.v ?? "";
    return Array.isArray(v) ? v.join(", ") : v;
  };
  const cab = ["Código", "Nombre", "Correo", "Celular", "Documento", "Empresa", "Inscrito", "Asistió", ...extra];
  const cuerpo = filas.map((i) => [i.code, i.name, i.email, i.phone, i.document, i.organization, i.created_at, i.checked_in_at ?? "", ...extra.map((e) => txt(i, e))].map((v) => cel(v)).join(","));
  const csv = "\ufeff" + [cab.map((c) => cel(c)).join(","), ...cuerpo].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscritos-${id}.csv"` } });
}
