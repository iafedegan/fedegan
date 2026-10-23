import "server-only";
import QRCode from "qrcode";
import { headers } from "next/headers";

/** Código QR en SVG (tinta verde oscura, fondo transparente). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 0, color: { dark: "#11271d", light: "#00000000" } });
}

/** Dirección pública del sitio, tomada de la propia petición (sirve en vercel.app y en el dominio final). */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
