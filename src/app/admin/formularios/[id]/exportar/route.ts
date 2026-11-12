import writeXlsxFile from "write-excel-file/node";
import { getEditor } from "@/lib/cms/guard";
import { formularioPorId, respuestasDe } from "@/lib/cms/formularios";
import { aCsv, tablasExportables } from "@/lib/cms/formulario-resumen";

// Descarga de las respuestas de un formulario: Excel (todas las hojas), CSV (una hoja) o JSON (todo, tal como se guardó).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ed = await getEditor();
  if (!ed) return new Response("No autorizado", { status: 403 });
  const { id } = await params;
  const f = await formularioPorId(id);
  if (!f) return new Response("No encontrado", { status: 404 });
  const url = new URL(req.url);
  const formato = url.searchParams.get("formato") ?? "xlsx";
  const respuestas = await respuestasDe(id);
  const esquema = f.published ?? f.schema;
  const nombre = `respuestas-${f.slug}-${new Date().toISOString().slice(0, 10)}`;
  const adjunto = (ext: string) => `attachment; filename="${nombre}.${ext}"`;

  if (formato === "json") {
    const cuerpo = {
      formulario: { titulo: f.title, direccion: `/formularios/${f.slug}`, version: f.version, exportado: new Date().toISOString() },
      preguntas: esquema.campos,
      respuestas: respuestas.map((r) => ({ codigo: r.id.slice(0, 8).toUpperCase(), fecha: r.created_at, version: r.version, respuestas: r.answers })),
    };
    return new Response(JSON.stringify(cuerpo, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": adjunto("json") } });
  }

  const tablas = tablasExportables(esquema, respuestas);
  if (formato === "csv") {
    const hoja = Math.min(Math.max(0, Number(url.searchParams.get("hoja") ?? 0) || 0), tablas.length - 1);
    const sufijo = hoja === 0 ? "" : `-${tablas[hoja].nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`;
    return new Response(aCsv(tablas[hoja]), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${nombre}${sufijo}.csv"` } });
  }

  // Excel: una hoja por tabla, con la cabecera en negrita y fija al desplazarse.
  const usados = new Set<string>();
  const hojas = tablas.map((t) => {
    let n = t.nombre.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Hoja";
    for (let i = 2; usados.has(n); i++) n = `${n.slice(0, 28)} ${i}`;
    usados.add(n);
    return {
      sheet: n,
      stickyRowsCount: 1,
      columns: t.cabecera.map((c) => ({ width: Math.min(60, Math.max(12, c.length + 4)) })),
      data: [
        t.cabecera.map((c) => ({ value: c, fontWeight: "bold" as const, backgroundColor: "#E5F3DA" })),
        ...t.filas.map((fila) => fila.map((v) => ({ value: v, wrap: true }))),
      ],
    };
  });
  const buffer = await writeXlsxFile(hojas).toBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": adjunto("xlsx") },
  });
}
