import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeScope } from "@/components/layout/ThemeScope";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "FEDEGÁN–FNG · Federación Colombiana de Ganaderos",
    template: "%s · FEDEGÁN–FNG",
  },
  description:
    "Portal institucional de FEDEGÁN–FNG, hub del ecosistema digital ganadero de Colombia: noticias, programas, publicaciones, servicios y cifras del sector.",
  icons: {
    icon: "/brand/fedegan-logo.jpg",
    apple: "/brand/fedegan-logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
        <ThemeScope>
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeScope>
        </Providers>
      </body>
    </html>
  );
}
