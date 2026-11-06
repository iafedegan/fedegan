import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/content/site";
import { contacto, legales, pqrsdForm, redes } from "@/content/accesos";
import { getPartners } from "@/lib/cms/content";
import { canOptimize } from "@/lib/image-host";
import { FooterAccess } from "./FooterAccess";
import { PrivacyButton } from "./PrivacyButton";
import { FacebookIcon, XIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { NewsletterForm } from "@/components/blocks/NewsletterForm";

const socialIcon = { facebook: FacebookIcon, x: XIcon, youtube: YoutubeIcon, instagram: InstagramIcon } as const;

const head = "mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)]";

// Pie de página: mismo verde de la barra de navegación, con el logo de FEDEGÁN y los portales aliados con sus logos.
export async function Footer() {
  const partners = await getPartners();
  return (
    <footer data-region="footer" className="mt-16 bg-[#72bf44] text-white/85">
      <Container className="grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.2fr_1.1fr] xl:gap-x-12">
        <div className="flex flex-col gap-4">
          <Link href="/" aria-label="FEDEGÁN FNG, inicio" className="w-fit">
            <Image src="/brand/fedegan-horizontal-desc-blanco.svg" alt="FEDEGÁN, Federación Colombiana de Ganaderos" width={917} height={329} unoptimized className="h-24 w-auto" />
          </Link>
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
        </div>

        <div>
          <h4 className={head}>Contacto</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-white/75">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" />{contacto.direccion}</li>
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0" /><a href={contacto.telefonoHref} className="hover:text-white">{contacto.telefono}</a></li>
            <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0" />{contacto.horario}</li>
          </ul>
          <ul className="mt-5 flex flex-col divide-y divide-[rgba(16,36,15,0.22)] border-t border-white/22">
            {contacto.correos.map((c) => (
              <li key={c.email} className="py-2.5">
                <p className="flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]"><Mail size={12} />{c.label}</p>
                <a href={`mailto:${c.email}`} className="mt-0.5 block break-words text-sm font-semibold text-white hover:underline">{c.email}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={head}>Suscríbase a nuestro boletín</h4>
          <p className="mb-3 text-sm text-white/75">Reciba noticias, publicaciones y eventos del sector ganadero en su correo.</p>
          <NewsletterForm />
        </div>
      </Container>

      {partners.length > 0 && (
        <div className="ft-allies border-t border-white/12">
          <Container className="py-9">
            <h4 className={`${head} text-center`}>Portales aliados</h4>
            <ul className="mt-6 flex flex-wrap items-start justify-center gap-x-9 gap-y-7">
              {partners.map((p) => (
                <li key={p.href}>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.nombre}${p.detalle ? `: ${p.detalle}` : ""} (se abre en otra pestaña)`} className="group flex w-28 flex-col items-center gap-2.5 text-center">
                    <span className="relative block h-24 w-24 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/15 transition duration-300 group-hover:scale-105 group-hover:ring-[var(--fg-lime-400)] sm:h-28 sm:w-28">
                      <Image src={p.logo} alt="" fill sizes="112px" unoptimized={!canOptimize(p.logo)} className="object-cover" />
                    </span>
                    <span className="text-xs font-semibold leading-tight text-white/75 transition-colors group-hover:text-white">{p.nombre}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}

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
