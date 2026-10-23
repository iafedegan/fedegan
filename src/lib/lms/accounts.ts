"use server";

import { adminDb } from "@/lib/cms/client";
import { hashPassword } from "./password";

export type RegisterResult = { ok: true } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Crea la cuenta de un ganadero o aliado de la Escuela Virtual. */
export async function registerAccount(input: { name: string; email: string; password: string; kind: string }): Promise<RegisterResult> {
  const db = adminDb();
  if (!db) return { ok: false, error: "El registro aún no está disponible en este sitio." };
  const name = input.name.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase().slice(0, 120);
  const kind = input.kind === "aliado" ? "aliado" : input.kind === "ganadero" ? "ganadero" : "";
  if (name.length < 3) return { ok: false, error: "Escriba su nombre completo." };
  if (!EMAIL.test(email)) return { ok: false, error: "Escriba un correo válido." };
  if (!kind) return { ok: false, error: "Elija si es ganadero o aliado." };
  // Sin verificación de correo todavía: los correos institucionales no pueden registrarse aquí (evita suplantar a funcionarios).
  if (/@(.+\.)?fedegan(-fng)?\.org\.co$/i.test(email)) return { ok: false, error: "Los correos de FEDEGÁN ingresan por el portal institucional. Use un correo personal para esta cuenta." };
  if (input.password.length < 8 || input.password.length > 100) return { ok: false, error: "La contraseña debe tener entre 8 y 100 caracteres." };
  const { error } = await db.from("lms_accounts").insert({ email, name, kind, password_hash: await hashPassword(input.password) });
  if (error) return { ok: false, error: error.code === "23505" ? "Ya existe una cuenta con ese correo. Ingrese con su contraseña." : "No se pudo crear la cuenta. Intente de nuevo." };
  return { ok: true };
}
