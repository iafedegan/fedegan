import test from "node:test";
import assert from "node:assert/strict";
import { permiteEmbeber } from "../src/lib/pagos-embed.ts";

const h = (obj) => new Headers(obj);
const SITIO = "https://www.fedegan.org.co";

test("hoy el sistema de pagos manda X-Frame-Options: SAMEORIGIN (dos veces) y no se puede incrustar", () => {
  const cab = new Headers();
  cab.append("x-frame-options", "SAMEORIGIN");
  cab.append("x-frame-options", "SAMEORIGIN");
  assert.equal(cab.get("x-frame-options"), "SAMEORIGIN, SAMEORIGIN");
  assert.equal(permiteEmbeber(cab, SITIO), false);
});

test("DENY y ALLOW-FROM tampoco permiten incrustar", () => {
  assert.equal(permiteEmbeber(h({ "x-frame-options": "DENY" }), SITIO), false);
  assert.equal(permiteEmbeber(h({ "x-frame-options": "ALLOW-FROM https://www.fedegan.org.co" }), SITIO), false);
});

test("sin ninguna restricción se puede incrustar", () => {
  assert.equal(permiteEmbeber(h({}), SITIO), true);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "default-src 'self'" }), SITIO), true);
});

test("frame-ancestors manda sobre X-Frame-Options", () => {
  const cab = h({ "x-frame-options": "SAMEORIGIN", "content-security-policy": "frame-ancestors 'self' https://www.fedegan.org.co https://fedegan.vercel.app" });
  assert.equal(permiteEmbeber(cab, SITIO), true);
  assert.equal(permiteEmbeber(cab, "https://fedegan.vercel.app"), true);
  assert.equal(permiteEmbeber(cab, "https://otro-sitio.com"), false);
});

test("frame-ancestors 'self' o 'none' lo impiden; * y https: lo permiten", () => {
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors 'self'" }), SITIO), false);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors 'none'" }), SITIO), false);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors *" }), SITIO), true);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors https:" }), SITIO), true);
});

test("acepta el sitio por host y por comodín de subdominios", () => {
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors www.fedegan.org.co" }), SITIO), true);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors https://*.fedegan.org.co" }), SITIO), true);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors *.vercel.app" }), "https://fedegan.vercel.app"), true);
  assert.equal(permiteEmbeber(h({ "content-security-policy": "frame-ancestors https://*.fedegan.org.co" }), "https://fedegan.org.co.evil.com"), false);
});

test("con varias políticas, todas las que traen frame-ancestors deben admitirnos", () => {
  const cab = h({ "content-security-policy": "frame-ancestors https://www.fedegan.org.co, frame-ancestors 'self'" });
  assert.equal(permiteEmbeber(cab, SITIO), false);
});
