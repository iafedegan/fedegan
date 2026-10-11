import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Acepta tanto los nombres propios como los que crea la integración de Supabase en Vercel.
const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const cmsReadable = Boolean(URL && PUBLIC_KEY);
export const cmsWritable = Boolean(URL && SERVICE_KEY);

export const CMS_TAG = "cms";
export const MEDIA_BUCKET = "media";

// Las lecturas públicas usan la caché de Next, etiquetada para invalidarla al editar.
const taggedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, next: { revalidate: 60, tags: [CMS_TAG] } });

let publicClient: SupabaseClient | null = null;

/** Cliente de solo lectura (clave pública + RLS: únicamente filas publicadas). */
export function publicDb(): SupabaseClient | null {
  if (!cmsReadable) return null;
  publicClient ??= createClient(URL!, PUBLIC_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: taggedFetch },
  });
  return publicClient;
}

/** Cliente con permisos de escritura. Solo debe usarse tras validar el rol del editor. */
export function adminDb(): SupabaseClient | null {
  if (!cmsWritable) return null;
  return createClient(URL!, SERVICE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function publicMediaUrl(path: string) {
  return `${URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
