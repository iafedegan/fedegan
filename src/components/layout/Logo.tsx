import Link from "next/link";
import Image from "next/image";

export function Logo({
  className = "",
  imgClassName = "h-9 w-auto",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href="/" className={`flex shrink-0 items-center gap-2.5 ${className}`} aria-label="Fedegán, inicio">
      <Image
        src="/brand/fedegan-horizontal-blanco.svg"
        alt="FEDEGÁN, Federación Colombiana de Ganaderos"
        width={1071}
        height={385}
        priority
        unoptimized
        className={`object-contain shrink-0 ${imgClassName}`}
      />
    </Link>
  );
}
