import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** Contraseña con sal aleatoria (scrypt): `salt:hash` en base64. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("base64")}:${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [s, h] = stored.split(":");
  if (!s || !h) return false;
  const expected = Buffer.from(h, "base64");
  const key = await scrypt(password, Buffer.from(s, "base64"), expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}
