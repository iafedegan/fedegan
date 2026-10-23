import NextAuth, { type DefaultSession } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { demoProfiles } from "@/lib/access";
import { adminDb } from "@/lib/cms/client";
import { verifyPassword } from "@/lib/lms/password";

declare module "next-auth" {
  interface Session {
    user: { roles: string[] } & DefaultSession["user"];
  }
}

export const entraConfigured = Boolean(
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
);

// Modo demostración: ingreso simulado con cuentas ficticias, sin contraseñas. Es opt-in:
// solo se activa con AUTH_DEMO_MODE=true y debe quitarse al conectar Azure real.
export const demoEnabled = process.env.AUTH_DEMO_MODE === "true";

const providers = [];

if (entraConfigured) {
  providers.push(MicrosoftEntraID({ id: "microsoft-entra-id" }));
}

if (demoEnabled) {
  providers.push(
    Credentials({
      id: "demo",
      name: "Modo demostración",
      credentials: { profile: {} },
      authorize(credentials) {
        const p = demoProfiles.find((d) => d.id === credentials?.profile);
        if (!p) return null;
        return { id: `demo-${p.id}`, name: p.nombre, email: p.email, roles: [...p.roles] } as never;
      },
    }),
  );
}

// Ingreso de ganaderos y aliados (Escuela Virtual): correo y contraseña propios, con bloqueo breve tras varios intentos fallidos.
providers.push(
  Credentials({
    id: "ganadero",
    name: "Ganaderos y aliados",
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const db = adminDb();
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!db || !email || !password) return null;
      const { data } = await db.from("lms_accounts").select("*").eq("email", email).maybeSingle();
      if (!data) return null;
      if (data.locked_until && new Date(data.locked_until) > new Date()) return null;
      if (!(await verifyPassword(password, String(data.password_hash)))) {
        const failed = (data.failed_count ?? 0) + 1;
        await db.from("lms_accounts").update({ failed_count: failed >= 5 ? 0 : failed, locked_until: failed >= 5 ? new Date(Date.now() + 10 * 60_000).toISOString() : null }).eq("email", email);
        return null;
      }
      if (data.failed_count) await db.from("lms_accounts").update({ failed_count: 0, locked_until: null }).eq("email", email);
      return { id: `gan-${email}`, name: String(data.name), email, roles: [String(data.kind)] } as never;
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/ingresar" },
  callbacks: {
    jwt({ token, user, profile }) {
      const t = token as typeof token & { roles?: string[] };
      if (user && "roles" in user) t.roles = (user as { roles: string[] }).roles;
      if (profile && Array.isArray((profile as { roles?: unknown }).roles)) {
        t.roles = (profile as { roles: string[] }).roles;
      }
      return t;
    },
    session({ session, token }) {
      session.user.roles = (token as { roles?: string[] }).roles ?? [];
      return session;
    },
  },
});
