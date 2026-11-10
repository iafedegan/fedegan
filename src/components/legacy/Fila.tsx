import type { CSSProperties } from "react";
import type { LegacyBlock } from "@/content/legacy";
import { DIVISIONES } from "@/lib/cms/bloques";
import { imagenSegura } from "./comun";
import { LegacyContent } from "./LegacyContent";

// Una fila de la página: se divide en columnas (sobre 12) y cada columna es un contenedor, así los elementos de adentro
// se acomodan al ancho de SU columna (no al de la pantalla). Los nombres de clase van completos: Tailwind no ve los armados por partes.
const GRILLA: Record<string, string> = {
  "12": "",
  "6-6": "@3xl:grid-cols-[6fr_6fr]",
  "4-8": "@3xl:grid-cols-[4fr_8fr]",
  "8-4": "@3xl:grid-cols-[8fr_4fr]",
  "3-9": "@3xl:grid-cols-[3fr_9fr]",
  "9-3": "@3xl:grid-cols-[9fr_3fr]",
  "5-7": "@3xl:grid-cols-[5fr_7fr]",
  "7-5": "@3xl:grid-cols-[7fr_5fr]",
  "4-4-4": "@3xl:grid-cols-[4fr_4fr_4fr]",
  "3-6-3": "@3xl:grid-cols-[3fr_6fr_3fr]",
  "6-3-3": "@3xl:grid-cols-[6fr_3fr_3fr]",
  "3-3-6": "@3xl:grid-cols-[3fr_3fr_6fr]",
  "3-3-3-3": "@3xl:grid-cols-[3fr_3fr_3fr_3fr]",
  "2-8-2": "@3xl:grid-cols-[2fr_8fr_2fr]",
};
const FONDO: Record<string, string> = {
  ninguno: "",
  suave: "bg-[#f1f7ea]",
  color: "bg-[var(--fg-green-800)] text-white [--text:#fff] [--text-muted:rgba(255,255,255,.85)]",
  oscuro: "bg-[#10240f] text-white [--text:#fff] [--text-muted:rgba(255,255,255,.8)]",
  degradado: "bg-gradient-to-br from-[#2c6a14] via-[#4f9a2a] to-[#a6d86a] text-white [--text:#fff] [--text-muted:rgba(255,255,255,.88)]",
  imagen: "text-white [--text:#fff] [--text-muted:rgba(255,255,255,.88)]",
};
const ESPACIO: Record<string, string> = { ninguno: "", pequeno: "p-4 @md:p-6", medio: "p-6 @md:p-10", grande: "p-8 @md:p-16" };
const ALINEAR: Record<string, string> = { arriba: "items-start", centro: "items-center" };

const lista = (v: unknown): LegacyBlock[][] => (Array.isArray(v) ? v.map((c) => (Array.isArray(c) ? (c as LegacyBlock[]) : [])) : []);

export function Fila({ d, preview = false }: { d: Record<string, unknown>; preview?: boolean }) {
  const division = DIVISIONES.includes(d.division as never) ? String(d.division) : "6-6";
  const cols = lista(d.cols);
  const fondo = typeof d.fondo === "string" && d.fondo in FONDO ? d.fondo : "ninguno";
  const img = fondo === "imagen" ? imagenSegura(typeof d.imagen === "string" ? d.imagen : "") : "";
  const estilo: CSSProperties | undefined = fondo === "imagen"
    ? { backgroundImage: img ? `linear-gradient(rgba(16,36,15,.55), rgba(16,36,15,.55)), url("${img}")` : "linear-gradient(135deg, #10240f, #2c6a14)", backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;
  const espacio = ESPACIO[typeof d.espaciado === "string" && d.espaciado in ESPACIO ? d.espaciado : "medio"];
  const alinear = ALINEAR[d.alinear === "centro" ? "centro" : "arriba"];
  return (
    <div className={`@container my-6 rounded-[var(--radius-lg)] ${FONDO[fondo]} ${espacio}`} style={estilo}>
      <div className={`grid grid-cols-1 gap-x-8 gap-y-2 ${GRILLA[division]} ${alinear}`}>
        {cols.map((c, k) => (
          <div key={k} className="@container min-w-0">
            {c.length > 0 && <LegacyContent blocks={c} libre preview={preview} lead={false} />}
          </div>
        ))}
      </div>
    </div>
  );
}
