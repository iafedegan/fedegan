// Roles esperados en el token de Microsoft Entra ID (claim "roles", definidos como App roles
// del registro de la aplicación). Se pueden renombrar aquí sin tocar el resto del código.
export const ROLES = {
  funcionario: "funcionario",
  portalEditor: "portal.editor",
  portalAdmin: "portal.admin",
  contextoEditor: "contexto.editor",
  contextoAdmin: "contexto.admin",
} as const;

export type AppEntry = {
  id: string;
  nombre: string;
  descripcion: string;
  href: string;
  external?: boolean;
  icon: "shield" | "newspaper";
  anyOf: string[];
};

export const apps: AppEntry[] = [
  {
    id: "portal-admin",
    nombre: "Administrar portal FEDEGÁN",
    descripcion: "Contenido, menús y bloques del portal institucional.",
    href: "/admin",
    icon: "shield",
    anyOf: [ROLES.portalAdmin, ROLES.portalEditor],
  },
  {
    id: "contexto-admin",
    nombre: "Administrar CONtexto Ganadero",
    descripcion: "Panel editorial: notas, categorías, boletín y claves de API.",
    href: "https://contexto-olive.vercel.app/panel",
    external: true,
    icon: "newspaper",
    anyOf: [ROLES.contextoAdmin, ROLES.contextoEditor],
  },
];

export function appsForRoles(roles: string[] | undefined) {
  const set = new Set(roles ?? []);
  return apps.filter((a) => a.anyOf.some((r) => set.has(r)));
}

export function hasAnyRole(roles: string[] | undefined, allowed: string[]) {
  const set = new Set(roles ?? []);
  return allowed.some((r) => set.has(r));
}

// Cuentas ficticias de la demostración (no existen en Azure ni piden contraseña).
export const demoProfiles = [
  { id: "funcionario", nombre: "Laura Gómez", email: "laura.gomez@fedegan.org.co", cargo: "Analista de Tecnología", roles: [ROLES.funcionario] },
  { id: "editor-contexto", nombre: "Carlos Rojas", email: "carlos.rojas@fedegan.org.co", cargo: "Editor de CONtexto Ganadero", roles: [ROLES.funcionario, ROLES.contextoEditor] },
  { id: "admin-portal", nombre: "Andrea Pardo", email: "andrea.pardo@fedegan.org.co", cargo: "Administradora del portal", roles: [ROLES.funcionario, ROLES.portalAdmin] },
  { id: "superadmin", nombre: "Equipo de Tecnología", email: "tecnologia@fedegan.org.co", cargo: "Superadministrador", roles: [ROLES.funcionario, ROLES.portalAdmin, ROLES.contextoAdmin] },
] as const;
