import { HomeView } from "@/components/home/HomeView";
import { getPublishedDesign } from "@/lib/design/store";

// Portada: según la plantilla publicada (Admin → Diseño → Plantilla) cambia la composición completa de la página.
export default async function Home() {
  const design = await getPublishedDesign();
  return <HomeView kind={design.template ?? "clasico"} design={design} />;
}
