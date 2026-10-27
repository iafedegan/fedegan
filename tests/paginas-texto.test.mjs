import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { blocksToText, textToBlocks, normalizarBloques } from "../src/lib/cms/paginas-texto.ts";

const data = JSON.parse(readFileSync(new URL("../src/content/legacy/portal.json", import.meta.url), "utf8"));

test("las 305 páginas migradas sobreviven al ida y vuelta texto ↔ bloques", () => {
  const malas = [];
  for (const [key, p] of Object.entries(data.pages)) {
    const esperado = normalizarBloques(p.blocks).filter((b) => b.t === "table" || (b.text ?? "") !== "");
    const vuelta = textToBlocks(blocksToText(p.blocks), p.blocks);
    try {
      assert.deepEqual(vuelta, esperado);
    } catch {
      malas.push(key);
    }
  }
  assert.deepEqual(malas, [], `fallan: ${malas.slice(0, 5).join(", ")}`);
});

test("sintaxis básica", () => {
  const b = textToBlocks("## Título\n\nUn párrafo con **negrita**.\n\n- uno\n- dos\n\n@video https://www.youtube.com/embed/abc\n\n\\- no es lista");
  assert.deepEqual(b, [
    { t: "h2", text: "Título" },
    { t: "p", text: "Un párrafo con **negrita**." },
    { t: "li", text: "uno" },
    { t: "li", text: "dos" },
    { t: "embed", text: "https://www.youtube.com/embed/abc" },
    { t: "p", text: "- no es lista" },
  ]);
});

test("una tabla se conserva por su número y una tabla inexistente se descarta", () => {
  const previos = [{ t: "table", rows: [["a", "b"]] }];
  assert.deepEqual(textToBlocks("{{tabla 1}}\n\n{{tabla 9}}", previos), [{ t: "table", rows: [["a", "b"]] }]);
});
