import type { MetadataRoute } from "next";
import { getEvents, getPublications } from "@/lib/cms/content";
import { getNoticias } from "@/lib/contexto";
import { allLegacyPages, legacyHref } from "@/content/legacy";

import { SITE_URL as BASE_URL } from "@/lib/site-url";

const staticRoutes = [
  "",
  "/quienes-somos",
  "/noticias",
  "/publicaciones",
  "/eventos",
  "/servicios",
  "/contacto",
  "/preguntas-frecuentes",
  "/escuela-virtual",
  "/tvgan",
  "/privacidad",
  "/terminos",
  "/transparencia",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: noticias }, publications, events] = await Promise.all([getNoticias({ limit: 50 }), getPublications(), getEvents()]);
  const dynamic = [
    ...noticias.map((n) => `/noticias/${n.slug}`),
    ...publications.map((p) => `/publicaciones/${p.slug}`),
    ...events.map((e) => `/eventos/${e.slug}`),
    ...allLegacyPages().map(({ key, slug }) => legacyHref(slug, key)),
  ];

  return [...staticRoutes, ...dynamic].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
