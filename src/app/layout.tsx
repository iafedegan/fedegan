import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="esmeralda" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
