import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Database, ExternalLink, KeyRound, Newspaper, ShieldCheck } from "lucide-react";
import { auth, demoEnabled, entraConfigured } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { ApiKeyForm, ApiTestButton } from "@/components/admin/ApiForms";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { cmsEnvStatus } from "@/lib/cms/client";
import { getStoredMeta } from "@/lib/cms/integrations";
import { secretsAvailable } from "@/lib/cms/secrets";
import { contextoCredentials } from "@/lib/contexto";
import { removeApiKey } from "@/lib/cms/api-actions";

export const metadata: Metadata = { title: "Conexiones · Panel del portal", robots: { index: false } };

const dot = (ok: boolean) => <i className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-[#1f8a5b]" : "bg-[#d64545]"}`} />;

export default async function ApisPage() {
  const session = await auth();
  const isAdmin = hasAnyRole(session?.user?.roles, [ROLES.portalAdmin]);
  const [creds, meta] = await Promise.all([contextoCredentials(), getStoredMeta("contexto")]);
  const canStore = cmsEnvStatus.serviceKey && secretsAvailable;
  const envHint = creds.source === "env" && creds.key ? creds.key.slice(-4) : null;
  const hint = meta?.hint ?? envHint;
  const sourceLabel = creds.source === "panel" ? "Clave guardada en el panel" : creds.source === "env" ? "Variable de entorno CONTEXTO_API_KEY" : "Sin clave";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Conexiones (APIs)</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Conexiones y APIs</h1>
        <p className="mt-1.5 max-w-2xl text-[#5d6e65]">Las fuentes externas de las que se alimenta el portal: estado, prueba de conexión y cambio de claves.</p>
      </header>

      {!canStore && <ConfigNotice compact />}

      {/* CONtexto */}
      <section className="ad-card flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0eb] text-[#165a43]"><Newspaper size={22} /></span>
            <div>
              <h2 className="text-xl font-bold">CONtexto Ganadero</h2>
              <p className="mt-0.5 text-sm text-[#5d6e65]">Noticias de portada, listado y detalle de notas (solo lectura).</p>
            </div>
          </div>
          <span className={`ad-pill ${creds.key ? "ad-pill-ok" : "ad-pill-off"}`}>{creds.key ? "Con clave" : "Sin clave"}</span>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="ad-eyebrow">Dirección</dt><dd className="mt-1 break-all font-mono text-[0.82rem]">{creds.base}</dd></div>
          <div><dt className="ad-eyebrow">Clave</dt><dd className="mt-1 font-mono text-[0.82rem]">{hint ? `••••••••${hint}` : "—"}</dd></div>
          <div><dt className="ad-eyebrow">Origen</dt><dd className="mt-1">{sourceLabel}</dd></div>
        </dl>
        {meta && (
          <p className="text-xs text-[#8a978f]">
            Guardada el {new Date(meta.updatedAt).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" })}
            {meta.updatedBy ? ` por ${meta.updatedBy}` : ""}.{!meta.readable && " No se puede leer con el AUTH_SECRET actual: vuelva a cargarla."}
          </p>
        )}

        <div className="grid gap-6 border-t border-[#eceae0] pt-6 lg:grid-cols-[auto_1fr] lg:gap-10">
          <ApiTestButton id="contexto" />
          {isAdmin ? (
            <div className="flex flex-col gap-4">
              <ApiKeyForm id="contexto" disabled={!canStore} hint={hint ?? undefined} />
              {creds.source === "panel" && (
                <form action={removeApiKey}>
                  <input type="hidden" name="id" value="contexto" />
                  <button type="submit" className="text-sm font-semibold text-[#7a1f1f] underline underline-offset-4">Quitar la clave del panel y usar la de entorno</button>
                </form>
              )}
            </div>
          ) : (
            <p className="flex items-start gap-2 text-sm text-[#5d6e65]"><KeyRound size={16} className="mt-0.5 shrink-0 text-[#b08f4f]" /> Solo los administradores del portal pueden cambiar la clave.</p>
          )}
        </div>
        <a href="https://contexto-olive.vercel.app/api-docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[#165a43]">
          Documentación de la API <ExternalLink size={14} />
        </a>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Supabase */}
        <section className="ad-card flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dcefe9] text-[#14665a]"><Database size={22} /></span>
            <div>
              <h2 className="text-xl font-bold">Supabase · contenido del portal</h2>
              <p className="mt-0.5 text-sm text-[#5d6e65]">Base de datos y archivos del CMS.</p>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">{dot(cmsEnvStatus.url)} <code className="font-mono text-[0.8rem]">SUPABASE_URL</code></li>
            <li className="flex items-center gap-2">{dot(cmsEnvStatus.publicKey)} <code className="font-mono text-[0.8rem]">SUPABASE_PUBLISHABLE_KEY</code></li>
            <li className="flex items-center gap-2">{dot(cmsEnvStatus.serviceKey)} <code className="font-mono text-[0.8rem]">SUPABASE_SERVICE_ROLE_KEY</code></li>
          </ul>
          <ApiTestButton id="supabase" />
          <p className="text-xs text-[#8a978f]">Estas variables se cambian en Vercel (Settings → Environment Variables); no se editan desde aquí.</p>
        </section>

        {/* Microsoft Entra ID */}
        <section className="ad-card flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7edcf] text-[#8a6d1f]"><ShieldCheck size={22} /></span>
            <div>
              <h2 className="text-xl font-bold">Microsoft Entra ID · acceso</h2>
              <p className="mt-0.5 text-sm text-[#5d6e65]">Inicio de sesión de funcionarios y roles del panel.</p>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">{dot(entraConfigured)} Azure conectado <span className="text-[#8a978f]">({entraConfigured ? "activo" : "pendiente de configurar"})</span></li>
            <li className="flex items-center gap-2">{dot(!demoEnabled)} Modo demostración <span className="text-[#8a978f]">({demoEnabled ? "ACTIVO: cuentas de ejemplo" : "desactivado"})</span></li>
          </ul>
          {demoEnabled && (
            <p className="rounded-xl bg-[#f7edcf] px-3.5 py-2.5 text-sm text-[#6d5412]">
              El modo demostración permite entrar con cuentas ficticias. Desactive <code className="font-mono text-[0.8rem]">AUTH_DEMO_MODE</code> cuando se conecte Azure.
            </p>
          )}
          <p className="text-xs text-[#8a978f]">Se configura con las variables AUTH_MICROSOFT_ENTRA_ID_* en Vercel.</p>
        </section>
      </div>
    </div>
  );
}
