import type { MetadataRoute } from "next";
import { getEvents, getPublications } from "@/lib/cms/content";
import { getNoticias } from "@/lib/contexto";

const BASE_URL = "https://www.fedegan.org.co";

const staticRoutes = [
  "",
  "/quienes-somos",
  "/programas",
  "/noticias",
  "/publicaciones",
  "/eventos",
  "/servicios",
  "/normatividad",
  "/contacto",
  "/preguntas-frecuentes",
  "/escuela-virtual",
  "/tvgan",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: noticias }, publications, events] = await Promise.all([getNoticias({ limit: 50 }), getPublications(), getEvents()]);
  const dynamic = [
    ...noticias.map((n) => `/noticias/${n.slug}`),
    ...publications.map((p) => `/publicaciones/${p.slug}`),
    ...events.map((e) => `/eventos/${e.slug}`),
  ];

  return [...staticRoutes, ...dynamic].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
