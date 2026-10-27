// Verifica en un sitio desplegado que cada URL antigua responde 301 a su nueva ruta y que esta carga (200).
// Uso: node --experimental-strip-types scripts/verificar-redirecciones.mjs https://fedegan.vercel.app
import { readFileSync } from "node:fs";
import { buildLegacyRedirects, servedPaths } from "../src/content/legacy/redirects.ts";

const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base) {
  console.error("Indique la URL base, por ejemplo: https://fedegan.vercel.app");
  process.exit(2);
}
const data = JSON.parse(readFileSync(new URL("../src/content/legacy/portal.json", import.meta.url), "utf8"));
const list = buildLegacyRedirects(data, servedPaths(new URL("../src/app", import.meta.url).pathname));

const fallos = [];
let i = 0;
const worker = async () => {
  while (i < list.length) {
    const r = list[i++];
    try {
      const a = await fetch(base + r.source, { redirect: "manual" });
      const loc = a.headers.get("location") ?? "";
      if (a.status !== 301 || !loc.endsWith(r.destination)) {
        fallos.push(`${r.source}: esperaba 301 → ${r.destination}, llegó ${a.status} ${loc}`);
        continue;
      }
      const b = await fetch(base + r.destination, { redirect: "manual" });
      if (b.status !== 200) fallos.push(`${r.destination}: destino responde ${b.status}`);
    } catch (e) {
      fallos.push(`${r.source}: ${e.message}`);
    }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

console.log(`${list.length - fallos.length}/${list.length} redirecciones correctas en ${base}`);
if (fallos.length) {
  console.log(fallos.slice(0, 30).join("\n"));
  process.exit(1);
}
