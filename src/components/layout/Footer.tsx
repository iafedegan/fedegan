import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/content/site";
import { Logo } from "./Logo";
import { FacebookIcon, XIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { NewsletterForm } from "@/components/blocks/NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-[var(--fg-green-900)] text-white/85 mt-16">
      <Container className="py-14 grid gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1 flex flex-col gap-3">
          <div className="[&_span]:text-white [&_span:last-child]:text-white/60">
            <Logo />
          </div>
          <p className="text-sm text-white/65 leading-relaxed mt-1">
            Lideramos el desarrollo sostenible de la ganadería colombiana.
          </p>
          <div className="flex gap-3 mt-1">
            {[FacebookIcon, XIcon, InstagramIcon, YoutubeIcon, LinkedinIcon].map((Icon, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Icon size={15} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)] mb-3.5">
            Enlaces rápidos
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {footerLinks.enlaces.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)] mb-3.5">
            Servicios destacados
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {footerLinks.servicios.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h4 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)] mb-3.5">
            Información de contacto
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-white/75">
            <li className="flex gap-2.5"><MapPin size={16} className="shrink-0 mt-0.5" /> Calle 37 # 14 - 31, Bogotá D.C., Colombia</li>
            <li className="flex gap-2.5"><Phone size={16} className="shrink-0 mt-0.5" /> (601) 578 2020</li>
            <li className="flex gap-2.5"><Mail size={16} className="shrink-0 mt-0.5" /> fedegan@fedegan.org.co</li>
            <li className="flex gap-2.5"><Clock size={16} className="shrink-0 mt-0.5" /> Lunes a viernes, 8:00 a.m. a 5:00 p.m.</li>
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h4 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)] mb-3.5">
            Suscríbase al boletín
          </h4>
          <p className="text-sm text-white/70 mb-3">
            Reciba noticias, publicaciones y eventos del sector ganadero en su correo.
          </p>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-white/12">
        <Container className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/55">
          <span>© 2026 FEDEGÁN–FNG. Todos los derechos reservados.</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/politica-de-privacidad" className="hover:text-white">Política de privacidad</Link>
            <Link href="/terminos-y-condiciones" className="hover:text-white">Términos y condiciones</Link>
            <Link href="/mapa-del-sitio" className="hover:text-white">Mapa del sitio</Link>
            <Link href="/transparencia" className="hover:text-white">Transparencia</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
