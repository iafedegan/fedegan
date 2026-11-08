import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildLegacyRedirects, servedPaths } from "../src/content/legacy/redirects.ts";

const data = JSON.parse(readFileSync(new URL("../src/content/legacy/portal.json", import.meta.url), "utf8"));
const served = servedPaths(new URL("../src/app", import.meta.url).pathname);

test("cubre casi todas las páginas migradas", () => {
  const r = buildLegacyRedirects(data, served);
  const pages = Object.keys(data.pages).length;
  assert.ok(r.length >= pages - 15, `solo ${r.length} de ${pages} páginas tienen 301`);
});

test("todas responden 301, sin duplicados ni bucles", () => {
  const r = buildLegacyRedirects(data, served);
  assert.equal(new Set(r.map((x) => x.source)).size, r.length);
  for (const x of r) {
    assert.equal(x.statusCode, 301);
    assert.ok(x.source.startsWith("/") && x.destination.startsWith("/seccion/"), `${x.source} → ${x.destination}`);
    assert.notEqual(x.source, x.destination);
  }
});

test("no pisa rutas que el portal nuevo ya sirve", () => {
  const r = buildLegacyRedirects(data, served);
  for (const x of r) assert.ok(!served.has(x.source), `${x.source} ya existe en el portal`);
  assert.ok(served.has("/programas") && served.has("/"));
});

test("un destino de sección usa la página de aterrizaje", () => {
  const demo = {
    sections: { programas: { landing: "programas" } },
    pages: { programas: { source: "https://www.fedegan.org.co/viejo/", sections: ["programas"] }, otra: { source: "https://www.fedegan.org.co/otra", sections: ["programas"] } },
  };
  const r = buildLegacyRedirects(demo, new Set(["/"]));
  assert.deepEqual(r.map((x) => [x.source, x.destination]), [["/viejo", "/seccion/programas"], ["/otra", "/seccion/programas/otra"]]);
});

test("compactar: las carpetas grandes usan una sola regla y el destino no cambia", () => {
  const completo = buildLegacyRedirects(data, served);
  const reservadas = new Set(["noticias", "publicaciones", "seccion"]);
  const corto = buildLegacyRedirects(data, served, { compactar: true, reservadas });
  assert.ok(corto.length < completo.length - 100, `${corto.length} reglas contra ${completo.length}`);
  assert.equal(new Set(corto.map((x) => x.source)).size, corto.length);
  // Cada página migrada llega al mismo destino con la lista compacta (regla exacta o regla de carpeta `/x/:path+`).
  const destinoCon = (reglas, ruta) => {
    for (const r of reglas) {
      if (r.source === ruta) return r.destination;
      if (r.source.endsWith("/:path+")) {
        const base = r.source.slice(0, -"/:path+".length) + "/";
        if (ruta.startsWith(base)) return r.destination.replace(":path+", ruta.slice(base.length));
      }
    }
    return null;
  };
  for (const r of completo) assert.equal(destinoCon(corto, r.source), r.destination, r.source);
  // no tapa carpetas del portal nuevo
  for (const x of corto) if (x.source.endsWith("/:path+")) assert.ok(!reservadas.has(x.source.split("/")[1]), x.source);
});
