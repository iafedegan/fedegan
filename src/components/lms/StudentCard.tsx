import Image from "next/image";

export type StudentCardData = { name: string; email: string; code: string; since: string; year: number; enrolled: number; certificates: number; qr: string };

/** Carnet de estudiante (frente y reverso), con medidas de tarjeta para imprimir. */
export function StudentCard({ d }: { d: StudentCardData }) {
  const initials = d.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const { year, since } = d;
  const me = { name: d.name, key: d.email };
  const student = { code: d.code };
  const stats = { enrolled: d.enrolled, certificates: d.certificates };
  const qr = d.qr;
  return (
    <>
          {/* Frente */}
          <article aria-label="Carnet de estudiante, frente" className="relative aspect-[1.586/1] w-full max-w-[34rem] overflow-hidden rounded-[1.1rem] border border-[#b08f4f]/60 bg-[#fbf8ee] text-[#11271d] shadow-[var(--shadow-lg)] print:shadow-none">
            <div className="flex items-center gap-3 bg-[linear-gradient(100deg,#0b4a2d,#1e3258)] px-5 py-3 text-white">
              <Image src="/brand/ucg-escudo.svg" alt="" width={1893} height={2385} unoptimized className="h-12 w-auto" />
              <div className="leading-tight">
                <p className="font-[var(--font-display)] text-xl font-bold tracking-wide">UCG</p>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#e6cf8e]">Escuela Virtual · FEDEGÁN–FNG</p>
              </div>
              <span className="ml-auto rounded-full border border-[#e6cf8e]/70 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#e6cf8e]">Estudiante</span>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-5 px-5 py-5">
              <div className="flex h-28 w-24 items-center justify-center rounded-lg border-2 border-[#b08f4f] bg-[linear-gradient(160deg,#e9e3cc,#d5cba3)] font-[var(--font-display)] text-4xl font-bold text-[#1e3258]">{initials}</div>
              <div className="min-w-0">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8a6d2f]">Nombre</p>
                <p className="break-words font-[var(--font-display)] text-2xl font-bold leading-tight">{me.name}</p>
                <p className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8a6d2f]">Carnet N.º</p>
                <p className="font-mono text-lg font-bold tracking-wider">{student.code}</p>
                <p className="mt-3 truncate text-xs text-[#4a5a52]">{me.key}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#e9e3cc]/70 px-5 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#4a5a52]">
              <span>Desde {since}</span><span>Válido {year}</span>
            </div>
            <Image src="/brand/mascota-beto.svg" alt="" width={1671} height={2388} unoptimized className="pointer-events-none absolute bottom-6 right-3 h-32 w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]" />
          </article>

          {/* Reverso */}
          <article aria-label="Carnet de estudiante, reverso" className="relative flex aspect-[1.586/1] w-full max-w-[34rem] flex-col justify-between overflow-hidden rounded-[1.1rem] border border-[#b08f4f]/60 bg-[#fbf8ee] p-5 text-[#11271d] shadow-[var(--shadow-lg)] print:shadow-none">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-[#d8cfae] p-3"><p className="font-[var(--font-display)] text-3xl font-bold">{stats.enrolled}</p><p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#8a6d2f]">Cursos</p></div>
              <div className="rounded-lg border border-[#d8cfae] p-3"><p className="font-[var(--font-display)] text-3xl font-bold">{stats.certificates}</p><p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#8a6d2f]">Certificados</p></div>
              <div className="rounded-lg border border-[#d8cfae] p-3"><p className="font-[var(--font-display)] text-3xl font-bold">{year}</p><p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#8a6d2f]">Vigencia</p></div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="max-w-[16rem] text-[0.65rem] leading-relaxed text-[#4a5a52]">Este carnet identifica a su titular como estudiante de la Escuela Virtual de FEDEGÁN–FNG. Escanee el código para verificar su validez. Es personal e intransferible.</p>
              <div className="h-24 w-24 shrink-0 rounded-md border border-[#d8cfae] bg-white p-1.5" dangerouslySetInnerHTML={{ __html: qr }} aria-label="Código QR de verificación" role="img" />
            </div>
          </article>
    </>
  );
}
