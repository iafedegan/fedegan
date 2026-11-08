import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FolderArchive, History, Newspaper, Sparkles } from "lucide-react";
import { cmsEnvStatus } from "@/lib/cms/client";
import { secretsAvailable } from "@/lib/cms/secrets";

export const metadata: Metadata = { title: "Configuración · Panel del portal", robots: { index: false } };

const dot = (ok: boolean) => <i className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-[#1f8a5b]" : "bg-[#d64545]"}`} />;

const secciones = [
  { href: "/admin/apis", icon: Newspaper, titulo: "Conexiones y APIs", texto: "CONtexto Ganadero (noticias), Supabase y sus claves: estado, prueba de conexión y cambio de claves." },
  { href: "/admin/apis#ia", icon: Sparkles, titulo: "Inteligencia artificial", texto: "Claves de Claude y Gemini para redactar páginas desde el Árbol del sitio." },
  { href: "/admin/apis#documentos", icon: FolderArchive, titulo: "Documentos en Supabase", texto: "Copia de los documentos migrados al almacenamiento del portal y avance de la copia." },
  { href: "/admin/actividad", icon: History, titulo: "Actividad del equipo", texto: "Registro de quién cambió qué en el portal (últimos 100 movimientos)." },
];

export default function ConfiguracionPage() {
  const estado = [
    { ok: cmsEnvStatus.url, texto: "Dirección de Supabase", nombre: "SUPABASE_URL" },
    { ok: cmsEnvStatus.publicKey, texto: "Clave pública de Supabase (lectura)", nombre: "SUPABASE_PUBLISHABLE_KEY" },
    { ok: cmsEnvStatus.serviceKey, texto: "Clave de servicio de Supabase (escritura)", nombre: "SUPABASE_SERVICE_ROLE_KEY" },
    { ok: secretsAvailable, texto: "Cifrado de las claves guardadas en el panel", nombre: "AUTH_SECRET" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Configuración</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Configuración</h1>
        <p className="mt-1.5 max-w-2xl text-[#5d6e65]">Las conexiones del portal con otros servicios, sus claves y el estado del servidor.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {secciones.map(({ href, icon: Icon, titulo, texto }) => (
          <Link key={href} href={href} className="ad-card group flex items-start gap-4 p-5 transition-colors hover:border-[#72bf44]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef8e6] text-[#3d7a22]"><Icon size={22} /></span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-lg font-bold">{titulo} <ChevronRight size={16} className="text-[#8a978f] transition-transform group-hover:translate-x-0.5" /></span>
              <span className="mt-1 block text-sm leading-relaxed text-[#5d6e65]">{texto}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="ad-card flex flex-col gap-4 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Estado del servidor</h2>
          <p className="mt-0.5 text-sm text-[#5d6e65]">Qué variables de entorno ve el servidor (solo si están, nunca sus valores). Se cambian en Vercel.</p>
        </div>
        <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
          {estado.map((e) => (
            <li key={e.nombre} className="flex items-start gap-2.5">
              <span className="mt-1.5">{dot(e.ok)}</span>
              <span><span className="font-semibold">{e.texto}</span><br /><code className="font-mono text-[0.78rem] text-[#5d6e65]">{e.nombre}</code> · {e.ok ? "detectada" : "no detectada"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
