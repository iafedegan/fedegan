"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
          Nombre completo
          <Input id="contact-name" name="name" placeholder="Su nombre" required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
          Correo electrónico
          <Input id="contact-email" name="email" type="email" placeholder="correo@ejemplo.com" required />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
        Asunto
        <Input id="contact-subject" name="subject" placeholder="Motivo de su mensaje" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
        Mensaje
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Escriba su mensaje aquí"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:shadow-[0_0_0_4px_rgba(216,181,88,0.18)] focus:border-[var(--fg-lime-500)]"
        />
      </label>
      <Button type="submit" className="self-start">Enviar mensaje</Button>
    </form>
  );
}
