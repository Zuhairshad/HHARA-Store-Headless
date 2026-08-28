import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono, Mr_De_Haviland } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
const mrDeHaviland = Mr_De_Haviland({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-signature",
});

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hhara-store-headless.vercel.app"),
  title: "HHARA | She is Wonder",
  description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
  keywords: ["HHARA", "Considered Luxury", "Activewear", "Recycled Performance Wear", "UAE Activewear", "Maison HHARA", "Imara Set", "Dahlia Set"],
  icons: {
    icon: "/images/monkey-logo.jpg",
  },
  openGraph: {
    title: "HHARA | She is Wonder",
    description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
    url: "https://hhara-store-headless.vercel.app",
    siteName: "HHARA",
    images: [
      {
        url: "/images/hero1.jpg",
        width: 1200,
        height: 630,
        alt: "HHARA | She is Wonder Capsule Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HHARA | She is Wonder",
    description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
    images: ["/images/hero1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "p:domain_verify": "0dc9f529f63919981bd143dd195a7fd9",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} ${jetbrains.variable} ${mrDeHaviland.variable}`}>
      <body>
        <AnalyticsProvider>
          {children}
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
