import Link from "next/link";

export function TopBar() {
  return (
    <div className="bg-[var(--fg-green-900)] text-white/90">
      <div className="mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 py-1.5 text-[0.72rem] font-medium tracking-wide overflow-x-auto whitespace-nowrap">
        <span>Sistema Nacional de Identificación e Información Ganadera</span>
        <nav className="flex items-center gap-4">
          <Link href="/transparencia" className="text-white/90 hover:text-[var(--fg-lime-400)] transition-colors">
            Transparencia
          </Link>
          <Link href="/sala-de-prensa" className="text-white/90 hover:text-[var(--fg-lime-400)] transition-colors">
            Sala de prensa
          </Link>
          <Link href="/trabaje-con-nosotros" className="text-white/90 hover:text-[var(--fg-lime-400)] transition-colors">
            Trabaje con nosotros
          </Link>
        </nav>
      </div>
    </div>
  );
}
