import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminNav } from "@/lib/cms/nav";
import { EDITOR_ROLES } from "@/lib/cms/guard";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");
  const roles = session.user.roles;

  if (!hasAnyRole(roles, EDITOR_ROLES)) {
    return (
      <div data-theme="institucional" className="ad-shell flex items-center justify-center p-6">
        <div className="ad-card flex max-w-md flex-col items-start gap-4 p-8">
          <ShieldAlert size={26} className="text-[#b08f4f]" />
          <h1 className="text-2xl font-bold">Sin permiso para esta aplicación</h1>
          <p className="leading-relaxed text-[#5d6e65]">
            Su perfil no incluye la administración del portal. Solicite el rol correspondiente al área de Tecnología.
          </p>
          <Link href="/mi-fedegan" className="ad-btn ad-btn-primary">Volver a mis aplicaciones</Link>
        </div>
      </div>
    );
  }

  const user = {
    name: session.user.name ?? session.user.email ?? "Editor",
    email: session.user.email ?? "",
    role: roles.includes(ROLES.portalAdmin) ? "Administrador del portal" : "Editor del portal",
  };

  return (
    <div data-theme="institucional" className="ad-shell flex flex-col lg:flex-row">
      <AdminSidebar user={user} groups={adminNav} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
