"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

// Acceso a la cuenta como un enlace más del pie: «Ingresar», o «Mi FEDEGÁN» con la sesión iniciada.
export function FooterAccess() {
  const { data: session } = useSession();
  return session?.user ? (
    <Link href="/mi-fedegan" className="hover:text-white">Mi FEDEGÁN</Link>
  ) : (
    <Link href="/ingresar" className="hover:text-white">Ingresar</Link>
  );
}
