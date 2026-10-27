import { readFileSync } from "node:fs";
import type { NextConfig } from "next";
import { buildLegacyRedirects, servedPaths } from "./src/content/legacy/redirects";

// Tabla de equivalencias de URLs (TDR 5.3): ejemplo de redirecciones 301
// desde rutas del portal Drupal actual hacia las nuevas rutas del portal.
// En la migración real, esta tabla se genera programáticamente a partir del
// inventario de contenido del sitio actual.
const legacyRedirects = [
  { source: "/index.php/noticias", destination: "/noticias", permanent: true },
  { source: "/index.php/component/k2", destination: "/noticias", permanent: true },
  { source: "/publicaciones-institucionales", destination: "/publicaciones", permanent: true },
  { source: "/quienes-somos-fedegan", destination: "/quienes-somos", permanent: true },
  { source: "/normatividad-vigente", destination: "/normatividad", permanent: true },
];

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

// Imágenes del portal en /public: no llevan huella en el nombre, así que se guardan una semana y se revalidan en segundo plano.
const staticAssetCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["lucide-react"] },
  // Imágenes remotas permitidas para next/image: archivos subidos desde el CMS (Supabase Storage) y portadas de CONtexto.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "contexto-olive.vercel.app" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El service worker nunca debe quedar en caché del navegador: así cada despliegue lo renueva.
      ...["journey", "cursos", "servicios", "headers", "brand", "accesos", "locales"].map((d) => ({ source: `/${d}/:path*`, headers: staticAssetCache })),
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
  async redirects() {
    // 301 manuales primero (tienen prioridad) y luego las generadas desde las páginas migradas.
    const legacy = JSON.parse(readFileSync("./src/content/legacy/portal.json", "utf8"));
    const manual = new Set(legacyRedirects.map((r) => r.source));
    const generated = buildLegacyRedirects(legacy, servedPaths("./src/app")).filter((r) => !manual.has(r.source));
    return [...legacyRedirects.map((r) => ({ source: r.source, destination: r.destination, statusCode: 301 as const })), ...generated];
  },
};

export default nextConfig;
