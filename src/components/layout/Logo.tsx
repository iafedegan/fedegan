import Link from "next/link";
import Image from "next/image";

export function Logo({
  className = "",
  imgClassName = "w-10 h-10",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Fedegán, inicio">
      <Image
        src="/brand/fedegan-logo.jpg"
        alt="FEDEGÁN, Federación Colombiana de Ganaderos"
        width={80}
        height={80}
        priority
        className={`rounded-[var(--radius-sm)] object-cover shrink-0 ${imgClassName}`}
      />
      <span className="flex flex-col leading-none">
        <span className="font-[var(--font-display)] font-extrabold text-xl tracking-tight text-[var(--fg-green-800)]">
          FEDEGÁN <span className="text-[var(--fg-lime-500)]">FNG</span>
        </span>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Federación Colombiana de Ganaderos
        </span>
      </span>
    </Link>
  );
}
