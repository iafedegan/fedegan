import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDesign, designCss, EMPTY_DESIGN, isEmptyDesign } from "../src/lib/design/regions.ts";

test("un valor que no es objeto da el diseño vacío", () => {
  for (const raw of [null, undefined, 5, "x", []]) {
    const d = normalizeDesign(raw);
    assert.equal(isEmptyDesign(d), true);
    assert.deepEqual(d.regions, EMPTY_DESIGN.regions);
  }
});

test("rechaza colores que intentan inyectar CSS", () => {
  const d = normalizeDesign({ regions: { body: { bg: "red;}body{display:none", fg: "#ffffff" } } });
  assert.equal(d.regions.body?.bg, undefined);
  assert.ok(!designCss(d).includes("display:none"));
});

test("el enlace de la ventana emergente no admite javascript:", () => {
  const d = normalizeDesign({ popup: { on: true, title: "Aviso", ctaHref: "javascript:alert(1)" } });
  assert.ok(!String(d.popup.ctaHref ?? "").toLowerCase().includes("javascript:"));
});

test("limita y depura la lista de orden", () => {
  const d = normalizeDesign({ order: ["a", "a", "b", "mal id!", ...Array.from({ length: 40 }, (_, i) => `x${i}`)] });
  assert.equal(new Set(d.order).size, d.order.length);
  assert.ok(!d.order.includes("mal id!"));
  assert.ok(d.order.length <= 24);
});
