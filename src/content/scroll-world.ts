// Fotos reales de finca ganadera para el recorrido de la home, por id de local del directorio.
// Reemplazan a la foto propia del local cuando esta no es de finca (p. ej. oficinas o plantas).
export interface JourneyPhoto {
  src: string;
  pos: string;
  alt: string;
}

export const journeyPhotos: Record<string, JourneyPhoto> = {
  programas: {
    src: "/locales/programas.jpg",
    pos: "62% 50%",
    alt: "Ganadero con ruana observando su hato de cebú en un potrero al atardecer",
  },
  normatividad: {
    src: "/journey/normatividad.jpg",
    pos: "50% 50%",
    alt: "Escritorio con códigos de leyes y una balanza de la justicia, junto a una ventana con ganado en el potrero",
  },
  publicaciones: {
    src: "/locales/publicaciones.jpg",
    pos: "60% 50%",
    alt: "Ganadero junto a su hato con informes y certificados de sostenibilidad sobre una mesa de campo",
  },
  cifras: {
    src: "/locales/cifras.jpg",
    pos: "45% 50%",
    alt: "Vaca holstein en una sala de ordeño robotizada con pantalla de datos de producción",
  },
  fng: {
    src: "/locales/fng.jpg",
    pos: "50% 50%",
    alt: "Ganadero y funcionario atendiendo una res en el corral de una finca",
  },
  fep: {
    src: "/headers/campo.jpg",
    pos: "50% 62%",
    alt: "Vacas pastando en un potrero con cerca de alambre y árboles",
  },
  sig: {
    src: "/locales/sig.jpg",
    pos: "45% 50%",
    alt: "Ganadero llenando un tanque de agua junto a un silo, con hato y montañas al fondo",
  },
};
