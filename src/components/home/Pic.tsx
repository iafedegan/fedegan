import Image from "next/image";
import { canOptimize } from "@/lib/image-host";

/** Foto que llena a su contenedor (que debe tener position: relative). */
export function Pic({ src, alt = "", pos = "50% 50%", sizes = "(min-width: 1024px) 33vw, 100vw", priority = false, className = "" }: { src: string; alt?: string; pos?: string; sizes?: string; priority?: boolean; className?: string }) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!canOptimize(src)} className={`object-cover ${className}`} style={{ objectPosition: pos }} />;
}
