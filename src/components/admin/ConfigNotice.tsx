import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ConfigNotice() {
  return (
    <Card hover={false} accent="230,160,108">
      <div className="flex flex-col items-start gap-3 p-7">
        <KeyRound size={24} className="text-[rgb(var(--acc-rgb))]" />
        <h2 className="text-xl font-bold text-[var(--text)]">Falta la clave de servicio del CMS</h2>
        <p className="leading-relaxed text-[var(--text-muted)]">
          Para editar desde este panel el servidor necesita la variable{" "}
          <code className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 font-mono text-sm">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          (Supabase → Project Settings → API → service_role). Agréguela en Vercel (Settings → Environment Variables) y en el archivo{" "}
          <code className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 font-mono text-sm">.env.local</code>, y vuelva a desplegar.
        </p>
      </div>
    </Card>
  );
}
