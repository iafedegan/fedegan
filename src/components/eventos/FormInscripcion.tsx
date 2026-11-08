"use client";

import { useActionState, useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { inscribirse, type InscripcionEstado } from "@/lib/cms/inscripciones-actions";
import { opcionesDe, type Pregunta } from "@/lib/cms/inscripcion-form";

// Formulario público de inscripción: nombre y correo siempre, y las preguntas que el equipo arma para cada evento.
// Dos columnas en pantallas anchas, una en móvil. `preview`: así se ve dentro del editor (no envía nada).
export function FormInscripcion({ slug, preguntas, preview = false }: { slug: string; preguntas: Pregunta[]; preview?: boolean }) {
  const [state, action, pending] = useActionState<InscripcionEstado, FormData>(inscribirse, {});
  const [aviso, setAviso] = useState("");
  return (
    <form
      action={action}
      noValidate={!preview}
      onSubmit={(e) => {
        if (preview) {
          e.preventDefault();
          setAviso("Vista previa: aquí no se envía nada.");
        }
      }}
      className="fm-form !p-0"
    >
      <input type="hidden" name="slug" value={slug} />
      <div aria-hidden className="fm-trampa"><label>Sitio web <input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="fm-campo fm-ancho">
        <label>
          <span className="fm-et">Nombre completo<abbr title="Obligatoria" className="fm-req">*</abbr></span>
          <input name="name" required maxLength={120} autoComplete="name" className="fm-in" />
        </label>
      </div>
      <div className="fm-campo fm-ancho">
        <label>
          <span className="fm-et">Correo electrónico<abbr title="Obligatoria" className="fm-req">*</abbr></span>
          <input name="email" type="email" required maxLength={160} autoComplete="email" className="fm-in" />
        </label>
        <span className="fm-ayuda">Aquí le enviamos su código con el QR para ingresar al evento.</span>
      </div>
      {preguntas.map((p, i) => {
        const nombre = `c${i}`;
        const opciones = opcionesDe(p.opciones);
        const etiqueta = <span className="fm-et">{p.etiqueta}{p.requerido ? <abbr title="Obligatoria" className="fm-req">*</abbr> : <span className="fm-opc"> (opcional)</span>}</span>;
        return (
          <div key={i} className={`fm-campo ${p.tipo === "parrafo" || p.tipo === "casillas" ? "fm-ancho" : ""}`}>
            {p.tipo === "casillas" ? (
              <fieldset className="fm-set">
                <legend>{etiqueta}</legend>
                <div className="fm-opciones">
                  {opciones.map((o) => <label key={o} className="fm-opcion"><input type="checkbox" name={nombre} value={o} /> <span>{o}</span></label>)}
                </div>
              </fieldset>
            ) : (
              <label>
                {etiqueta}
                {p.tipo === "parrafo" ? (
                  <textarea name={nombre} rows={4} maxLength={3000} required={p.requerido} className="fm-in" />
                ) : p.tipo === "lista" ? (
                  <select name={nombre} required={p.requerido} defaultValue="" className="fm-in">
                    <option value="" disabled>Elija una opción…</option>
                    {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : p.tipo === "archivo" ? (
                  <span className="fm-archivo"><Paperclip size={16} aria-hidden /><input type="file" name={nombre} required={p.requerido} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" /></span>
                ) : (
                  <input
                    name={nombre} required={p.requerido} className="fm-in" maxLength={300}
                    type={p.tipo === "correo" ? "email" : p.tipo === "telefono" ? "tel" : p.tipo === "fecha" ? "date" : "text"}
                    inputMode={p.tipo === "numero" ? "decimal" : undefined}
                    autoComplete={p.tipo === "correo" ? "email" : p.tipo === "telefono" ? "tel" : "off"}
                  />
                )}
              </label>
            )}
            {p.ayuda && <span className="fm-ayuda">{p.ayuda}</span>}
            {p.tipo === "archivo" && <span className="fm-ayuda">PDF, Word, Excel, JPG o PNG · hasta 10 MB.</span>}
          </div>
        );
      })}
      <div className="fm-pie">
        <button type="submit" disabled={pending} className="fm-btn">
          {pending ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />} {pending ? "Inscribiendo…" : "Inscribirme"}
        </button>
        {(state.error || aviso) && <p role="alert" className="fm-error">{state.error || aviso}</p>}
      </div>
    </form>
  );
}
