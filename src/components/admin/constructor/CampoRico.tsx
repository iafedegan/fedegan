"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Bold, Link2, Link2Off } from "lucide-react";
import { ENLACE_TEXTO, normalizarUrl } from "@/lib/cms/bloques";
import { esc, escAttr, mdAHtml } from "./rico";

// Campo de texto con negrita y enlaces que se ven como son, sin símbolos: el editor trabaja sobre el texto ya formateado
// y por debajo lo guarda como el resto de la página (**negrita** y [palabras](enlace)). Solo admite esas dos cosas.

/** Lo que hay en el campo → texto guardado. Ignora cualquier formato que no sea negrita o enlace. */
export function nodoAMd(raiz: Node, enEnlace = false): string {
  let out = "";
  raiz.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += (n.textContent ?? "").replace(/ /g, " ");
      return;
    }
    if (!(n instanceof HTMLElement)) return;
    switch (n.tagName) {
      case "BR":
        out += "\n";
        return;
      case "A": {
        const href = n.getAttribute("href") ?? "";
        const etiqueta = nodoAMd(n, true).replace(/[[\]]/g, "");
        out += ENLACE_TEXTO.test(href) && etiqueta ? `[${etiqueta}](${href})` : etiqueta;
        return;
      }
      case "DIV":
      case "P": {
        const dentro = nodoAMd(n, enEnlace);
        if (out && !out.endsWith("\n")) out += "\n";
        out += dentro;
        return;
      }
      default: {
        const dentro = nodoAMd(n, enEnlace);
        const negrita = n.tagName === "B" || n.tagName === "STRONG" || /^(bold|[6-9]00)$/.test(n.style.fontWeight);
        out += negrita && !enEnlace && dentro.trim() ? `**${dentro}**` : dentro;
      }
    }
  });
  return out;
}

const enlaceBajo = (campo: HTMLElement, nodo: Node | null): HTMLAnchorElement | null => {
  for (let n: Node | null = nodo; n && n !== campo; n = n.parentNode) if (n instanceof HTMLAnchorElement) return n;
  return null;
};

type Props = {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  /** Permite saltos de línea (Enter). Sin esto es un texto de una línea. */
  multilinea?: boolean;
  placeholder?: string;
  /** «fija»: la barra de formato va siempre arriba; «flotante»: aparece mientras se escribe en el campo. */
  barra?: "fija" | "flotante";
};

export function CampoRico({ etiqueta, valor, onCambio, multilinea = false, placeholder, barra = "fija" }: Props) {
  const idEtiqueta = useId();
  const campo = useRef<HTMLDivElement>(null);
  const ultimo = useRef(valor);
  // El contenido del campo lo maneja el navegador mientras se escribe; React solo pone el inicial y los cambios que vengan de fuera.
  const [inicial] = useState(() => mdAHtml(valor));
  const [negrita, setNegrita] = useState(false);
  const [enEnlace, setEnEnlace] = useState(false);
  const [enlace, setEnlace] = useState<{ texto: string; url: string; rango: Range; editando: HTMLAnchorElement | null } | null>(null);
  const vacio = valor.trim() === "";

  useEffect(() => {
    const el = campo.current;
    if (!el || valor === ultimo.current) return;
    el.innerHTML = mdAHtml(valor);
    ultimo.current = valor;
  }, [valor]);

  useEffect(() => {
    const revisar = () => {
      const el = campo.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) return;
      setNegrita(document.queryCommandState("bold"));
      setEnEnlace(enlaceBajo(el, sel.anchorNode) !== null);
    };
    document.addEventListener("selectionchange", revisar);
    return () => document.removeEventListener("selectionchange", revisar);
  }, []);

  const emitir = () => {
    const el = campo.current;
    if (!el) return;
    const md = nodoAMd(el);
    const nuevo = multilinea ? md : md.replace(/\n/g, " ");
    ultimo.current = nuevo;
    onCambio(nuevo);
  };

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (multilinea) document.execCommand("insertLineBreak");
      return;
    }
    // Solo negrita: sin cursiva ni subrayado.
    if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "u")) e.preventDefault();
  };

  // Se pega siempre como texto simple, para que no entren estilos de otras páginas.
  const alPegar = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
    (multilinea ? t : t.replace(/\s*\n\s*/g, " ")).split("\n").forEach((l, i) => {
      if (i > 0) document.execCommand("insertLineBreak");
      if (l) document.execCommand("insertText", false, l);
    });
  };

  const ponerNegrita = () => {
    campo.current?.focus();
    document.execCommand("bold");
    emitir();
  };

  const abrirEnlace = () => {
    const el = campo.current;
    if (!el) return;
    const sel = window.getSelection();
    let rango: Range;
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      rango = sel.getRangeAt(0).cloneRange();
    } else {
      // Sin cursor en el campo: el enlace se añade al final.
      rango = document.createRange();
      rango.selectNodeContents(el);
      rango.collapse(false);
    }
    const actual = enlaceBajo(el, sel?.anchorNode ?? null);
    setEnlace({ texto: actual ? (actual.textContent ?? "") : rango.toString(), url: actual?.getAttribute("href") ?? "", rango, editando: actual });
  };

  const aplicarEnlace = () => {
    const el = campo.current;
    if (!enlace || !el) return;
    const url = normalizarUrl(enlace.url);
    if (!ENLACE_TEXTO.test(url)) return;
    el.focus();
    const sel = window.getSelection();
    sel?.removeAllRanges();
    const rango = enlace.rango;
    if (enlace.editando) rango.selectNode(enlace.editando);
    sel?.addRange(rango);
    document.execCommand("insertHTML", false, `<a href="${escAttr(url)}">${esc(enlace.texto.trim() || url)}</a>`);
    setEnlace(null);
    emitir();
  };

  const quitarEnlace = () => {
    const el = campo.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const a = enlaceBajo(el, sel.anchorNode);
    if (!a) return;
    const rango = document.createRange();
    rango.selectNodeContents(a);
    sel.removeAllRanges();
    sel.addRange(rango);
    document.execCommand("unlink");
    emitir();
  };

  const urlMala = enlace !== null && enlace.url.trim() !== "" && !ENLACE_TEXTO.test(normalizarUrl(enlace.url));
  const urlValida = enlace !== null && ENLACE_TEXTO.test(normalizarUrl(enlace.url));
  // Los botones no le quitan el cursor al campo, para que el formato se aplique a lo seleccionado.
  const sinFoco = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };
  const boton = "ad-icon-btn !h-8 !w-8";
  const activo = "!border-[#b08f4f] !bg-[#f7edcf] !text-[#11271d]";

  const herramientas = (
    <div className="flex items-center gap-1.5">
      <button type="button" {...sinFoco} onClick={ponerNegrita} aria-pressed={negrita} aria-label="Negrita" title="Negrita (Ctrl+B)" className={`${boton} ${negrita ? activo : ""}`}>
        <Bold size={15} />
      </button>
      <button type="button" {...sinFoco} onClick={abrirEnlace} aria-label={enEnlace ? "Editar enlace" : "Poner enlace"} title={enEnlace ? "Editar el enlace" : "Poner enlace a las palabras seleccionadas"} className={`${boton} ${enEnlace ? activo : ""}`}>
        <Link2 size={15} />
      </button>
      {enEnlace && (
        <button type="button" {...sinFoco} onClick={quitarEnlace} aria-label="Quitar enlace" title="Quitar el enlace" className={boton}>
          <Link2Off size={15} />
        </button>
      )}
    </div>
  );

  return (
    <div className="group relative flex flex-col gap-1.5">
      <span id={idEtiqueta} className={barra === "flotante" ? "sr-only" : "text-sm font-semibold text-[#11271d]"}>{etiqueta}</span>
      {barra === "fija" ? (
        herramientas
      ) : (
        <div className="absolute -top-9 right-0 z-10 hidden rounded-xl border border-[#e4e2d6] bg-white p-1 shadow-md group-focus-within:flex">{herramientas}</div>
      )}
      {enlace && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e4e2d6] bg-white p-2">
          <input
            type="text"
            aria-label="Palabras del enlace"
            placeholder="Palabras que llevan el enlace"
            value={enlace.texto}
            onChange={(e) => setEnlace({ ...enlace, texto: e.target.value })}
            onKeyDown={(e) => e.key === "Escape" && setEnlace(null)}
            className="ad-input !w-auto min-w-[10rem] flex-1 !py-1.5"
          />
          <input
            autoFocus
            type="text"
            inputMode="url"
            aria-label="Dirección del enlace"
            placeholder="https://… o /ruta"
            value={enlace.url}
            onChange={(e) => setEnlace({ ...enlace, url: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                aplicarEnlace();
              } else if (e.key === "Escape") setEnlace(null);
            }}
            className={`ad-input !w-auto min-w-[12rem] flex-1 !py-1.5 ${urlMala ? "!border-[#e0a0a0]" : ""}`}
          />
          <button type="button" onClick={aplicarEnlace} disabled={!urlValida} className="ad-btn ad-btn-primary !min-h-9">Aplicar</button>
          <button type="button" onClick={() => setEnlace(null)} className="ad-btn ad-btn-ghost !min-h-9">Cancelar</button>
        </div>
      )}
      <div
        ref={campo}
        role="textbox"
        aria-multiline={multilinea}
        aria-labelledby={idEtiqueta}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder ?? ""}
        data-vacio={vacio}
        onInput={emitir}
        onKeyDown={alTeclear}
        onPaste={alPegar}
        onDrop={(e) => e.preventDefault()}
        dangerouslySetInnerHTML={{ __html: inicial }}
        className={`ad-input rico ${multilinea ? "min-h-[7rem]" : ""}`}
      />
    </div>
  );
}
