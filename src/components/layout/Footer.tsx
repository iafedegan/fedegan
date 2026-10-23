import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/content/site";
import { aliados, contacto, legales, pqrsdForm, redes } from "@/content/accesos";
import { Logo } from "./Logo";
import { FooterAccess } from "./FooterAccess";
import { PrivacyButton } from "./PrivacyButton";
import { FacebookIcon, XIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { NewsletterForm } from "@/components/blocks/NewsletterForm";

const socialIcon = { facebook: FacebookIcon, x: XIcon, youtube: YoutubeIcon, instagram: InstagramIcon } as const;

const head = "mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)]";

export function Footer() {
  return (
    <footer data-region="footer" className="mt-16 bg-[var(--fg-green-900)] text-white/85">
      <Container className="grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1.5fr] xl:gap-x-12">
        <div className="flex flex-col gap-4">
          <div className="[&_span]:text-white [&_span:last-child]:text-white/60">
            <Logo />
          </div>
          <p className="text-sm leading-relaxed text-white/65">Lideramos el desarrollo sostenible de la ganadería colombiana.</p>
          <a
            href={pqrsdForm}
            target="_blank"
            rel="noopener noreferrer"
            className="group block max-w-xs overflow-hidden rounded-[var(--radius-md)] border border-white/15 transition-colors hover:border-[var(--fg-lime-400)]"
          >
            <span className="block bg-white/5 px-3 py-2 text-xs font-semibold text-white/80">Radique sus solicitudes en el formulario PQRSD</span>
            <Image src="/accesos/pqrsd.webp" alt="PQRSD: peticiones, quejas, reclamos, sugerencias y denuncias. Fondo Nacional del Ganado" width={960} height={344} className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
          </a>
          <ul className="flex gap-2.5">
            {redes.map((r) => {
              const Icon = socialIcon[r.id as keyof typeof socialIcon];
              return (
                <li key={r.id}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[var(--fg-lime-500)] hover:text-[var(--fg-green-900)]">
                    <Icon size={16} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h4 className={head}>Enlaces rápidos</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[...footerLinks.enlaces, { label: "Pagos, trámites y avisos", href: "/accesos" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 transition-colors hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={head}>Servicios destacados</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {footerLinks.servicios.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 transition-colors hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
          <h4 className={`${head} mt-8`}>Portales aliados</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {aliados.map((a) => (
              <li key={a.href}>
                <a href={a.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/75 transition-colors hover:text-white">
                  {a.label} <ArrowUpRight size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={head}>Contacto y canales oficiales</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-white/75">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" />{contacto.direccion}</li>
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0" /><a href={contacto.telefonoHref} className="hover:text-white">{contacto.telefono}</a></li>
            <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0" />{contacto.horario}</li>
          </ul>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {contacto.correos.map((c) => (
              <li key={c.email} className="rounded-[var(--radius-sm)] border border-white/12 p-3">
                <p className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]"><Mail size={12} />{c.label}</p>
                <a href={`mailto:${c.email}`} className="mt-1 block break-all text-sm font-semibold text-white hover:text-[var(--fg-lime-400)]">{c.email}</a>
                <p className="mt-1 text-xs leading-snug text-white/55">{c.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <h4 className={head}>Suscríbase al boletín</h4>
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/12">
        <Container className="flex flex-col gap-4 py-5 text-xs text-white/60 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <span>© 2012 – 2026 FEDEGÁN–FNG. Todos los derechos reservados.</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {legales.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
            <Link href="/mapa-del-sitio" className="hover:text-white">Mapa del sitio</Link>
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white">Términos</Link>
            <Link href="/transparencia" className="hover:text-white">Transparencia</Link>
            <Link href="/contacto" className="hover:text-white">Contacto</Link>
            <FooterAccess />
            <PrivacyButton className="hover:text-white" />
            <a href="https://www.gov.co/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-3 py-1 font-bold tracking-[0.08em] text-white hover:border-[var(--fg-lime-400)]">GOV.CO</a>
            <span>Realizado por <a href="http://interlat.co/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--fg-lime-400)] hover:underline">Interlat.co</a></span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
