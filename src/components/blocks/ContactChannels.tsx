import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Section } from "@/components/ui/Editorial";
import { contacto } from "@/content/accesos";

/** Canales oficiales de atención: cada correo con el uso para el que sirve. */
export function ContactChannels({ tinted = true }: { tinted?: boolean }) {
  return (
    <Section eyebrow="Atención" title="Canales oficiales" intro="Use el correo que corresponde a su solicitud para recibir respuesta más rápido." tinted={tinted}>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="mx-card flex flex-col gap-3.5 !p-5">
          <p className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-muted)]"><MapPin size={18} className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />{contacto.direccion}</p>
          <p className="flex items-center gap-3 text-sm"><Phone size={18} className="shrink-0 text-[var(--fg-lime-400)]" /><a href={contacto.telefonoHref} className="font-semibold text-[var(--text)] hover:text-[var(--fg-lime-400)]">{contacto.telefono}</a></p>
          <p className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-muted)]"><Clock size={18} className="mt-0.5 shrink-0 text-[var(--fg-lime-400)]" />{contacto.horario}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {contacto.correos.map((c) => (
            <li key={c.email} className="mx-card flex flex-col gap-1.5 !p-5">
              <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]"><Mail size={14} />{c.label}</p>
              <a href={`mailto:${c.email}`} className="break-all text-base font-bold text-[var(--text)] hover:text-[var(--fg-lime-400)]">{c.email}</a>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{c.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
