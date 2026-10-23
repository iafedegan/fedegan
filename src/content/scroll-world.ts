// Fotos reales de finca ganadera para el recorrido de la home, por id de local del directorio.
// Reemplazan a la foto propia del local cuando esta no es de finca (p. ej. oficinas o plantas).
export interface JourneyPhoto {
  src: string;
  pos: string;
  alt: string;
}

export const journeyPhotos: Record<string, JourneyPhoto> = {
  programas: {
    src: "/journey/programas.jpg",
    pos: "50% 50%",
    alt: "Ganadero con ruana observando su hato en un potrero verde de la cordillera al atardecer",
  },
  normatividad: {
    src: "/journey/normatividad.jpg",
    pos: "50% 50%",
    alt: "Escritorio con códigos de leyes y una balanza de la justicia, junto a una ventana con ganado en el potrero",
  },
  publicaciones: {
    src: "/journey/publicaciones.jpg",
    pos: "50% 50%",
    alt: "Ganadero revisando informes y cuadernos técnicos en una mesa de campo, con el hato al fondo",
  },
  cifras: {
    src: "/journey/cifras.jpg",
    pos: "50% 50%",
    alt: "Vaca holstein en una sala de ordeño robotizada con una pantalla de datos de producción",
  },
  fng: {
    src: "/journey/fng.jpg",
    pos: "50% 50%",
    alt: "Ganadero y técnico veterinario atendiendo una res en un corral de madera",
  },
  fep: {
    src: "/journey/fep.jpg",
    pos: "50% 50%",
    alt: "Novillos pastando en un valle verde con un camión ganadero al fondo del camino",
  },
  sig: {
    src: "/journey/sig.jpg",
    pos: "50% 50%",
    alt: "Inspector de calidad con casco y tablet revisando los corrales de una finca ganadera",
  },
};
