import { publicDb } from "@/lib/cms/client";

export const dynamic = "force-dynamic";

// Estado del portal para monitoreo externo (UptimeRobot, Better Stack, Vercel Alerts…): 200 si todo responde,
// 503 si el CMS configurado no contesta. El detalle no expone secretos.
export async function GET() {
  const t0 = Date.now();
  const db = publicDb();
  let cms: "ok" | "sin-configurar" | "error" = "sin-configurar";
  if (db) {
    try {
      const { error } = await db.from("faqs").select("question", { head: true, count: "exact" }).limit(1);
      cms = error ? "error" : "ok";
    } catch {
      cms = "error";
    }
  }
  const ok = cms !== "error";
  return Response.json(
    { ok, cms, build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "local", ms: Date.now() - t0 },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
