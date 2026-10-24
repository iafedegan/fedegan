import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getNav } from "@/lib/cms/content";
import { Providers } from "@/components/layout/Providers";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { getPublishedDesign } from "@/lib/design/store";
import { designCss } from "@/lib/design/regions";
import { Ticker } from "@/components/design/Ticker";
import { AdSlot } from "@/components/design/AdSlot";
import { Masthead } from "@/components/layout/Masthead";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { SitePopup } from "@/components/design/SitePopup";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { WebVitals } from "@/components/layout/WebVitals";
import { SITE_URL } from "@/lib/site-url";
import { Analytics } from "@/components/layout/Analytics";
import { UsageTracker } from "@/components/layout/UsageTracker";

export const viewport: Viewport = {
  themeColor: "#05100b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "FEDEGÁN–FNG",
    url: "/",
    title: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos",
    description: "Noticias, programas, publicaciones, servicios y cifras del sector ganadero colombiano.",
    images: [{ url: "/brand/fedegan-icon-round.png", width: 512, height: 512, alt: "FEDEGÁN–FNG" }],
  },
  twitter: { card: "summary", title: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos", description: "Noticias, programas, publicaciones, servicios y cifras del sector ganadero colombiano.", images: ["/brand/fedegan-icon-round.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  applicationName: "FEDEGÁN–FNG",
  category: "agricultura",
  appleWebApp: { capable: true, title: "FEDEGÁN", statusBarStyle: "black-translucent" },
  title: {
    default: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos",
    template: "%s · FEDEGÁN–FNG",
  },
  description:
    "Portal institucional de FEDEGÁN–FNG, hub del ecosistema digital ganadero de Colombia: noticias, programas, publicaciones, servicios y cifras del sector.",
  icons: {
    icon: [{ url: "/brand/fedegan-icon-round.png", type: "image/png" }],
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
  const css = designCss(design);
  return (
    <html
      lang="es"
      data-theme="esmeralda"
      data-navbar={design.parts.navbar ?? "clasico"}
      data-footer={design.parts.footer ?? "completo"}
      data-hero={design.parts.hero ?? "izquierda"}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://pzaxysfoenujkdgotncb.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://contexto-olive.vercel.app" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col">
        {css && <style id="design-css" dangerouslySetInnerHTML={{ __html: css }} />}
        <Providers>
          <div className="read-progress" aria-hidden />
          <UsageTracker />
          <Analytics />
          <WebVitals />
          <ConsentBanner />
          <SiteChrome
            top={
              <>
                <a
                  href="#contenido"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--fg-lime-500)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-[var(--fg-green-900)]"
                >
                  Saltar al contenido
                </a>
                <Masthead />
                <Header nav={nav} />
                <Ticker initial={design.ticker} />
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
