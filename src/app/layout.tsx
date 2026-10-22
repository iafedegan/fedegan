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

export const viewport: Viewport = {
  themeColor: "#05100b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export const metadata: Metadata = {
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
      </head>
      <body className="min-h-full flex flex-col">
        {css && <style id="design-css" dangerouslySetInnerHTML={{ __html: css }} />}
        <Providers>
          <div className="read-progress" aria-hidden />
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
