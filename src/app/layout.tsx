import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Spectral } from "next/font/google";
import "./globals.css";
import "./funciones.css";
import { MARCA_CSS } from "@/lib/design/marca-css";
import "./templates.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getNav } from "@/lib/cms/content";
import { getMenuGrupos } from "@/lib/menu-movil";
import { getSection } from "@/lib/cms/nodos";
import { getLegacyPage, legacyHref, type NavNode } from "@/content/legacy";
import { Providers } from "@/components/layout/Providers";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ElementEdits } from "@/components/design/ElementEdits";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { getPublishedDesign } from "@/lib/design/store";
import { designCss, sortNav, TEMPLATE_BY_ID } from "@/lib/design/regions";
import { Ticker } from "@/components/design/Ticker";
import { AdSlot } from "@/components/design/AdSlot";
import { CifrasBar } from "@/components/layout/CifrasBar";
import { Masthead } from "@/components/layout/Masthead";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { ThemeRoute } from "@/components/layout/ThemeRoute";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { SitePopup } from "@/components/design/SitePopup";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { WebVitals } from "@/components/layout/WebVitals";
import { SITE_URL } from "@/lib/site-url";
import { Analytics } from "@/components/layout/Analytics";
import { UsageTracker } from "@/components/layout/UsageTracker";

export const viewport: Viewport = {
  themeColor: "#071b13",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Fuentes servidas por el propio sitio (next/font): sin la cadena CSS → Google → archivos que bloqueaba el primer pintado.
const fBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--ff-body", display: "swap" });
const fDisplay = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--ff-display", display: "swap" });
// Spectral (6 archivos) y la monoespaciada no se precargan: se piden al usarse y dejan el ancho de banda inicial a la foto de portada.
const fRead = Spectral({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--ff-read", display: "swap", preload: false });
const fMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--ff-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "FEDEGÁN",
    url: "/",
    title: "FEDEGÁN · Federación Colombiana de Ganaderos",
    description: "Noticias, programas, publicaciones, servicios y cifras del sector ganadero colombiano.",
    images: [{ url: "/brand/fedegan-icon-round.png", width: 512, height: 512, alt: "FEDEGÁN" }],
  },
  twitter: { card: "summary", title: "FEDEGÁN · Federación Colombiana de Ganaderos", description: "Noticias, programas, publicaciones, servicios y cifras del sector ganadero colombiano.", images: ["/brand/fedegan-icon-round.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  applicationName: "FEDEGÁN",
  category: "agricultura",
  appleWebApp: { capable: true, title: "FEDEGÁN", statusBarStyle: "black-translucent" },
  title: {
    default: "FEDEGÁN · Federación Colombiana de Ganaderos",
    template: "%s · FEDEGÁN",
  },
  description:
    "Portal institucional de FEDEGÁN, hub del ecosistema digital ganadero de Colombia: noticias, programas, publicaciones, servicios y cifras del sector.",
  icons: {
    icon: [
      { url: "/brand/fedegan-icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/brand/fedegan-icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/brand/fedegan-icon-round.png",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/fedegan-icon-round.png`,
  address: { "@type": "PostalAddress", streetAddress: "Calle 37 # 14-31", addressLocality: "Bogotá D.C.", addressCountry: "CO" },
  sameAs: ["https://www.instagram.com/fedegan_col/", "http://www.youtube.com/user/FEDEGANFNG"],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FEDEGÁN–FNG",
  url: SITE_URL,
  inLanguage: "es-CO",
  publisher: { "@type": "Organization", name: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos" },
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/buscador?q={search_term_string}` }, "query-input": "required name=search_term_string" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [nav, design] = await Promise.all([getNav(), getPublishedDesign()]);
  // Cada opción que lleva a una sección muestra sus páginas al pasar el mouse.
  type Sub = { label: string; href: string; children?: Sub[] };
  // Este menú viaja en TODAS las páginas: se recorta a 3 niveles (opciones, su panel al costado y el siguiente) y a 12 entradas por lista (con un enlace «Ver las N páginas»).
  // Antes mandaba cientos de páginas de la columna del presidente, las cartas y las publicaciones en cada visita (unos 200 KB).
  const MAX_ENTRADAS = 12;
  const SOLO_ENLACE = /^\s*(?:\*\*)?\[([^\]]+)\]\((\/seccion\/[^)\s]+)\)(?:\*\*)?\s*$/;
  const enlacesDePagina = (key: string): Sub[] =>
    (getLegacyPage(key)?.blocks ?? []).flatMap((b) => {
      const m = b.t === "p" ? SOLO_ENLACE.exec(b.text ?? "") : null;
      return m ? [{ label: m[1].replace(/\*\*/g, "").trim(), href: m[2] }] : [];
    });
  const subs = (nodes: NavNode[], slug: string, verTodas: string, nivel = 1): Sub[] => {
    const lista = nodes.flatMap((n) => {
      const href = n.key ? legacyHref(slug, n.key) : n.href;
      if (!href) return [];
      if (n.children?.length && nivel < 3) return [{ label: n.label, href, children: subs(n.children, slug, href, nivel + 1) }];
      // Página sin subpáginas en el árbol pero cuyo contenido es una lista de enlaces (capítulos de los Estatutos…): esos enlaces son su submenú.
      const enLista = nivel < 3 && n.key ? enlacesDePagina(n.key) : [];
      return [{ label: n.label, href, ...(enLista.length >= 2 ? { children: enLista.slice(0, MAX_ENTRADAS) } : {}) }];
    });
    return lista.length > MAX_ENTRADAS ? [...lista.slice(0, MAX_ENTRADAS), { label: `Ver las ${lista.length} páginas →`, href: verTodas }] : lista;
  };
  const navConHijos = await Promise.all(
    nav.map(async (it) => {
      // «Quiénes somos» vive en /quienes-somos pero es una sección del árbol: también despliega sus páginas.
      const slug = /^\/seccion\/([^/?#]+)\/?$/.exec(it.href)?.[1] ?? (it.href === "/quienes-somos" ? "quienes-somos" : undefined);
      const section = slug ? await getSection(slug).catch(() => null) : null;
      const children = section && slug ? subs(section.tree, slug, it.href) : [];
      return children.length ? { ...it, children } : it;
    }),
  );
  // Menú único de celular y tableta: menú principal + secciones del recorrido + aliados, agrupado y sin repetir.
  const menuGrupos = await getMenuGrupos(sortNav(nav, design.order));
  const css = designCss(design);
  const tpl = design.template ? TEMPLATE_BY_ID[design.template] : null;
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      data-tpl-mode={tpl?.mode}
      data-theme="esmeralda"
      data-navbar={design.parts.navbar ?? "clasico"}
      data-footer={design.parts.footer ?? "completo"}
      data-hero={design.parts.hero ?? "izquierda"}
      className={`h-full antialiased ${fBody.variable} ${fDisplay.variable} ${fRead.variable} ${fMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {tpl?.fonts && <link rel="stylesheet" href={tpl.fonts} />}
        <link rel="preconnect" href="https://pzaxysfoenujkdgotncb.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://contexto-olive.vercel.app" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col">
        {design.template === "marca" && <style id="tpl-marca" dangerouslySetInnerHTML={{ __html: MARCA_CSS }} />}
        {css && <style id="design-css" dangerouslySetInnerHTML={{ __html: css }} />}
        <Providers>
          <ElementEdits initial={design.elements} />
          <div className="read-progress" aria-hidden />
          <ThemeRoute />
          <UsageTracker />
          <Analytics />
          <WebVitals />
          <ConsentBanner />
          <SiteChrome
            template={tpl?.id}
            top={
              <>
                <a
                  href="#contenido"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--fg-lime-500)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-[var(--fg-green-900)]"
                >
                  Saltar al contenido
                </a>
                <ChromeGate en={["/formularios"]}>
                  <CifrasBar />
                </ChromeGate>
                <Masthead />
                {/* En los formularios públicos no se muestra el menú: quien responde se queda en el formulario. */}
                <ChromeGate en={["/formularios"]}>
                  <Header nav={sortNav(navConHijos, design.order)} grupos={menuGrupos} />
                </ChromeGate>
                <ChromeGate en={["/formularios"]}>
                  <Ticker initial={design.ticker} />
                </ChromeGate>
                <AdSlot zone="top" initial={design.ads.top} />
              </>
            }
            bottom={
              <>
                <AdSlot zone="bottom" initial={design.ads.bottom} />
                <ChromeGate>
                  <Footer />
                </ChromeGate>
                <SitePopup initial={design.popup} />
                <PwaRegister build={process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "local"} />
                <BackToTop />
                <MobileTabBar />
              </>
            }
          >
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
