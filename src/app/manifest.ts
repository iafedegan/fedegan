import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos",
    short_name: "FEDEGÁN",
    description: "Portal institucional y hub del ecosistema digital ganadero de Colombia.",
    start_url: "/",
    display: "standalone",
    background_color: "#05100b",
    theme_color: "#05100b",
    lang: "es",
    icons: [
      { src: "/brand/fedegan-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/fedegan-icon-round.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
