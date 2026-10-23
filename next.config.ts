import { existsSync } from "node:fs";
import type { NextConfig } from "next";
import portal from "./src/content/legacy/portal.json";

// Tabla de equivalencias de URLs (TDR 5.3): redirecciones 301 desde las rutas del portal Drupal actual hacia las
// nuevas. Las manuales cubren páginas que cambiaron de nombre; el resto se genera del inventario migrado
// (src/content/legacy/portal.json): cada ruta del Drupal apunta a su página en /seccion/<sección>/<ruta>.
const manualRedirects = [
  { source: "/index.php/noticias", destination: "/noticias", permanent: true },
  { source: "/index.php/component/k2", destination: "/noticias", permanent: true },
  { source: "/publicaciones-institucionales", destination: "/publicaciones", permanent: true },
  { source: "/quienes-somos-fedegan", destination: "/quienes-somos", permanent: true },
  { source: "/normatividad-vigente", destination: "/normatividad", permanent: true },
];

const inventory = portal as unknown as {
  sections: Record<string, { landing: string }>;
  pages: Record<string, { sections: string[] }>;
};

function migratedRedirects() {
  const manual = new Set(manualRedirects.map((r) => r.source));
  const out: { source: string; destination: string; permanent: true }[] = [];
  for (const [key, page] of Object.entries(inventory.pages)) {
    const slug = page.sections[0];
    if (!slug) continue;
    const source = `/${key}`;
    // Una ruta que ya es una página real del portal nuevo no se redirige (se vería un bucle o se taparía la página).
    if (manual.has(source) || existsSync(`./src/app/${key}/page.tsx`)) continue;
    const landing = inventory.sections[slug].landing === key;
    out.push({ source, destination: landing ? `/seccion/${slug}` : `/seccion/${slug}/${key}`, permanent: true });
  }
  return out;
}

const legacyRedirects = [...manualRedirects, ...migratedRedirects()];

// Cabeceras de seguridad (TDR §6). La CSP permite los orígenes que el portal usa: Supabase, CONtexto, Google
// Tag Manager / Analytics y los PDFs en Google Cloud Storage. 'unsafe-inline' sigue por los estilos y scripts
// en línea de Next.js; pasar a nonces es una mejora posterior.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com" + (process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "connect-src 'self' https://*.supabase.co https://contexto-olive.vercel.app https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Imágenes remotas permitidas para next/image: archivos subidos desde el CMS (Supabase Storage) y portadas de CONtexto.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "contexto-olive.vercel.app" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El service worker nunca debe quedar en caché del navegador: así cada despliegue lo renueva.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
