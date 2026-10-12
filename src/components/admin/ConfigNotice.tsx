import { KeyRound } from "lucide-react";
import { cmsEnvStatus } from "@/lib/cms/client";

export function ConfigNotice({ compact = false }: { compact?: boolean }) {
  const item = (ok: boolean, name: string) => (
    <li className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-[#1f8a5b]" : "bg-[#d64545]"}`} />
      <code className="font-mono text-[0.8rem]">{name}</code>
      <span className="text-[#8a978f]">{ok ? "detectada" : "no detectada"}</span>
    </li>
  );
  return (
    <div className="ad-card flex gap-4 border-l-4 border-l-[#d8b558] p-5 sm:p-6">
      <KeyRound size={22} className="mt-0.5 shrink-0 text-[#b08f4f]" />
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold">Modo solo lectura: falta la clave de servicio</h2>
          {!compact && (
            <p className="mt-1 text-sm leading-relaxed text-[#5d6e65]">
              Puede ver el contenido publicado, pero para guardar cambios el servidor necesita <code className="font-mono text-[0.8rem]">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
              (Supabase → Project Settings → API → service_role) en Vercel (entorno Production) y un Redeploy.
            </p>
          )}
        </div>
        <ul className="flex flex-col gap-1 text-sm text-[#11271d]">
          {item(cmsEnvStatus.url, "SUPABASE_URL")}
          {item(cmsEnvStatus.publicKey, "SUPABASE_PUBLISHABLE_KEY")}
          {item(cmsEnvStatus.serviceKey, "SUPABASE_SERVICE_ROLE_KEY")}
        </ul>
      </div>
    </div>
  );
}
