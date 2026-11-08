"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Paperclip, Send } from "lucide-react";
import { opcionesDe, type Datos } from "@/lib/cms/elementos";
import { enviarFormulario, type FormularioEstado } from "@/lib/cms/formularios-actions";

// Formulario que arma el editor: pregunta por pregunta, con el estilo del portal. En la vista previa del editor no envía nada.
// La dirección de la API (webhook) nunca llega aquí: el servidor la lee de la definición publicada.

const t = (v: unknown) => (typeof v === "string" ? v : "");
const lista = (v: unknown): Datos[] => (Array.isArray(v) ? v.filter((x): x is Datos => !!x && typeof x === "object" && !Array.isArray(x)) : []);

export function Formulario({ d, preview = false }: { d: Datos; preview?: boolean }) {
  const [state, action, pending] = useActionState<FormularioEstado, FormData>(enviarFormulario, {});
  const [aviso, setAviso] = useState("");
  const pagina = usePathname();
  const preguntas = lista(d.campos);
  const id = `fm-${t(d.clave) || "x"}`;

  if (state.ok) {
    return (
      <section className="fm fm-ok" aria-live="polite">
        <CheckCircle2 size={34} aria-hidden />
        <p className="fm-ok-t">{state.message}</p>
      </section>
    );
  }

  return (
    <section className="fm">
      <header className="fm-head">
        <span role="heading" aria-level={3} className="fm-titulo">{t(d.titulo)}</span>
        {t(d.texto) && <p className="fm-desc">{t(d.texto).replace(/\*\*|\[([^\]]+)\]\([^)]*\)/g, "$1")}</p>}
      </header>
      <form
        action={action}
        onSubmit={(e) => {
          if (preview) {
            e.preventDefault();
            setAviso("Vista previa: aquí no se envía nada.");
          }
        }}
        className="fm-form"
      >
        <input type="hidden" name="clave" value={t(d.clave)} />
        <input type="hidden" name="pagina" value={pagina} />
        {/* Campo trampa: los robots lo llenan, las personas no lo ven. */}
        <div aria-hidden className="fm-trampa"><label>Sitio web<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>
        {preguntas.map((p, i) => {
          const tipo = t(p.tipo) || "texto";
          const req = p.requerido === true;
          const nombre = `c${i}`;
          const campo = `${id}-${i}`;
          const opciones = opcionesDe(t(p.opciones));
          const etiqueta = (
            <span className="fm-et">{t(p.etiqueta)}{req && <abbr title="Obligatoria" className="fm-req">*</abbr>}</span>
          );
          return (
            <div key={i} className={`fm-campo ${tipo === "parrafo" || tipo === "casillas" ? "fm-ancho" : ""}`}>
              {tipo === "casillas" ? (
                <fieldset className="fm-set">
                  <legend>{etiqueta}</legend>
                  <div className="fm-opciones">
                    {opciones.map((o) => (
                      <label key={o} className="fm-opcion"><input type="checkbox" name={nombre} value={o} /> <span>{o}</span></label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <label htmlFor={campo}>
                  {etiqueta}
                  {tipo === "parrafo" ? (
                    <textarea id={campo} name={nombre} rows={4} maxLength={3000} required={req} className="fm-in" />
                  ) : tipo === "lista" ? (
                    <select id={campo} name={nombre} required={req} defaultValue="" className="fm-in">
                      <option value="" disabled>Elija una opción…</option>
                      {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : tipo === "archivo" ? (
                    <span className="fm-archivo"><Paperclip size={16} aria-hidden /><input id={campo} type="file" name={nombre} required={req} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" /></span>
                  ) : (
                    <input
                      id={campo} name={nombre} required={req} className="fm-in" maxLength={300}
                      type={tipo === "correo" ? "email" : tipo === "telefono" ? "tel" : tipo === "numero" ? "text" : tipo === "fecha" ? "date" : "text"}
                      inputMode={tipo === "numero" ? "decimal" : undefined}
                      autoComplete={tipo === "correo" ? "email" : tipo === "telefono" ? "tel" : "off"}
                    />
                  )}
                </label>
              )}
              {t(p.ayuda) && <span className="fm-ayuda">{t(p.ayuda)}</span>}
              {tipo === "archivo" && <span className="fm-ayuda">PDF, Word, Excel, JPG o PNG · hasta 10 MB.</span>}
            </div>
          );
        })}
        <div className="fm-pie">
          <button type="submit" disabled={pending} className="fm-btn">
            {pending ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />} {pending ? "Enviando…" : t(d.boton) || "Enviar"}
          </button>
          {(state.message || aviso) && <p role={state.ok === false ? "alert" : "status"} className="fm-error">{state.message || aviso}</p>}
        </div>
      </form>
    </section>
  );
}
