// Genera con Gemini las fotos del recorrido de la home, una por escena, acordes a su título.
// Uso:  node --env-file=.env.local scripts/generar-imagenes.mjs [id ...]     (sin ids = todas)
// La clave sale de GEMINI_API_KEY (archivo .env.local, que git ignora). Las imágenes quedan en public/journey/.
import { mkdir, writeFile } from "node:fs/promises";

const MODELO = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("Falta GEMINI_API_KEY (ponla en .env.local).");
  process.exit(1);
}

const ESTILO =
  "Fotografía documental realista, luz natural cálida, color auténtico, calidad editorial de revista, " +
  "composición horizontal 16:9 con espacio libre a los lados para superponer texto. Ambiente rural colombiano. " +
  "Sin texto legible, sin letras, sin logotipos, sin marcas de agua, sin pantallas con interfaces; personas de espaldas o de perfil, sin rostros reconocibles.";

const ESCENAS = {
  programas: "Productor ganadero con ruana y sombrero observando su hato de cebú en un potrero verde al atardecer, cerca de alambre, montañas al fondo; sensación de ganadería sostenible y cuidado del campo.",
  normatividad: "Escritorio de madera en una oficina rural con libros de leyes encuadernados en cuero, una pequeña balanza de la justicia de bronce y carpetas de expedientes; por la ventana se ve un potrero con ganado al fondo; sensación de marco legal y seriedad institucional.",
  publicaciones: "Mesa de madera de campo con informes impresos, gráficos y cuadernos técnicos; un ganadero de perfil revisa un documento con el hato pastando al fondo; sensación de biblioteca y conocimiento técnico del sector.",
  cifras: "Sala de ordeño moderna con una vaca holstein y un brazo robótico de ordeño, al fondo una pantalla difusa con gráficas luminosas azul-verdosas sin texto; sensación de datos y tecnología ganadera.",
  fng: "Ganadero y un técnico veterinario de perfil atendiendo una res con cuidado en un corral de madera, jornada de sanidad en finca; sensación de inversión del gremio en el productor.",
  fep: "Lote de novillos gordos en un potrero amplio al amanecer, con un camión ganadero al fondo en el camino; sensación de mercado estable y precios justos.",
  sig: "Inspector de calidad con casco y chaleco, de espaldas, revisando con una tablet un corral limpio y ordenado de una finca ganadera moderna; sensación de calidad, procesos y certificación.",
  tvgan: "Equipo de televisión rural: un camarógrafo de espaldas con cámara de hombro y un periodista de perfil con micrófono grabando en un potrero con ganado y montañas al atardecer; sensación de televisión del campo.",
  fundagan: "Familia campesina colombiana de espaldas, sonriendo, caminando junto a un técnico de campo y un niño con su ternero en una vereda verde; sensación de responsabilidad social, comunidad y acompañamiento a las familias ganaderas.",
  bursagan: "Corral de subasta ganadera moderno con novillos y compradores de sombrero de espaldas apoyados en la baranda, luz de media mañana; sensación de comercio y bolsa de ganado, sin carteles legibles.",
  "maestro-de-la-carne": "Mesa de madera con cortes de carne de res frescos y bien presentados, cuchillo de chef, hierbas y sal gruesa; un maestro carnicero con delantal de perfil cortando con precisión; sensación de calidad, cocina colombiana y mesa familiar.",
  "colombian-beef": "Ganado de pasto en una pradera exuberante y muy verde de Colombia al amanecer, novillos gordos y sanos con neblina entre colinas; sensación de carne grass-fed de exportación y calidad premium.",
  "curso-01": "Ganadero mayor con sombrero y ruana enseñando a un joven un potrero de hacienda tradicional colombiana con casa de campo y ganado; sensación de historia, tradición y cultura sanitaria de la ganadería colombiana.",
  "curso-02": "Potrero verde y exuberante con ganado pastando en rotación, cercas eléctricas, pacas de heno y un tractor al fondo; un ganadero revisa el pasto con la mano; sensación de manejo de praderas y buena alimentación animal.",
  "curso-03": "Sistema silvopastoril: ganado descansando a la sombra de árboles nativos dentro del potrero, un arroyo cristalino y paneles solares pequeños al fondo; sensación de ganadería sostenible y cuidado del medio ambiente.",
  "curso-04": "Veterinario con guantes y overol examinando con cuidado a un ternero en un corral limpio, con botiquín de primeros auxilios abierto en una caja de madera; sensación de salud animal y atención oportuna.",
  "curso-05": "Técnico con tanque de nitrógeno líquido y equipo de inseminación artificial junto a una vaca cebú de excelente genética en un corral; al fondo un toro reproductor de buena conformación; sensación de mejoramiento genético y reproducción.",
  "curso-06": "Tres grupos de ganado en etapas distintas en un mismo paisaje de pradera: vaca con su ternero recién nacido en primer plano, novillas jóvenes en el medio y novillos gordos al fondo; sensación de ciclo completo cría, levante y ceba.",
  "curso-07": "Mesa rústica de madera con una lechera de aluminio, leche fresca en vasos, quesos campesinos y cortes frescos de carne de res; ordeño manual al fondo desenfocado; sensación de productos de la ganadería, leche y carne.",
  "curso-08": "Administrador de finca ganadera de perfil con tablet y libreta registrando animales mientras un vaquero arrea el ganado en el corral; sensación de registros, administración, recurso humano y gestión de la finca.",
  "curso-09": "Dos vacas de razas distintas lado a lado en un potrero: una holstein blanca y negra de leche y una cebú Brahman gris de carne, con montañas de fondo; sensación de razas bovinas del trópico alto y bajo.",
  "curso-10": "Búfalos de agua oscuros con grandes cuernos curvos descansando y bañándose en un humedal tropical colombiano al amanecer, con garzas blancas; sensación de producción bufalina.",
  "curso-11": "Ganadero y auditor de certificación revisando con una tablet un corral limpio y ordenado, con arete de identificación en la oreja de una res (sin números legibles) y entorno verde de finca certificada; sensación de buenas prácticas ganaderas, trazabilidad, bienestar animal y sello ambiental.",
};

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ESCENAS);
await mkdir("public/journey", { recursive: true });
await mkdir("public/cursos", { recursive: true });

for (const id of ids) {
  const escena = ESCENAS[id];
  if (!escena) {
    console.error(`Escena desconocida: ${id}`);
    continue;
  }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${escena}\n\n${ESTILO}` }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`${id}: error ${res.status} ${data.error?.message ?? ""}`);
    continue;
  }
  const parte = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!parte) {
    console.error(`${id}: la respuesta no trajo imagen`, JSON.stringify(data).slice(0, 200));
    continue;
  }
  const ext = parte.inlineData.mimeType.includes("jpeg") ? "jpg" : "png";
  const destino = id.startsWith("curso-") ? `public/cursos/${id}.${ext}` : `public/journey/${id}.${ext}`;
  await writeFile(destino, Buffer.from(parte.inlineData.data, "base64"));
  console.log(`${id}: ${destino}`);
}
