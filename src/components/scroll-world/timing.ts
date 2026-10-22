const DWELL = 0.7;

// Frena el avance cerca de cada escena (k = escenas - 1) para que la cámara se asiente
// justo donde el texto se lee. warp(i / k) === i / k: las paradas caen en posiciones exactas.
export function warp(p: number, k: number) {
  return p - (DWELL * Math.sin(2 * Math.PI * k * p)) / (2 * Math.PI * k);
}
