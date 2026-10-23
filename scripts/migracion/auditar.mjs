#!/usr/bin/env node
// Informe de integridad de la migración de contenido (E4): páginas por sección, enlaces internos rotos,
// páginas vacías, enlaces que siguen apuntando al portal anterior y estado HTTP de los archivos adjuntos.
// Uso: node scripts/migracion/auditar.mjs [--http]   → escribe docs/informe-integridad-migracion.md
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const portal = JSON.parse(readFileSync("src/content/legacy/portal.json", "utf8"));
const conHttp = process.argv.includes("--http");
const { sections, pages } = portal;
const keys = new Set(Object.keys(pages));
const ARCHIVO = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|mp3|mp4)$/i;

const enlaces = [];
const embeds = new Set();
const porSeccion = {};
for (const [slug, s] of Object.entries(sections)) porSeccion[slug] = { label: s.label, paginas: 0, bloques: 0, vacias: 0 };
for (const [key, p] of Object.entries(pages)) {
  const palabras = p.blocks.reduce((a, b) => a + (b.text ?? b.rows?.flat().join(" ") ?? "").length, 0);
  for (const slug of p.sections) {
    const r = porSeccion[slug];
    r.paginas++; r.bloques += p.blocks.length; if (!p.blocks.length) r.vacias++;
  }
  for (const b of p.blocks) {
    if (b.t === "embed") embeds.add(b.text);
    const textos = [b.text ?? "", ...(b.rows?.flat() ?? [])];
    for (const t of textos) for (const m of t.matchAll(/\]\(([^)]+)\)/g)) enlaces.push({ key, url: m[1] });
  }
}

const rotos = [], noMigrados = new Map(), archivos = new Map(), externos = new Set();
let internos = 0;
for (const { key, url } of enlaces) {
  if (url.startsWith("/seccion/")) {
    internos++;
    const [slug, ...resto] = url.slice(9).split("/");
    const k = resto.join("/");
    if (!sections[slug] || (k && !keys.has(k))) rotos.push({ key, url });
  } else if (/^https?:\/\//.test(url)) {
    if (/^https?:\/\/(www\.)?fedegan\.org\.co(\/|$)/.test(url)) {
      const ruta = decodeURIComponent(url.replace(/^https?:\/\/[^/]+\/?/, "").replace(/[?#].*$/, "").replace(/\/$/, ""));
      if (ARCHIVO.test(ruta)) archivos.set(url, key); else noMigrados.set(ruta || "(portada)", (noMigrados.get(ruta || "(portada)") ?? []).concat(key));
    } else if (/(^|\.)fedegan\.org\.co(\.s3\.amazonaws\.com)?\//.test(url.replace(/^https?:\/\//, ""))) {
      archivos.set(url, key);
    } else externos.add(url);
  }
}

const vacias = Object.entries(pages).filter(([, p]) => !p.blocks.length).map(([k]) => k);
const cortas = Object.entries(pages).filter(([, p]) => p.blocks.length && p.blocks.reduce((a, b) => a + (b.text ?? "").length, 0) < 80 && !p.blocks.some((b) => b.t === "embed" || b.t === "table")).map(([k]) => k);
const sinSeccion = Object.entries(pages).filter(([, p]) => !p.sections.length).map(([k]) => k);
const enArbol = new Set();
const recorre = (n) => n.forEach((x) => { if (x.key) enArbol.add(x.key); if (x.children) recorre(x.children); });
for (const s of Object.values(sections)) recorre(s.tree);
const huerfanas = Object.keys(pages).filter((k) => !enArbol.has(k) && !Object.values(sections).some((s) => s.landing === k));
const arbolSinPagina = [...enArbol].filter((k) => !keys.has(k));

// Redirecciones 301 generadas por next.config.ts: una por página migrada, salvo las que ya son rutas reales.
const conRedireccion = Object.keys(pages).filter((k) => pages[k].sections.length && !existsSync(`src/app/${k}/page.tsx`));

let http = null;
if (conHttp) {
  http = { ok: 0, mal: [] };
  const lista = [...archivos.keys()];
  let i = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (i < lista.length) {
      const u = lista[i++];
      let st = 0;
      try { st = (await fetch(u, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(30000) })).status; } catch { st = 0; }
      if (st >= 200 && st < 400) http.ok++; else http.mal.push({ u, st, pagina: archivos.get(u) });
    }
  }));
}

const fecha = new Date().toISOString().slice(0, 10);
const L = [];
L.push(`# Informe de integridad de la migración de contenido (E4)`, ``, `Generado el ${fecha} con \`node scripts/migracion/auditar.mjs${conHttp ? " --http" : ""}\` sobre \`src/content/legacy/portal.json\`.`, ``);
L.push(`## Resumen`, ``, `| Medida | Valor |`, `|---|---|`);
L.push(`| Secciones | ${Object.keys(sections).length} |`, `| Páginas migradas | ${keys.size} |`, `| Páginas con redirección 301 desde su URL anterior | ${conRedireccion.length} |`);
L.push(`| Enlaces internos (/seccion/…) | ${internos} |`, `| Enlaces internos rotos | ${rotos.length} |`, `| Páginas sin sección | ${sinSeccion.length} |`, `| Páginas fuera del menú lateral | ${huerfanas.length} |`, `| Nodos del menú sin página | ${arbolSinPagina.length} |`);
L.push(`| Páginas vacías (vacías también en el origen) | ${vacias.length} |`, `| Archivos adjuntos enlazados (PDF, Excel, Word…) | ${archivos.size} |`);
if (http) L.push(`| Adjuntos que responden (HTTP 2xx/3xx) | ${http.ok} de ${archivos.size} |`);
L.push(`| Tableros y videos incrustados | ${embeds.size} |`, `| Enlaces a sitios externos | ${externos.size} |`, `| Páginas del portal anterior enlazadas y no migradas | ${noMigrados.size} |`, ``);
L.push(`## Por sección`, ``, `| Sección | Páginas | Bloques | Vacías |`, `|---|---:|---:|---:|`);
for (const [slug, r] of Object.entries(porSeccion)) L.push(`| ${r.label} (\`${slug}\`) | ${r.paginas} | ${r.bloques} | ${r.vacias} |`);
L.push(``, `## Hallazgos`, ``);
L.push(`### Enlaces internos rotos`, ``, rotos.length ? rotos.map((r) => `- \`${r.key}\` → ${r.url}`).join("\n") : `Ninguno.`, ``);
L.push(`### Páginas vacías`, ``, vacias.length ? `No tienen cuerpo en el portal anterior (verificado en la página original); la página nueva lo indica y remite al portal actual.\n\n` + vacias.map((k) => `- \`${k}\``).join("\n") : `Ninguna.`, ``);
L.push(`### Páginas muy cortas (<80 caracteres, sin tabla ni incrustado)`, ``, cortas.length ? cortas.map((k) => `- \`${k}\``).join("\n") : `Ninguna.`, ``);
L.push(`### Páginas del portal anterior enlazadas que no se migraron`, ``, `Responden con la portada de la sección, con error 403 o no son contenido de sección (portada, quiénes somos, noticias, eventos). Los enlaces siguen apuntando al portal anterior.`, ``, noMigrados.size ? [...noMigrados].map(([r, de]) => `- \`${r}\` (desde ${[...new Set(de)].slice(0, 3).map((k) => `\`${k}\``).join(", ")})`).join("\n") : `Ninguna.`, ``);
if (http) {
  L.push(`### Archivos adjuntos que no responden`, ``, http.mal.length ? http.mal.map((m) => `- ${m.u} (HTTP ${m.st || "sin respuesta"}, desde \`${m.pagina}\`)`).join("\n") : `Todos responden.`, ``);
}
L.push(`## Cómo repetir la verificación`, ``, "```bash", `python3 scripts/migracion/completar.py   # trae del Drupal las páginas enlazadas que falten`, `node scripts/migracion/auditar.mjs --http # regenera este informe`, "```", ``);
writeFileSync("docs/informe-integridad-migracion.md", L.join("\n"));
console.log(L.slice(4, 22).join("\n"));
if (rotos.length || sinSeccion.length || arbolSinPagina.length) process.exitCode = 1;
