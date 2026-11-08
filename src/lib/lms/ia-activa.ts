import "server-only";
import { credencialIA } from "@/lib/ia";

/** ¿Hay una clave de Claude o de Gemini (cargada en Conexiones o en el entorno) para el asistente y el Studio? */
export async function iaActiva(): Promise<boolean> {
  return Boolean((await credencialIA("claude")).key || (await credencialIA("gemini")).key);
}
