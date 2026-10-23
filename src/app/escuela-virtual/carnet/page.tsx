import { redirect } from "next/navigation";

// El carnet ahora vive dentro de «Mi perfil».
export default function CarnetRedirect() {
  redirect("/escuela-virtual/perfil#carnet");
}
