import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

// Cifrado de claves de API guardadas desde el panel (AES-256-GCM).
// La llave sale de AUTH_SECRET: si ese valor cambia, las claves guardadas dejan de poder leerse
// y hay que volver a cargarlas desde /admin/apis.

const SECRET = process.env.AUTH_SECRET;
export const secretsAvailable = Boolean(SECRET);

function key(): Buffer {
  return Buffer.from(hkdfSync("sha256", SECRET as string, "fedegan-portal", "api-secrets-v1", 32));
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptSecret(token: string): string | null {
  try {
    const [v, iv, tag, data] = token.split(".");
    if (v !== "v1" || !iv || !tag || !data) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
