import test from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET = "clave-de-prueba-0123456789";
const { encryptSecret, decryptSecret, secretsAvailable } = await import("../src/lib/cms/secrets.ts");

test("cifra y descifra una clave de API", () => {
  assert.equal(secretsAvailable, true);
  const token = encryptSecret("cg_live_abc123");
  assert.ok(token.startsWith("v1."));
  assert.ok(!token.includes("cg_live_abc123"));
  assert.equal(decryptSecret(token), "cg_live_abc123");
});

test("dos cifrados del mismo texto son distintos (IV aleatorio)", () => {
  assert.notEqual(encryptSecret("igual"), encryptSecret("igual"));
});

test("un token alterado o inválido no se descifra", () => {
  const token = encryptSecret("secreto");
  assert.equal(decryptSecret(token.slice(0, -4) + "AAAA"), null);
  assert.equal(decryptSecret("v1.x.y"), null);
  assert.equal(decryptSecret(""), null);
});
