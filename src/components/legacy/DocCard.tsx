"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, Headphones, Loader2, X } from "lucide-react";
import { VistaExcel, VistaWord } from "./VistaDocumento";

export type DocVista = { url: string; etiqueta: string; clave: string; sigla: string; nombre: string };

// Cómo se muestra cada archivo dentro del portal. El archivo pasa por /api/documentos/ver, que lo entrega con su tipo correcto
// (los del sitio anterior se sirven como «descarga»). PDF: visor del navegador; Excel y Word: los lee el propio portal.
type Vista = { tipo: "pdf" | "excel" | "word" | "audio" | "ninguna"; src: string };
function vistaDe(d: DocVista): Vista {
  const ext = (() => {
    try {
      return decodeURIComponent(new URL(d.url).pathname).split(".").pop()?.toLowerCase() ?? "";
    } catch {
      return "";
    }
  })();
  const via = `/api/documentos/ver?u=${encodeURIComponent(d.url)}`;
  if (d.clave === "mp3") return { tipo: "audio", src: d.url };
  if (ext === "pdf") return { tipo: "pdf", src: via };
  if (ext === "xlsx") return { tipo: "excel", src: via };
  if (ext === "docx") return { tipo: "word", src: via };
  return { tipo: "ninguna", src: "" };
}

const nombreBtn = (d: DocVista) => (d.etiqueta ? `${d.etiqueta} · ${d.nombre}` : d.nombre);

// Tarjeta de documento: el nombre y «Vista previa» abren una ventana con el archivo (sin salir de la página) y los botones descargan.
export function DocCard({ titulo, docs, detalle }: { titulo: string; docs: DocVista[]; detalle?: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [cargando, setCargando] = useState(true);
  const tipo = docs[0];
  const d = docs[Math.min(activo, docs.length - 1)];
  const vista = vistaDe(d);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto && !el.open) el.showModal();
    if (!abierto && el.open) el.close();
  }, [abierto]);

  const abrir = (k: number) => {
    setActivo(k);
    setCargando(true);
    setAbierto(true);
  };

  return (
    <li className="doc-card" data-tipo={tipo.clave}>
      <button type="button" className="doc-ico" onClick={() => abrir(0)} aria-label={`Ver ${titulo}`} title="Vista previa">
        {tipo.sigla}
        <Eye size={14} aria-hidden className="doc-ico-eye" />
      </button>
      <div className="doc-body">
        <button type="button" className="doc-title" onClick={() => abrir(0)}>{titulo}</button>
        {detalle && <p className="doc-det">{detalle}</p>}
        <div className="doc-acts">
          <button type="button" className="doc-btn doc-view" onClick={() => abrir(0)}>
            <Eye size={14} aria-hidden /> Vista previa
          </button>
          {docs.map((x, n) => (
            <a key={n} href={x.url} target="_blank" rel="noopener noreferrer" className="doc-btn" data-tipo={x.clave} download>
              {x.clave === "mp3" ? <Headphones size={14} aria-hidden /> : <Download size={14} aria-hidden />}
              {x.etiqueta ? `${x.etiqueta} · ${x.nombre}` : `Descargar ${x.nombre}`}
            </a>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogo}
        className="doc-modal"
        aria-label={`Vista previa de ${titulo}`}
        onClose={() => setAbierto(false)}
        onClick={(e) => e.target === dialogo.current && setAbierto(false)}
      >
        {abierto && (
          <div className="doc-modal-in">
            <header className="doc-modal-head">
              <div className="doc-modal-tit">
                <span className="doc-ico doc-ico-sm" data-tipo={d.clave} aria-hidden>{d.sigla}</span>
                <strong>{titulo}</strong>
              </div>
              <div className="doc-modal-act">
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="doc-btn" data-tipo={d.clave} download>
                  <Download size={14} aria-hidden /> Descargar
                </a>
                <button type="button" className="doc-close" onClick={() => setAbierto(false)} aria-label="Cerrar la vista previa"><X size={18} aria-hidden /></button>
              </div>
            </header>
            {docs.length > 1 && (
              <div className="doc-tabs" role="tablist">
                {docs.map((x, n) => (
                  <button key={n} type="button" role="tab" aria-selected={n === activo} className={`doc-tab ${n === activo ? "on" : ""}`} onClick={() => { setActivo(n); setCargando(true); }}>
                    {nombreBtn(x)}
                  </button>
                ))}
              </div>
            )}
            <div className="doc-stage">
              {vista.tipo === "pdf" && (
                <>
                  {cargando && <span className="doc-cargando"><Loader2 size={20} className="animate-spin" aria-hidden /> Cargando la vista previa…</span>}
                  <iframe key={vista.src} src={vista.src} title={`Vista previa: ${titulo}`} onLoad={() => setCargando(false)} />
                </>
              )}
              {vista.tipo === "excel" && <VistaExcel key={vista.src} src={vista.src} />}
              {vista.tipo === "word" && <VistaWord key={vista.src} src={vista.src} />}
              {vista.tipo === "audio" && (
                <div className="doc-audio">
                  <Headphones size={34} aria-hidden />
                  <audio controls autoPlay src={vista.src} preload="auto" />
                </div>
              )}
              {vista.tipo === "ninguna" && (
                <p className="doc-nada">Este archivo ({d.nombre}) no tiene vista previa. Descárguelo para abrirlo.</p>
              )}
            </div>
            {vista.tipo === "pdf" && <p className="doc-nota">¿No se ve? Use «Descargar» para abrirlo en su equipo.</p>}
          </div>
        )}
      </dialog>
    </li>
  );
}
