import type { NextConfig } from "next";

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
      // El service worker nunca debe quedar en caché del navegador: así cada despliegue lo renueva.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
