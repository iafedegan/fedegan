import type { ReactNode } from "react";

// Pictogramas propios del campo colombiano, dibujados a línea con un toque de relleno dorado.
// Todos comparten rejilla (48 × 48), trazo fino y terminaciones redondeadas.

export type PictogramName =
  | "pago"
  | "biologico"
  | "arete"
  | "sobre"
  | "res"
  | "porton"
  | "brotes"
  | "sello"
  | "libro"
  | "balanza"
  | "amanecer";

const shapes: Record<PictogramName, ReactNode> = {
  // Billete con espiga: la cuota de fomento
  pago: (
    <>
      <rect x="5" y="13" width="38" height="22" rx="2.5" className="pg-fill" />
      <rect x="5" y="13" width="38" height="22" rx="2.5" />
      <circle cx="24" cy="24" r="6" />
      <path d="M24 20.5v7M21.6 22.4c0-1.1 1-1.9 2.4-1.9s2.4.8 2.4 1.9-1 1.7-2.4 1.9-2.4.8-2.4 1.9 1 1.9 2.4 1.9 2.4-.8 2.4-1.9" strokeWidth="1.1" />
      <path d="M10 18.5v.01M38 29.5v.01" strokeWidth="2.4" />
    </>
  ),
  // Frasco de biológico con su gota
  biologico: (
    <>
      <path d="M18 11v6c-3.6 2.6-4 6-4 9v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V26c0-3-.4-6.400-4-9v-6" />
      <path d="M14 27h20v9a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3Z" className="pg-fill" />
      <path d="M17 6h14v5H17Z" />
      <path d="M24 29.500c-2 2.400-3 3.700-3 5a3 3 0 0 0 6 0c0-1.300-1-2.600-3-5Z" strokeWidth="1.2" />
    </>
  ),
  // Arete de identificación del ganado: el registro de vacunación
  arete: (
    <>
      <circle cx="24" cy="9" r="4" />
      <path d="M24 13v6" />
      <rect x="13" y="19" width="22" height="22" rx="4" className="pg-fill" />
      <rect x="13" y="19" width="22" height="22" rx="4" />
      <path d="M18 27h12M18 32h12M18 37h6" strokeWidth="1.3" />
    </>
  ),
  // Sobre con sello de lacre: PQRSD
  sobre: (
    <>
      <rect x="6" y="12" width="36" height="25" rx="2.5" className="pg-fill" />
      <rect x="6" y="12" width="36" height="25" rx="2.5" />
      <path d="M6.500 14l17.500 13 17.500-13" />
      <circle cx="24" cy="30" r="4.600" />
      <path d="M22.300 30l1.200 1.200 2.300-2.400" strokeWidth="1.2" />
    </>
  ),
  // Cabeza de res: inventario ganadero
  res: (
    <>
      <path d="M15 14c-4-2-6-5-6-9M33 14c4-2 6-5 6-9" />
      <path d="M13 19c-4-.8-7-.1-8.500 2 1.800 2.400 5.500 2.500 9 .6M35 19c4-.8 7-.1 8.500 2-1.800 2.400-5.500 2.500-9 .6" />
      <path d="M14 14.500c6-2.200 14-2.200 20 0l-3 20.500c-.5 4-3 6-7 6s-6.500-2-7-6Z" className="pg-fill" />
      <path d="M14 14.500c6-2.200 14-2.200 20 0l-3 20.500c-.5 4-3 6-7 6s-6.500-2-7-6Z" />
      <ellipse cx="24" cy="35.500" rx="5.500" ry="4" />
      <path d="M22.300 35.500v.01M25.700 35.500v.01M19.500 24v.01M28.500 24v.01" strokeWidth="2.200" />
    </>
  ),
  // Portón de finca: seguridad rural
  porton: (
    <>
      <path d="M8 40V8M40 40V8" strokeWidth="2.600" />
      <path d="M8 16h32M8 25h32M8 34h32" />
      <path d="M8 34L40 16" />
      <path d="M8 34L40 16" className="pg-fill" strokeWidth="0" />
      <path d="M14 40h20" strokeWidth="1.2" />
    </>
  ),
  // Manos que sostienen un brote: solidaridad
  brotes: (
    <>
      <path d="M5 29c1 6 6.500 11 19 11s18-5 19-11" />
      <path d="M5 29c4 1.500 9 3.500 19 3.500S39 30.500 43 29" className="pg-fill" />
      <path d="M24 32.500V19" />
      <path d="M24 24c-6 .6-9-2-9.500-8 6-.3 9.200 2.300 9.500 8Z" className="pg-fill" />
      <path d="M24 24c-6 .6-9-2-9.500-8 6-.3 9.200 2.300 9.500 8ZM24 19c0-5 3-8 9-8.500.4 6-2.500 8.800-9 8.500Z" />
    </>
  ),
  // Sello ambiental: hoja dentro de un sello
  sello: (
    <>
      <circle cx="24" cy="24" r="19" />
      <circle cx="24" cy="24" r="15.500" strokeDasharray="1.500 2.500" strokeWidth="1.200" />
      <path d="M24 34c-8-3-9.500-12-1-18 3-2 8-2.500 11-1.500-.5 9-3.500 15-10 19.500Z" className="pg-fill" />
      <path d="M24 34c-8-3-9.500-12-1-18 3-2 8-2.500 11-1.500-.5 9-3.500 15-10 19.500ZM24 34c1-5 3-9 7-12.500" />
    </>
  ),
  // Libro abierto con su marcador: metodología
  libro: (
    <>
      <path d="M5 13c6.500-2 13-1.600 19 2 6-3.600 12.500-4 19-2v23c-6.500-2-13-1.600-19 2-6-3.600-12.500-4-19-2Z" className="pg-fill" />
      <path d="M5 13c6.500-2 13-1.600 19 2 6-3.600 12.500-4 19-2v23c-6.500-2-13-1.600-19 2-6-3.600-12.500-4-19-2ZM24 15v23" />
      <path d="M30 6v12l3-2.500 3 2.500V8" strokeWidth="1.300" />
    </>
  ),
  // Sol sobre las lomas: visión y tierra
  amanecer: (
    <>
      <path d="M13 31a11 11 0 0 1 22 0Z" className="pg-fill" />
      <path d="M13 31a11 11 0 0 1 22 0" />
      <path d="M24 12v4M10.500 18.500l2.800 2.800M37.500 18.500l-2.800 2.800M4 31h6M38 31h6" />
      <path d="M4 37c7-4 12-4 20 0s13 4 20 0" />
      <path d="M4 43c7-4 12-4 20 0s13 4 20 0" strokeWidth="1.200" />
    </>
  ),
  // Balanza: buen gobierno
  balanza: (
    <>
      <path d="M24 7v33M15 41h18" />
      <path d="M9 13h30" />
      <circle cx="24" cy="9" r="2" />
      <path d="M9 13L4.500 26M9 13l4.500 13M39 13l-4.500 13M39 13l4.500 13" strokeWidth="1.200" />
      <path d="M3 26c1 5 4 6 6 6s5-1 6-6Z" className="pg-fill" />
      <path d="M33 26c1 5 4 6 6 6s5-1 6-6Z" className="pg-fill" />
      <path d="M3 26h12M33 26h12" />
    </>
  ),
};

export function Pictogram({ name, size = 40, className = "" }: { name: PictogramName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`pg ${className}`}
    >
      {shapes[name]}
    </svg>
  );
}
