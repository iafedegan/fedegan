// Exporta el contenido del CMS a archivos JSON (y, con --archivos, los PDF e imágenes del bucket «media»).
// Es la copia de salida del TDR §7 («posibilidad de exportación de contenido y activos»): sirve de respaldo
// o para llevar el contenido a otra plataforma.
//
//   npm run exportar              # tablas del CMS
//   npm run exportar -- --archivos # además descarga los archivos subidos
//
// Variables (de .env.local o del entorno): SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
// Sin la clave de servicio solo se exporta lo publicado (clave pública). Las claves de API guardadas
// en el panel (site_settings → api_secret:*) NUNCA se exportan.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function cargarEnv() {
  if (!existsSync(".env.local")) return;
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
cargarEnv();

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publica = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const key = servicio ?? publica;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL y una clave (SUPABASE_SERVICE_ROLE_KEY o SUPABASE_PUBLISHABLE_KEY).");
  process.exit(2);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const conArchivos = process.argv.includes("--archivos");

const hoy = new Date().toISOString().slice(0, 10);
const salida = join("exportacion", hoy);
mkdirSync(salida, { recursive: true });

const tablas = ["locales", "stats", "publications", "events", "faqs", "partners", "nav_items", "site_settings", "audit_log"];
const resumen = {};
for (const t of tablas) {
  const res = await fetch(`${url}/rest/v1/${t}?select=*`, { headers });
  if (!res.ok) {
    resumen[t] = `omitida (${res.status})`;
    continue;
  }
  let filas = await res.json();
  if (t === "site_settings") filas = filas.filter((f) => !String(f.key).startsWith("api_secret:"));
  writeFileSync(join(salida, `${t}.json`), JSON.stringify(filas, null, 2));
  resumen[t] = filas.length;
}

if (conArchivos) {
  const dirArchivos = join(salida, "media");
  const listar = async (prefijo) => {
    const res = await fetch(`${url}/storage/v1/object/list/media`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: prefijo, limit: 1000 }),
    });
    return res.ok ? res.json() : [];
  };
  let n = 0;
  const recorrer = async (prefijo) => {
    for (const o of await listar(prefijo)) {
      const ruta = prefijo ? `${prefijo}/${o.name}` : o.name;
      if (!o.id) {
        await recorrer(ruta); // carpeta
        continue;
      }
      const r = await fetch(`${url}/storage/v1/object/public/media/${ruta}`);
      if (!r.ok) continue;
      const destino = join(dirArchivos, ruta);
      mkdirSync(join(destino, ".."), { recursive: true });
      writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      n++;
    }
  };
  await recorrer("");
  resumen.archivos = n;
}

writeFileSync(join(salida, "LEEME.txt"), `Exportación del CMS del portal FEDEGÁN–FNG\nFecha: ${hoy}\nAlcance: ${servicio ? "completo (clave de servicio)" : "solo contenido publicado (clave pública)"}\n${JSON.stringify(resumen, null, 2)}\n`);
console.log(`Exportado en ${salida}/`, resumen);
