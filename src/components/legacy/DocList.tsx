import type { LegacyBlock } from "@/content/legacy";
import { tarjetasDeTextos, type TarjetaDoc } from "@/lib/cms/documentos-tarjetas";
import { DocCard } from "./DocCard";

// Listas de documentos (Excel, PDF, Word…): se muestran como tarjetas con el tipo de archivo y botones de descarga,
// en lugar de una lista de enlaces. Si un «nombre — etiqueta» se repite (cuadro de salida e instructivo), van en la misma tarjeta.
// Las reglas de agrupación están en src/lib/cms/documentos-tarjetas.ts (así también las usa el constructor de páginas).

/** Devuelve las tarjetas si TODOS los elementos son enlaces a documentos; si no, null (se pinta la lista normal). */
export function tarjetasDeDocumentos(items: LegacyBlock[]): TarjetaDoc[] | null {
  return tarjetasDeTextos(items.map((it) => it.text ?? ""));
}

export function DocList({ tarjetas }: { tarjetas: TarjetaDoc[] }) {
  return (
    <ul className="doc-grid" role="list">
      {tarjetas.map((t, k) => (
        <DocCard key={k} titulo={t.titulo} detalle={t.detalle} docs={t.docs.map((d) => ({ url: d.url, etiqueta: d.etiqueta, clave: d.tipo.clave, sigla: d.tipo.sigla, nombre: d.tipo.nombre }))} />
      ))}
    </ul>
  );
}
