import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FEDEGÁN · Federación Colombiana de Ganaderos",
    short_name: "FEDEGÁN",
    description: "Portal institucional y hub del ecosistema digital ganadero de Colombia.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#05100b",
    theme_color: "#05100b",
    lang: "es",
    categories: ["news", "business", "productivity"],
    // El escudo de FEDEGÁN (blanco) sobre verde, a cuadro completo: sin esquinas transparentes ni fondo negro al instalarla.
    icons: [
      { src: "/brand/fedegan-app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/fedegan-app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/fedegan-app-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Noticias", url: "/noticias", icons: [{ src: "/brand/fedegan-app-192.png", sizes: "192x192" }] },
      { name: "Servicios", url: "/servicios", icons: [{ src: "/brand/fedegan-app-192.png", sizes: "192x192" }] },
      { name: "Contacto", url: "/contacto", icons: [{ src: "/brand/fedegan-app-192.png", sizes: "192x192" }] },
    ],
  };
}
