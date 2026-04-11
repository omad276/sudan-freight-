import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import PWAInstall from "./pwa-install";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "واصل | Wassel",
  description: "منصة الشحن الرائدة في السودان - نربط أصحاب البضائع بالناقلين الموثوقين",
  keywords: ["واصل", "شحن", "السودان", "نقل", "شاحنات", "wassel", "freight", "sudan", "logistics"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "واصل",
  },
  applicationName: "واصل",
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1E3A8A",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <PWAInstall />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
