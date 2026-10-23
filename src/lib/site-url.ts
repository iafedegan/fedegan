// URL pública del portal. Hasta que el dominio definitivo sirva el sitio, se define NEXT_PUBLIC_SITE_URL
// (p. ej. la URL de Vercel); sitemap, robots, canonical y datos estructurados leen de aquí.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fedegan.org.co").replace(/\/$/, "");
