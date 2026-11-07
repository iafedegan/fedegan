"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Vistas previas hechas por el propio portal (sin visores de terceros): Excel como tabla y Word como texto con formato.
// El archivo llega por /api/documentos/ver, que lo entrega con su tipo correcto desde el mismo sitio.

const FILAS = 400;
const COLS = 40;

type Hoja = { nombre: string; filas: (string | number | boolean | Date | null)[][] };

function celda(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toLocaleDateString("es-CO", { timeZone: "UTC" });
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toLocaleString("es-CO", { maximumFractionDigits: 4 });
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
}

export function VistaExcel({ src }: { src: string }) {
  const [hojas, setHojas] = useState<Hoja[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.status === 413 ? "El archivo es demasiado pesado para la vista previa." : "No se pudo obtener el archivo.");
        const buf = await res.arrayBuffer();
        const { default: leer } = await import("read-excel-file/browser");
        const libro = await leer(buf);
        if (vivo) setHojas(libro.map((h) => ({ nombre: h.sheet, filas: h.data as Hoja["filas"] })));
      } catch (e) {
        if (vivo) setError(e instanceof Error && e.message.startsWith("El archivo") ? e.message : "No se pudo mostrar este Excel. Descárguelo para abrirlo.");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [src]);

  if (error) return <p className="doc-nada">{error}</p>;
  if (!hojas) return <span className="doc-cargando"><Loader2 size={20} className="animate-spin" aria-hidden /> Leyendo el Excel…</span>;
  const hoja = hojas[Math.min(activa, hojas.length - 1)];
  const filas = hoja.filas.slice(0, FILAS);
  const ancho = Math.min(COLS, Math.max(0, ...filas.map((f) => f.length)));
  return (
    <div className="doc-excel">
      {hojas.length > 1 && (
        <div className="doc-sheets" role="tablist" aria-label="Hojas del libro">
          {hojas.map((h, n) => (
            <button key={n} type="button" role="tab" aria-selected={n === activa} className={n === activa ? "on" : ""} onClick={() => setActiva(n)}>{h.nombre}</button>
          ))}
        </div>
      )}
      <div className="doc-excel-scroll" tabIndex={0}>
        {filas.length === 0 ? (
          <p className="doc-nada">Esta hoja está vacía.</p>
        ) : (
          <table>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <th scope="row" aria-hidden>{i + 1}</th>
                  {Array.from({ length: ancho }, (_, c) => {
                    const t = celda(f[c]);
                    return <td key={c} className={typeof f[c] === "number" ? "num" : undefined}>{t}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {(hoja.filas.length > FILAS || ancho >= COLS) && <p className="doc-nota">Se muestran las primeras {Math.min(FILAS, hoja.filas.length)} filas y {ancho} columnas. Descargue el archivo para ver todo.</p>}
    </div>
  );
}

// Deja solo lo que un documento de Word necesita: se quitan scripts, controladores de eventos y enlaces que no sean http(s) o correo.
function limpiar(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed, link, meta, form").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase();
      if (n.startsWith("on") || n === "style" || n === "srcdoc") el.removeAttribute(a.name);
      else if ((n === "href" || n === "src") && !/^(https?:|mailto:|data:image\/(png|jpe?g|gif|webp);base64,|#)/i.test(a.value.trim())) el.removeAttribute(a.name);
    }
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
  return doc.body.innerHTML;
}

export function VistaWord({ src }: { src: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error("No se pudo obtener el archivo.");
        const arrayBuffer = await res.arrayBuffer();
        const mammoth = await import("mammoth/mammoth.browser");
        const r = await (mammoth.default ?? mammoth).convertToHtml({ arrayBuffer });
        if (vivo) setHtml(limpiar(r.value));
      } catch {
        if (vivo) setError("No se pudo mostrar este documento de Word. Descárguelo para abrirlo.");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [src]);

  if (error) return <p className="doc-nada">{error}</p>;
  if (html === null) return <span className="doc-cargando"><Loader2 size={20} className="animate-spin" aria-hidden /> Leyendo el documento…</span>;
  return <article className="doc-word" dangerouslySetInnerHTML={{ __html: html || "<p>Este documento no tiene texto para mostrar.</p>" }} />;
}
