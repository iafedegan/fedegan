import { Download, Headphones } from "lucide-react";
import type { LegacyBlock } from "@/content/legacy";

// Listas de documentos (Excel, PDF, Word…): se muestran como tarjetas con el tipo de archivo y botones de descarga,
// en lugar de una lista de enlaces. Si un «nombre — etiqueta» se repite (cuadro de salida e instructivo), van en la misma tarjeta.

const ENLACE = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*$/;
const EXT = /\.(pdf|xlsx?|xlsm|docx?|pptx?|zip|rar|csv|mp3|m4a)(?:$|[?#])/i;

type Tipo = { clave: string; sigla: string; nombre: string };
const TIPOS: Record<string, Tipo> = {
  pdf: { clave: "pdf", sigla: "PDF", nombre: "PDF" },
  xls: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  xlsx: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  xlsm: { clave: "xls", sigla: "XLS", nombre: "Excel" },
  csv: { clave: "xls", sigla: "CSV", nombre: "CSV" },
  doc: { clave: "doc", sigla: "DOC", nombre: "Word" },
  docx: { clave: "doc", sigla: "DOC", nombre: "Word" },
  ppt: { clave: "ppt", sigla: "PPT", nombre: "PowerPoint" },
  pptx: { clave: "ppt", sigla: "PPT", nombre: "PowerPoint" },
  zip: { clave: "zip", sigla: "ZIP", nombre: "ZIP" },
  rar: { clave: "zip", sigla: "RAR", nombre: "RAR" },
  mp3: { clave: "mp3", sigla: "MP3", nombre: "Audio" },
  m4a: { clave: "mp3", sigla: "M4A", nombre: "Audio" },
};

type Doc = { nombre: string; etiqueta: string; url: string; tipo: Tipo };
type Tarjeta = { titulo: string; docs: Doc[] };

function leer(texto: string): Doc | null {
  const m = ENLACE.exec(texto.trim());
  if (!m) return null;
  const url = m[2];
  const ext = EXT.exec(new URL(url).pathname)?.[1]?.toLowerCase();
  if (!ext) return null;
  const tipo = TIPOS[ext];
  // «Nombre — Etiqueta (Tipo)»  /  «Nombre (Tipo)»
  const sinTipo = m[1].replace(/\s*\((?:Excel|PDF|Word|PowerPoint|CSV|ZIP|RAR|audio|Audio)\)\s*$/i, "").trim();
  const [nombre, ...resto] = sinTipo.split(" — ");
  return { nombre: nombre.trim(), etiqueta: resto.join(" — ").trim(), url, tipo };
}

/** Devuelve las tarjetas si TODOS los elementos son enlaces a documentos; si no, null (se pinta la lista normal). */
export function tarjetasDeDocumentos(items: LegacyBlock[]): Tarjeta[] | null {
  if (items.length < 2) return null;
  const docs: Doc[] = [];
  for (const it of items) {
    let d: Doc | null = null;
    try {
      d = leer(it.text ?? "");
    } catch {
      d = null;
    }
    if (!d) return null;
    docs.push(d);
  }
  const out: Tarjeta[] = [];
  for (const d of docs) {
    const prev = out[out.length - 1];
    if (prev && prev.titulo === d.nombre && !prev.docs.some((x) => x.url === d.url)) prev.docs.push(d);
    else out.push({ titulo: d.nombre, docs: [d] });
  }
  return out;
}

export function DocList({ tarjetas }: { tarjetas: Tarjeta[] }) {
  return (
    <ul className="doc-grid" role="list">
      {tarjetas.map((t, k) => {
        const tipo = t.docs[0].tipo;
        return (
          <li key={k} className="doc-card" data-tipo={tipo.clave}>
            <span className="doc-ico" aria-hidden>{tipo.sigla}</span>
            <div className="doc-body">
              <strong className="doc-title">{t.titulo}</strong>
              <div className="doc-acts">
                {t.docs.map((d, n) => (
                  <a key={n} href={d.url} target="_blank" rel="noopener noreferrer" className="doc-btn" data-tipo={d.tipo.clave}>
                    {d.tipo.clave === "mp3" ? <Headphones size={14} aria-hidden /> : <Download size={14} aria-hidden />}
                    {d.etiqueta ? `${d.etiqueta} · ${d.tipo.nombre}` : `Descargar ${d.tipo.nombre}`}
                  </a>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
