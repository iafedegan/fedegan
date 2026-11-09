// ¿La imagen puede pasar por el optimizador de Next? Solo los orígenes declarados en next.config.ts (images.remotePatterns)
// y las imágenes propias. El resto se sirve tal cual para no romper la página con un host no permitido.
export function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    if (u.hostname === "contexto-olive.vercel.app") return true;
    // Archivos del sitio anterior que el contenido migrado todavía enlaza (hasta que se copien a Supabase).
    if (u.hostname === "storage.fedegan.org.co" || u.hostname === "static.fedegan.org.co") return true;
    if (u.hostname === "storage.googleapis.com" && u.pathname.startsWith("/static-fedegan/")) return true;
    return u.hostname.endsWith(".supabase.co") && u.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}
