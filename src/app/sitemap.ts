import type { MetadataRoute } from "next";
import { featuredNews, publications, events } from "@/content/site";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamic = [
    ...featuredNews.map((n) => `/noticias/${n.slug}`),
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
