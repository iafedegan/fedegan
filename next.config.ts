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
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
