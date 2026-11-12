import { tareasDe } from "@/lib/cms/catalogos";

// Tareas del perfil de un cargo, para que quien responde las elija en vez de escribirlas.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const tareas = tareasDe(u.searchParams.get("c") ?? "", (u.searchParams.get("area") ?? "").slice(0, 200), (u.searchParams.get("cargo") ?? "").slice(0, 200));
  return Response.json({ tareas }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
