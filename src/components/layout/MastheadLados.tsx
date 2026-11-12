"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { redes } from "@/content/accesos";
import { FacebookIcon, XIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

const iconos = { facebook: FacebookIcon, x: XIcon, youtube: YoutubeIcon, instagram: InstagramIcon } as const;

// Cabezote en escritorio: redes sociales a la izquierda y el ingreso a la derecha, a los lados del logo.
export function MastheadLados() {
  const { data: session } = useSession();
  return (
    <>
      <ul className="mh-lado mh-lado-l" aria-label="Redes sociales">
        {redes.map((r) => {
          const Icono = iconos[r.id as keyof typeof iconos];
          return Icono ? (
            <li key={r.id}>
              <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.label} className="mh-social"><Icono size={16} /></a>
            </li>
          ) : null;
        })}
      </ul>
      <div className="mh-lado mh-lado-r">
        <Link href={session?.user ? "/mi-fedegan" : "/ingresar"} aria-label={session?.user ? "Mi FEDEGÁN" : "Ingresar"} title={session?.user ? "Mi FEDEGÁN" : "Ingresar"} className="mh-ico">
          <UserRound size={16} strokeWidth={1.9} aria-hidden />
        </Link>
        <ThemeToggle className="mh-ico" />
      </div>
    </>
  );
}
