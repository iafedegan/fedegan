import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";

export const EDITOR_ROLES: string[] = [ROLES.portalAdmin, ROLES.portalEditor];

/** Devuelve el usuario si puede editar el portal; si no, null (sin sesión redirige al ingreso). */
export async function getEditor() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");
  const ok = hasAnyRole(session.user.roles, EDITOR_ROLES);
  return ok ? { actor: session.user.email ?? session.user.name ?? "editor" } : null;
}
