"use client";

import { EVENTO_PRIVACIDAD } from "@/lib/uso";

export function PrivacyButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_PRIVACIDAD))} className={className}>
      Preferencias de privacidad
    </button>
  );
}
