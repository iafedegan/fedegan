"use client";

import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Su correo electrónico"
        aria-label="Correo electrónico"
        className="rounded-[var(--radius-sm)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-[var(--fg-lime-500)]"
      />
      <Button variant="lime" type="submit" size="sm">
        Suscribirme
      </Button>
    </form>
  );
}
