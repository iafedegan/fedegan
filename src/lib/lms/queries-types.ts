// Tipos y etiquetas compartidos (sin dependencias de servidor).
export type Level = "basico" | "intermedio" | "avanzado";
export const LEVELS: Record<Level, string> = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" };

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  learnPoints: string[];
  requirements: string[];
  category: string;
  level: Level;
  instructor: string;
  instructorBio: string;
  cover: string | null;
  promoVideo: string | null;
  certificate: boolean;
  externalUrl: string | null;
  externalVideos: number;
  lessons: number;
  videos: number;
  minutes: number;
  rating: number;
  ratings: number;
};

