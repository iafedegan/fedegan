import { redirect } from "next/navigation";

// «Mis cursos» ahora vive dentro del perfil del estudiante.
export default function MyCoursesRedirect() {
  redirect("/escuela-virtual/perfil");
}
