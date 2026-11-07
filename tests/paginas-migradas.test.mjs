import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { aBloques, aElementos, sanearBloques } from "../src/lib/cms/bloques.ts";
import { mdAHtml } from "../src/components/admin/constructor/rico.ts";

// Las páginas copiadas del portal actual se editan con el mismo constructor que las nuevas: al abrirlas y guardarlas
// sin tocar nada, el contenido tiene que quedar igual (sin recortes ni pérdidas).
const portal = JSON.parse(readFileSync(new URL("../src/content/legacy/portal.json", import.meta.url), "utf8"));
const paginas = Object.entries(portal.pages);
const limpio = (s) => (s ?? "").replace(/\s+/g, " ").trim();

test("todas las páginas migradas se pueden guardar desde el constructor", () => {
  assert.ok(paginas.length > 300);
  for (const [key, p] of paginas) {
    const r = sanearBloques(p.blocks ?? []);
    assert.equal(r.ok, true, `${key}: ${r.message}`);
  }
});

test("abrir y guardar una página migrada no cambia su contenido", () => {
  for (const [key, p] of paginas) {
    const original = (p.blocks ?? []).filter((b) => b.t === "table" || b.t === "embed" || limpio(b.text));
    const guardado = sanearBloques(p.blocks ?? []).bloques;
    assert.equal(guardado.length, original.length, `${key}: cambió la cantidad de bloques`);
    original.forEach((b, i) => {
      const g = guardado[i];
      assert.equal(g.t, b.t, `${key} #${i}: cambió el tipo`);
      if (b.t === "table") assert.deepEqual(g.rows, b.rows, `${key} #${i}: cambió la tabla`);
      else assert.equal(limpio(g.text), limpio(b.text), `${key} #${i}: cambió el texto`);
    });
    // lo que el editor arma y lo que el servidor guarda es lo mismo
    assert.deepEqual(aBloques(aElementos(p.blocks ?? [])), guardado, `${key}: el editor y el servidor difieren`);
  }
});

test("el texto con negrita y enlaces se muestra formateado en el campo, sin símbolos", () => {
  assert.equal(mdAHtml("Hola **mundo**"), "Hola <strong>mundo</strong>");
  assert.equal(mdAHtml("Ver [la guía](/pagos) ya"), 'Ver <a href="/pagos">la guía</a> ya');
  assert.equal(mdAHtml("**[Tasa](https://x.co/a.pdf)**"), '<strong><a href="https://x.co/a.pdf">Tasa</a></strong>');
  assert.equal(mdAHtml("a\nb"), "a<br>b");
  assert.equal(mdAHtml("1 < 2 & 3"), "1 &lt; 2 &amp; 3");
  assert.equal(mdAHtml('[x](https://x.co/?a=1&b="2")'.replace('"2"', "2")), '<a href="https://x.co/?a=1&amp;b=2">x</a>');
  // Todo lo que el sitio entiende como negrita o enlace se convierte; lo demás (un «**» suelto de la copia original) queda como texto.
  const FORMATO = /\*\*[^*]+\*\*|\[[^\]]*\]\((?:https?:\/\/[^)\s]+|\/[^)\s]*)\)/;
  for (const [key, p] of paginas) {
    for (const b of p.blocks ?? []) {
      const t = b.text ?? "";
      if (FORMATO.test(t)) assert.match(mdAHtml(t), /<strong>|<a /, `${key}: no se convirtió el formato de «${t.slice(0, 60)}»`);
    }
  }
});
