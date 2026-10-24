import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/ingresar", "/mi-fedegan", "/escuela-virtual/ingresar", "/escuela-virtual/perfil", "/escuela-virtual/verificar", "/offline", "/buscador?"] },
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
