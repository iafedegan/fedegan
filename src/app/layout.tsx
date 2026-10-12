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
    <html lang="es" data-theme="esmeralda" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {css && <style id="design-css" dangerouslySetInnerHTML={{ __html: css }} />}
        <Providers>
          <SiteChrome
            top={
              <>
                <a
                  href="#contenido"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--fg-lime-500)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-[var(--fg-green-900)]"
                >
                  Saltar al contenido
                </a>
                <Header nav={nav} />
              </>
            }
            bottom={
              <>
                <ChromeGate>
                  <Footer />
                </ChromeGate>
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
